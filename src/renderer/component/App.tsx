import * as React from "react";
import * as fs from "fs";
import * as path from "path";
import { remote } from "electron";
import { exec, ChildProcess } from "child_process";
import { Launcher, LauncherProcess, ProcessState } from "../models";
import { LauncherList } from "./LauncherList";
import { LauncherDetail } from "./LauncherDetail";
import "./App.scss";

export interface AppState {
    launchers: Launcher[];
    activeLauncherIndex: number;
    launcherProcesses: Map<number, LauncherProcess>;
}

export class App extends React.Component<{}, AppState> {
    state = {
        launchers: [] as Launcher[],
        activeLauncherIndex: 0,
        launcherProcesses: new Map<number, LauncherProcess>()
    };

    processes = new Map<number, ChildProcess>();

    constructor(props: {}, context?: any) {
        super(props, context);

        this.startScript = this.startScript.bind(this);
        this.stopScript = this.stopScript.bind(this);
        this.restartScript = this.restartScript.bind(this);
        this.activate = this.activate.bind(this);

        this.loadLaunchers();
    }

    updateLauncherProcess(launcher: Launcher, newProcess: LauncherProcess) {
        this.setState({
            launcherProcesses: new Map<number, LauncherProcess>(
                this.state.launcherProcesses
            ).set(launcher.key, newProcess)
        });
    }

    activeLauncherProcess(launcher: Launcher) {
        return this.state.launcherProcesses.get(
            launcher.key
        ) as LauncherProcess;
    }
    startScript(launcher: Launcher) {
        const launcherProcess = this.activeLauncherProcess(launcher);

        this.updateLauncherProcess(
            launcher,
            Object.assign({}, launcherProcess, {
                stdout: "",
                stderr: "",
                log: "",
                processState: ProcessState.Running
            } as LauncherProcess)
        );

        const process = exec(`cd ${launcher.directory} && ${launcher.command}`);
        this.processes.set(launcher.key, process);

        process.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
            const launcherProcess = this.activeLauncherProcess(launcher);
            this.updateLauncherProcess(
                launcher,
                Object.assign({}, launcherProcess, {
                    stdout: launcherProcess.stdout + data,
                    log: launcherProcess.log + data
                })
            );
        });

        process.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
            const launcherProcess = this.activeLauncherProcess(launcher);
            this.updateLauncherProcess(
                launcher,
                Object.assign({}, launcherProcess, {
                    stderr: launcherProcess.stderr + data,
                    log: launcherProcess.log + data
                })
            );
        });

        process.on("close", code => {
            console.log(`child process exited with code ${code}`);
            const launcherProcess = this.activeLauncherProcess(launcher);

            if (launcherProcess.restarting) {
                this.startScript(launcher);
            } else {
                this.updateLauncherProcess(
                    launcher,
                    Object.assign({}, launcherProcess, {
                        processState: ProcessState.Stopped
                    })
                );
            }
        });
    }

    stopScript(launcher: Launcher, restart: boolean = false) {
        const process = this.processes.get(launcher.key);
        if (process != null) {
            const launcherProcess = this.state.launcherProcesses.get(
                launcher.key
            ) as LauncherProcess;

            this.updateLauncherProcess(
                launcher,
                Object.assign({}, launcherProcess, {
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

    getLaunchersPath() {
        return path.join(remote.app.getPath("userData"), "launchers.json");
    }

    saveLaunchers() {
        const launchersPath = this.getLaunchersPath();
        console.log(launchersPath);
        fs.writeFileSync(launchersPath, JSON.stringify(this.state.launchers));
    }

    loadLaunchers() {
        const launchersPath = this.getLaunchersPath();
        console.log(launchersPath);
        if (fs.existsSync(launchersPath)) {
            this.state.launchers = JSON.parse(
                fs.readFileSync(launchersPath, "utf-8")
            );

            // Fill initial value of launcherProcesses
            this.state.launchers.forEach(launcher => {
                this.state.launcherProcesses.set(launcher.key, {
                    stdout: "",
                    stderr: "",
                    log: "",
                    processState: ProcessState.Stopped
                } as LauncherProcess);
            });
        }
    }

    render() {
        const activeLauncher = this.state.launchers[
            this.state.activeLauncherIndex
        ];
        const activeLauncherProcess =
            activeLauncher === undefined
                ? undefined
                : (this.state.launcherProcesses.get(
                      activeLauncher.key
                  ) as LauncherProcess);

        return (
            <div className="app">
                <LauncherList
                    launchers={this.state.launchers}
                    activeLauncherIndex={this.state.activeLauncherIndex}
                    launcherProcesses={this.state.launcherProcesses}
                    activate={this.activate}
                />
                <LauncherDetail
                    launcher={activeLauncher}
                    launcherProcess={activeLauncherProcess}
                    startScript={this.startScript}
                    stopScript={this.stopScript}
                    restartScript={this.restartScript}
                />
            </div>
        );
    }
}
