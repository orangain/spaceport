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
    isEditing: boolean;
    unsavedName: string;
    unsavedCommand: string;
}

export class LauncherDetail extends React.Component<LauncherDetailProps, LauncherDetailState> {
    state = {
        isEditing: false,
        unsavedName: '',
        unsavedCommand: ''
    }

    constructor(props: LauncherDetailProps, context?: any) {
        super(props, context);
        this.beginEdit = this.beginEdit.bind(this);
        this.endEdit = this.endEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleCommandChange = this.handleCommandChange.bind(this);
    }

    componentWillReceiveProps(nextProps: LauncherDetailProps) {
        if (nextProps.launcher.key !== this.props.launcher.key) {
            // Reset edit state
            const isNew = nextProps.launcher.config.name === '';
            this.setState(Object.assign({}, this.state, {
                isEditing: isNew,
                unsavedName: nextProps.launcher.config.name,
                unsavedCommand: nextProps.launcher.config.command
            }));
        }
    }

    beginEdit() {
        this.setState(Object.assign({}, this.state, {
            isEditing: true,
            unsavedName: this.props.launcher.config.name,
            unsavedCommand: this.props.launcher.config.command,
        }));
    }

    endEdit() {
        this.setState(Object.assign({}, this.state, {
            isEditing: false,
        }));

        const launcher = this.props.launcher;
        this.props.updateLauncherConfig(launcher, Object.assign({}, launcher.config, {
            name: this.state.unsavedName,
            command: this.state.unsavedCommand
        }));
    }

    cancelEdit() {
        this.setState(Object.assign({}, this.state, {
            isEditing: false,
        }));
    }

    handleNameChange(e: any) {
        this.setState(Object.assign({}, this.state, {
            unsavedName: e.target.value
        }));
    }

    handleCommandChange(e: any) {
        this.setState(Object.assign({}, this.state, {
            unsavedCommand: e.target.value
        }));
    }

    render() {
        const actionButtons = (processState: ProcessState) => {
            switch (processState) {
                case ProcessState.Stopped:
                case ProcessState.Failed:
                    return (
                        <button
                            type="button" className="btn btn-positive"
                            onClick={e => this.props.startScript(this.props.launcher)}
                        >
                            <span className="icon icon-play"></span> 開始
                        </button>
                    );
                case ProcessState.Running:
                    return (
                        <span>
                            <button
                                type="button" className="btn btn-negative"
                                onClick={e => this.props.stopScript(this.props.launcher)}
                            >
                                <span className="icon icon-stop"></span> 停止
                            </button>
                            <button
                                type="button" className="btn btn-warning"
                                onClick={e => this.props.restartScript(this.props.launcher)}
                            >
                                <span className="icon icon-cw"></span> 再起動
                            </button>
                        </span>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className="launcher-detail">
                {this.state.isEditing ?
                    <form onSubmit={(e) => { e.preventDefault(); this.endEdit(); }}>
                        <div className="form-group">
                            <label>名前</label>
                            <input autoFocus className="form-control" value={this.state.unsavedName} onChange={this.handleNameChange} />
                        </div>
                        <div className="form-group">
                            <label>コマンド</label>
                            <textarea className="form-control" value={this.state.unsavedCommand} onChange={this.handleCommandChange} />
                        </div>
                        <button className="btn btn-primary">保存</button> <button className="btn btn-default" type="button" onClick={this.cancelEdit}>キャンセル</button>
                    </form>
                    :
                    <div>
                        <h3>{this.props.launcher.config.name}</h3>
                        <div>{this.props.launcher.config.directory}</div>
                        <div><code>{this.props.launcher.config.command}</code></div>

                        <button className="btn btn-default" onClick={this.beginEdit}><span className="icon icon-pencil"></span> 編集</button>

                        <div>{actionButtons(this.props.launcher.process.processState)}</div>
                        log
                <textarea value={this.props.launcher.process.log} />
                    </div>}
            </div>
        );
    }
}
