import * as React from "react";

import { Launcher, ProcessState, LauncherConfig } from "../models";

import "./LauncherDetail.scss";

export interface LauncherDetailProps {
    launcher?: Launcher;
    startScript: (launcher: Launcher) => any;
    stopScript: (launcher: Launcher, restart?: boolean) => any;
    restartScript: (launcher: Launcher) => any;
    updateLauncherConfig: (launcher: Launcher, config: LauncherConfig) => any;
}

export interface LauncherDetailState {
    isNameEditing: boolean;
    unsavedName: string;
}

export class LauncherDetail extends React.Component<LauncherDetailProps, LauncherDetailState> {
    state = {
        isNameEditing: false,
        unsavedName: ''
    }

    constructor(props: LauncherDetailProps, context?: any) {
        super(props, context);
        this.beginEditName = this.beginEditName.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.endEditName = this.endEditName.bind(this);
    }

    beginEditName() {
        this.setState(Object.assign({}, this.state, {
            isNameEditing: true,
            unsavedName: (this.props.launcher as Launcher).config.name,
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

        const launcher = this.props.launcher as Launcher;
        this.props.updateLauncherConfig(launcher, Object.assign({}, launcher.config, {
            name: this.state.unsavedName
        }));
    }

    render() {
        const actionButtons = (processState: ProcessState) => {
            const launcher = this.props.launcher as Launcher;
            switch (processState) {
                case ProcessState.Stopped:
                case ProcessState.Failed:
                    return (
                        <button
                            type="button"
                            onClick={e => this.props.startScript(launcher)}
                        >
                            開始
                        </button>
                    );
                case ProcessState.Running:
                    return (
                        <span>
                            <button
                                type="button"
                                onClick={e => this.props.stopScript(launcher)}
                            >
                                停止
                            </button>
                            <button
                                type="button"
                                onClick={e =>
                                    this.props.restartScript(launcher)
                                }
                            >
                                再起動
                            </button>
                        </span>
                    );
                default:
                    return null;
            }
        };

        if (this.props.launcher === undefined) {
            return (
                <div className="launcher-detail">
                    <p>コマンドを追加してください。</p>
                </div>
            );
        }

        return (
            <div className="launcher-detail">
                <h3>{this.state.isNameEditing ?
                    <form onSubmit={(e) => { e.preventDefault(); this.endEditName(); }}><input autoFocus value={this.state.unsavedName} onChange={this.handleNameChange} /> <button>OK</button></form> :
                    <div>{this.props.launcher.config.name} <button onClick={this.beginEditName}>Edit</button></div>}
                </h3>
                <div>{this.props.launcher.config.directory}</div>
                <code>{this.props.launcher.config.command}</code>
                <div>{actionButtons(this.props.launcher.process.processState)}</div>
                log
                <textarea value={this.props.launcher.process.log} />
            </div>
        );
    }
}
