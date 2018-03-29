import * as React from "react";

import { Launcher, ProcessState } from "../models";

import "./LauncherDetail.scss";

export interface LauncherDetailProps {
    launcher?: Launcher;
    startScript: (launcher: Launcher) => any;
    stopScript: (launcher: Launcher, restart?: boolean) => any;
    restartScript: (launcher: Launcher) => any;
}

export class LauncherDetail extends React.Component<LauncherDetailProps, {}> {
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
                <h3>{this.props.launcher.config.name}</h3>
                <div>{this.props.launcher.config.directory}</div>
                <code>{this.props.launcher.config.command}</code>
                <div>{actionButtons(this.props.launcher.process.processState)}</div>
                log
                <textarea value={this.props.launcher.process.log} />
            </div>
        );
    }
}
