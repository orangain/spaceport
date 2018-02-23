import * as React from "react";
import { exec } from "child_process";

export interface AppState {
    command: string;
    stdout: string;
    stderr: string;
}

export class App extends React.Component<{}, AppState> {

    state = {
        command: `while true; do date; sleep 1s; done`,
        stdout: "",
        stderr: "",
    }

    constructor(props: {}, context?: any) {
        super(props, context);
        this.executeScript = this.executeScript.bind(this);
      }

    executeScript() {
        const process = exec(this.state.command);

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            this.setState({
                stdout: this.state.stdout + data,
            });
        });

        process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            this.setState({
                stderr: this.state.stderr + data,
            });
        });

        process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    render() {
        return (
            <div className="App">
                <p>Hello, Electron World!</p>
                <code>{this.state.command}</code>
                <button type="button" onClick={this.executeScript}>実行</button>
                stdout
                <textarea value={this.state.stdout}/>
                stderr
                <textarea value={this.state.stderr}/>
            </div>
        )
    }
}