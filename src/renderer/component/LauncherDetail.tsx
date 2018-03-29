import * as React from "react";

import { Launcher, ProcessState, LauncherConfig } from "../models";

import "./LauncherDetail.scss";

export interface LauncherDetailProps {
    launcher: Launcher;
    startScript: (launcher: Launcher) => any;
    stopScript: (launcher: Launcher, restart?: boolean) => any;
    restartScript: (launcher: Launcher) => any;
    updateLauncherConfig: (launcher: Launcher, config: LauncherConfig) => any;
}

export interface LauncherDetailState {
    isNameEditing: boolean;
    unsavedName: string;
    isCommandEditing: boolean;
    unsavedCommand: string;
}

export class LauncherDetail extends React.Component<LauncherDetailProps, LauncherDetailState> {
    state = {
        isNameEditing: false,
        unsavedName: '',
        isCommandEditing: false,
        unsavedCommand: ''
    }

    constructor(props: LauncherDetailProps, context?: any) {
        super(props, context);
        this.beginEditName = this.beginEditName.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.endEditName = this.endEditName.bind(this);
        this.beginEditCommand = this.beginEditCommand.bind(this);
        this.handleCommandChange = this.handleCommandChange.bind(this);
        this.endEditCommand = this.endEditCommand.bind(this);
    }

    beginEditName() {
        this.setState(Object.assign({}, this.state, {
            isNameEditing: true,
            unsavedName: this.props.launcher.config.name,
        }));
    }

    handleNameChange(e: any) {
        this.setState(Object.assign({}, this.state, {
            unsavedName: e.target.value
        }));
    }

    endEditName() {
        this.setState(Object.assign({}, this.state, {
            isNameEditing: false,
        }));

        const launcher = this.props.launcher;
        this.props.updateLauncherConfig(launcher, Object.assign({}, launcher.config, {
            name: this.state.unsavedName
        }));
    }

    beginEditCommand() {
        this.setState(Object.assign({}, this.state, {
            isCommandEditing: true,
            unsavedCommand: this.props.launcher.config.command,
        }));
    }

    handleCommandChange(e: any) {
        this.setState(Object.assign({}, this.state, {
            unsavedCommand: e.target.value
        }));
    }

    endEditCommand() {
        this.setState(Object.assign({}, this.state, {
            isCommandEditing: false,
        }));

        const launcher = this.props.launcher;
        this.props.updateLauncherConfig(launcher, Object.assign({}, launcher.config, {
            command: this.state.unsavedCommand
        }));
    }

    render() {
        const actionButtons = (processState: ProcessState) => {
            switch (processState) {
                case ProcessState.Stopped:
                case ProcessState.Failed:
                    return (
                        <button
                            type="button"
                            onClick={e => this.props.startScript(this.props.launcher)}
                        >
                            開始
                        </button>
                    );
                case ProcessState.Running:
                    return (
                        <span>
                            <button
                                type="button"
                                onClick={e => this.props.stopScript(this.props.launcher)}
                            >
                                停止
                            </button>
                            <button
                                type="button"
                                onClick={e => this.props.restartScript(this.props.launcher)}
                            >
                                再起動
                            </button>
                        </span>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className="launcher-detail">
                <h3>{this.state.isNameEditing ?
                    <form onSubmit={(e) => { e.preventDefault(); this.endEditName(); }}><input autoFocus value={this.state.unsavedName} onChange={this.handleNameChange} /> <button>OK</button></form> :
                    <div>{this.props.launcher.config.name} <button onClick={this.beginEditName}>Edit</button></div>}
                </h3>
                <div>{this.props.launcher.config.directory}</div>
                <div>{this.state.isCommandEditing ?
                    <form onSubmit={(e) => { e.preventDefault(); this.endEditCommand(); }}><input autoFocus value={this.state.unsavedCommand} onChange={this.handleCommandChange} /> <button>OK</button></form> :
                    <div><code>{this.props.launcher.config.command}</code><button onClick={this.beginEditCommand}>Edit</button></div>}
                </div>
                <div>{actionButtons(this.props.launcher.process.processState)}</div>
                log
                <textarea value={this.props.launcher.process.log} />
            </div>
        );
    }
}
