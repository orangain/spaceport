import * as React from "react";
import * as fs from "fs";
import * as path from "path";
import * as treeKill from "tree-kill";
import { remote } from "electron";
import { exec, ChildProcess } from "child_process";
import {
  Launcher,
  LauncherProcess,
  ProcessState,
  LauncherConfig
} from "../models";
import { LauncherList } from "./LauncherList";
import { LauncherDetail } from "./LauncherDetail";
import "../../../static/photon-0.1.2-dist/css/photon.min.css";
import "./App.scss";

export interface AppState {
  launchers: Launcher[];
  activeLauncherIndex: number;
}

export class App extends React.Component<{}, AppState> {
  state = {
    launchers: [] as Launcher[],
    activeLauncherIndex: 0
  };

  processes = new Map<number, ChildProcess>();

  constructor(props: {}, context?: any) {
    super(props, context);

    this.startScript = this.startScript.bind(this);
    this.stopScript = this.stopScript.bind(this);
    this.restartScript = this.restartScript.bind(this);
    this.activate = this.activate.bind(this);
    this.updateLauncherConfig = this.updateLauncherConfig.bind(this);
    this.addLauncher = this.addLauncher.bind(this);
    this.removeLauncher = this.removeLauncher.bind(this);
    this.onUnload = this.onUnload.bind(this);

    this.loadLaunchers();
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.onUnload);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onUnload);
  }

  onUnload() {
    this.state.launchers.forEach(launcher => {
      console.log(launcher.config.name);
      this.stopScript(launcher);
    });
  }

  indexOfLauncher(key: number) {
    return this.state.launchers.findIndex(launcher => launcher.key === key);
  }

  getLauncherByKey(key: number) {
    return this.state.launchers[this.indexOfLauncher(key)];
  }

  updateLauncher(newLauncher: Launcher, callback?: () => void) {
    const index = this.indexOfLauncher(newLauncher.key);
    this.setState(
      {
        launchers: [
          ...this.state.launchers.slice(0, index),
          newLauncher,
          ...this.state.launchers.slice(index + 1)
        ]
      },
      callback
    );
  }

  updateLauncherProcess(launcher: Launcher, newProcess: LauncherProcess) {
    this.updateLauncher(
      Object.assign({}, launcher, {
        process: newProcess
      })
    );
  }

  updateLauncherConfig(launcher: Launcher, newConfig: LauncherConfig) {
    this.updateLauncher(
      Object.assign({}, launcher, {
        config: newConfig
      }),
      () => {
        this.saveLaunchers();
      }
    );
  }

  startScript(launcher: Launcher) {
    const key = launcher.key;
    this.updateLauncherProcess(
      launcher,
      Object.assign({}, launcher.process, {
        stdout: "",
        stderr: "",
        log: "",
        processState: ProcessState.Running
      } as LauncherProcess)
    );

    const launcherConfig = launcher.config;
    const p = exec(
      `cd ${launcherConfig.directory} && ${launcherConfig.command}`
    );
    this.processes.set(launcher.key, p);
    console.log(p.pid);

    p.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      // launcher object in parent scope may no longer be what you expected
      const launcher = this.getLauncherByKey(key);
      this.updateLauncherProcess(
        launcher,
        Object.assign({}, launcher.process, {
          stdout: launcher.process.stdout + data,
          log: launcher.process.log + data
        })
      );
    });

    p.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
      const launcher = this.getLauncherByKey(key);
      this.updateLauncherProcess(
        launcher,
        Object.assign({}, launcher.process, {
          stderr: launcher.process.stderr + data,
          log: launcher.process.log + data
        })
      );
    });

    p.on("close", code => {
      console.log(`child process exited with code ${code}`);
      const launcher = this.getLauncherByKey(key);

      if (launcher.process.restarting) {
        this.startScript(launcher);
      } else {
        this.updateLauncherProcess(
          launcher,
          Object.assign({}, launcher.process, {
            processState: ProcessState.Stopped
          })
        );
      }
    });
  }

  stopScript(launcher: Launcher, restart: boolean = false) {
    const p = this.processes.get(launcher.key);
    if (p != null) {
      this.updateLauncherProcess(
        launcher,
        Object.assign({}, launcher.process, {
          processState: ProcessState.Stopping,
          restarting: restart
        })
      );

      // Kill all child processes
      treeKill(p.pid, undefined, (err?: Error) => {
        console.log(err);
      });

      this.processes.delete(launcher.key);
    }
  }

  restartScript(launcher: Launcher) {
    this.stopScript(launcher, true);
  }

  activate(index: number) {
    this.setState({
      activeLauncherIndex: index
    });
  }

  addLauncher() {
    const newIndex = this.state.launchers.length;
    this.setState(
      {
        launchers: [
          ...this.state.launchers,
          {
            key: newIndex,
            config: {
              name: "",
              directory: "",
              command: ""
            } as LauncherConfig,
            process: {} as LauncherProcess
          }
        ],
        activeLauncherIndex: newIndex
      },
      () => {
        this.saveLaunchers();
      }
    );
  }

  removeLauncher(index: number) {
    this.setState(
      {
        launchers: [
          ...this.state.launchers.slice(0, index),
          ...this.state.launchers.slice(index + 1)
        ],
        activeLauncherIndex: Math.min(
          this.state.activeLauncherIndex,
          this.state.launchers.length - 2
        )
      },
      () => {
        this.saveLaunchers();
      }
    );
  }

  getLauncherConfigsPath() {
    return path.join(remote.app.getPath("userData"), "launchers.json");
  }

  saveLaunchers() {
    const launcherConfigsPath = this.getLauncherConfigsPath();
    const launcherConfigs = this.state.launchers.map(
      launcher => launcher.config
    );
    console.log(launcherConfigsPath);
    fs.writeFileSync(launcherConfigsPath, JSON.stringify(launcherConfigs));
  }

  loadLaunchers() {
    const launcherConfigsPath = this.getLauncherConfigsPath();
    console.log(launcherConfigsPath);
    let launcherConfigs = [] as LauncherConfig[];
    launcherConfigs = [
      {
        name: "sample",
        directory: "~/terminarun",
        command: "while true; do echo `date`; sleep 1; done"
      },
      {
        name: "sample2",
        directory: "~/terminarun",
        command: "while true; do echo `date`; sleep 1; done"
      }
    ];
    if (fs.existsSync(launcherConfigsPath)) {
      launcherConfigs = JSON.parse(
        fs.readFileSync(launcherConfigsPath, "utf-8")
      );
    }

    // Fill initial value of launcherProcesses
    this.state.launchers = launcherConfigs.map((launcherConfig, i) => {
      return {
        key: i,
        config: launcherConfig,
        process: {
          stdout: "",
          stderr: "",
          log: "",
          processState: ProcessState.Stopped
        } as LauncherProcess
      } as Launcher;
    });
  }

  render() {
    const activeLauncher = this.state.launchers[this.state.activeLauncherIndex];

    return (
      <div className="window">
        <div className="window-content">
          <div className="pane-group">
            <div className="pane-sm sidebar">
              <LauncherList
                launchers={this.state.launchers}
                activeLauncherIndex={this.state.activeLauncherIndex}
                activate={this.activate}
                removeLauncher={this.removeLauncher}
              />
            </div>
            <div className="pane">
              {activeLauncher === undefined ? (
                <div className="launcher-detail">
                  <p>コマンドを追加してください。</p>
                </div>
              ) : (
                <LauncherDetail
                  launcher={activeLauncher}
                  startScript={this.startScript}
                  stopScript={this.stopScript}
                  restartScript={this.restartScript}
                  updateLauncherConfig={this.updateLauncherConfig}
                />
              )}
            </div>
          </div>
        </div>
        <footer className="toolbar toolbar-footer">
          <div className="toolbar-actions">
            <button onClick={this.addLauncher} className="btn btn-default">
              <span className="icon icon-plus" /> 追加
            </button>
          </div>
        </footer>
      </div>
    );
  }
}
