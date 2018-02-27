import * as React from "react";

import { Launcher, LauncherProcess, ProcessState } from "../models";

export interface LauncherDetailProps {
    launcher: Launcher;
    launcherProcess: LauncherProcess;
    startScript: (launcher: Launcher) => any;
    stopScript: (launcher: Launcher, restart?: boolean) => any;
    restartScript: (launcher: Launcher) => any;
}

export class LauncherDetail extends React.Component<LauncherDetailProps, {}> {
    render() {
        const actionButtons = (processState: ProcessState) => {
            switch (processState) {
                case ProcessState.Stopped:
                case ProcessState.Failed:
                    return (
                        <button
                            type="button"
                            onClick={e =>
                                this.props.startScript(this.props.launcher)
                            }
                        >
                            開始
                        </button>
                    );
                case ProcessState.Running:
                    return (
                        <span>
                            <button
                                type="button"
                                onClick={e =>
                                    this.props.stopScript(this.props.launcher)
                                }
                            >
                                停止
                            </button>
                            <button
                                type="button"
                                onClick={e =>
                                    this.props.restartScript(
                                        this.props.launcher
                                    )
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

        return (
            <div className="launcher-detail">
                <h3>{this.props.launcher.name}</h3>
                <div>{this.props.launcher.directory}</div>
                <code>{this.props.launcher.command}</code>
                <div>
                    {actionButtons(this.props.launcherProcess.processState)}
                </div>
                log
                <textarea value={this.props.launcherProcess.log} />
            </div>
        );
    }
}
