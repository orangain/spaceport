import * as React from "react";

import { Launcher, LauncherProcess, ProcessState } from "../models";

export interface LauncherDetailProps {
    launcher?: Launcher;
    launcherProcess?: LauncherProcess;
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
        const launcherProcess = this.props.launcherProcess as LauncherProcess;

        return (
            <div className="launcher-detail">
                <h3>{this.props.launcher.name}</h3>
                <div>{this.props.launcher.directory}</div>
                <code>{this.props.launcher.command}</code>
                <div>{actionButtons(launcherProcess.processState)}</div>
                log
                <textarea value={launcherProcess.log} />
            </div>
        );
    }
}
