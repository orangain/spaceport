import * as React from "react";
import * as fs from "fs";
import * as path from "path";
import { remote } from "electron";
import { exec, ChildProcess } from "child_process";
import { Launcher, LauncherProcess, ProcessState, LauncherConfig } from "../models";
import { LauncherList } from "./LauncherList";
import { LauncherDetail } from "./LauncherDetail";
import "./App.scss";

export interface AppState {
    launchers: Launcher[];
    activeLauncherIndex: number;
}

export class App extends React.Component<{}, AppState> {
    state = {
        launchers: [] as Launcher[],
        activeLauncherIndex: 0,
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

        this.loadLaunchers();
    }

    indexOfLauncher(key: number) {
        return this.state.launchers.findIndex(launcher => launcher.key === key);
    }

    getLauncherByKey(key: number) {
        return this.state.launchers[this.indexOfLauncher(key)];
    }

    updateLauncher(newLauncher: Launcher) {
        const index = this.indexOfLauncher(newLauncher.key);
        this.setState({
            launchers: [
                ...this.state.launchers.slice(0, index),
                newLauncher,
                ...this.state.launchers.slice(index + 1),
            ]
        });
    }

    updateLauncherProcess(launcher: Launcher, newProcess: LauncherProcess) {
        this.updateLauncher(Object.assign({}, launcher, {
            process: newProcess
        }));
    }

    updateLauncherConfig(launcher: Launcher, newConfig: LauncherConfig) {
        this.updateLauncher(Object.assign({}, launcher, {
            config: newConfig
        }));
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
        const process = exec(`cd ${launcherConfig.directory} && ${launcherConfig.command}`);
        this.processes.set(launcher.key, process);

        process.stdout.on("data", data => {
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

        process.stderr.on("data", data => {
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

        process.on("close", code => {
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
        const process = this.processes.get(launcher.key);
        if (process != null) {
            this.updateLauncherProcess(
                launcher,
                Object.assign({}, launcher.process, {
                    processState: ProcessState.Stopping,
                    restarting: restart
                })
            );
            process.kill();
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
        this.setState({
            launchers: [...this.state.launchers, {
                key: newIndex,
                config: {
                    name: '',
                    directory: '',
                    command: '',
                } as LauncherConfig,
                process: {} as LauncherProcess
            }],
            activeLauncherIndex: newIndex,
        });
    }

    getLauncherConfigsPath() {
        return path.join(remote.app.getPath("userData"), "launchers.json");
    }

    saveLaunchers() {
        const launcherConfigsPath = this.getLauncherConfigsPath();
        console.log(launcherConfigsPath);
        fs.writeFileSync(launcherConfigsPath, JSON.stringify(this.state.launchers));
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
        const activeLauncher = this.state.launchers[
            this.state.activeLauncherIndex
        ];

        return (
            <div className="app">
                <div>
                    <LauncherList
                        launchers={this.state.launchers}
                        activeLauncherIndex={this.state.activeLauncherIndex}
                        activate={this.activate}
                    />
                    <button onClick={this.addLauncher}>Add</button>
                </div>
                <div>{
                    activeLauncher === null ?
                        <div className="launcher-detail">
                            <p>コマンドを追加してください。</p>
                        </div> :
                        <LauncherDetail
                            launcher={activeLauncher}
                            startScript={this.startScript}
                            stopScript={this.stopScript}
                            restartScript={this.restartScript}
                            updateLauncherConfig={this.updateLauncherConfig}
                        />}
                </div>
            </div>
        );
    }
}
