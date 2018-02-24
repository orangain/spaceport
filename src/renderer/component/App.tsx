import * as React from "react";
import { exec, ChildProcess } from "child_process";
import "./App.css";

export interface AppState {
    command: string;
    stdout: string;
    stderr: string;
    log: string;
    processState: ProcessState;
    restarting: boolean;
}

export enum ProcessState {
    Stopped = 0,
    Running,
    Failed,
    Stopping
}

export class App extends React.Component<{}, AppState> {
    state = {
        command: `while true; do date; sleep 1s; done`,
        stdout: "",
        stderr: "",
        log: "",
        processState: ProcessState.Stopped,
        restarting: false
    };

    process: ChildProcess | null = null;

    constructor(props: {}, context?: any) {
        super(props, context);
        this.startScript = this.startScript.bind(this);
        this.stopScript = this.stopScript.bind(this);
        this.restartScript = this.restartScript.bind(this);
    }

    startScript() {
        this.setState({
            stdout: "",
            stderr: "",
            log: "",
            processState: ProcessState.Running
        });

        this.process = exec(this.state.command);

        this.process.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
            this.setState({
                stdout: this.state.stdout + data,
                log: this.state.log + data
            });
        });

        this.process.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
            this.setState({
                stderr: this.state.stderr + data,
                log: this.state.log + data
            });
        });

        this.process.on("close", code => {
            console.log(`child process exited with code ${code}`);

            if (this.state.restarting) {
                this.startScript();
            } else {
                this.setState({
                    processState: ProcessState.Stopped
                });
            }
        });
    }

    stopScript(restart: boolean = false) {
        if (this.process != null) {
            this.setState({
                processState: ProcessState.Stopping,
                restarting: restart
            });
            this.process.kill();
            this.process = null;
        }
    }

    restartScript() {
        this.stopScript(true);
    }

    render() {
        const actionButtons = (processState: ProcessState) => {
            switch (processState) {
                case ProcessState.Stopped:
                case ProcessState.Failed:
                    return (
                        <button type="button" onClick={this.startScript}>
                            開始
                        </button>
                    );
                case ProcessState.Running:
                    return (
                        <span>
                            <button
                                type="button"
                                onClick={e => this.stopScript()}
                            >
                                停止
                            </button>
                            <button type="button" onClick={this.restartScript}>
                                再起動
                            </button>
                        </span>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className="App">
                <p>Hello, Electron World!</p>
                <code>{this.state.command}</code>
                <div>{actionButtons(this.state.processState)}</div>
                log
                <textarea value={this.state.log} />
            </div>
        );
    }
}
