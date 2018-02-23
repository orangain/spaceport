import * as React from "react";
import { exec, ChildProcess } from "child_process";
import "./App.css"

export interface AppState {
    command: string;
    stdout: string;
    stderr: string;
    log: string;
    processState: ProcessState;
}

export enum ProcessState {
    Stopped = 0,
    Running,
    Failed,
}

export class App extends React.Component<{}, AppState> {

    state = {
        command: `while true; do date; sleep 1s; done`,
        stdout: "",
        stderr: "",
        log: "",
        processState: ProcessState.Stopped,
    }

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
            processState: ProcessState.Running,
        });

        this.process = exec(this.state.command);

        this.process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            this.setState({
                stdout: this.state.stdout + data,
                log: this.state.log + data,
            });
        });

        this.process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            this.setState({
                stderr: this.state.stderr + data,
                log: this.state.log + data,
            });
        });

        this.process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            this.setState({
                processState: ProcessState.Stopped,
            });
        });
    }

    stopScript() {
        if (this.process != null) {
            this.process.kill();
            this.process = null;
        }
    }

    restartScript() {
        this.stopScript();
        this.startScript();
    }

    render() {
        return (
            <div className="App">
                <p>Hello, Electron World!</p>
                <code>{this.state.command}</code>
                <div>
                {this.state.processState === ProcessState.Running ?
                    <button type="button" onClick={this.stopScript}>停止</button> :
                    <button type="button" onClick={this.startScript}>開始</button>}
                </div>
                log
                <textarea value={this.state.log} />
            </div>
        )
    }
}