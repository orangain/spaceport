import * as React from "react";

import { Launcher, LauncherProcess, ProcessState } from "../models";
import "./LauncherList.scss";

export interface LauncherListProps {
    launchers: Launcher[];
    activeLauncherIndex: number;
    launcherProcesses: Map<number, LauncherProcess>;
    activate: (index: number) => any;
}

export class LauncherList extends React.Component<LauncherListProps, {}> {
    render() {
        return (
            <ul className="launcher-list">
                {this.props.launchers.map((launcher, i) => {
                    const launcherProcess = this.props.launcherProcesses.get(
                        launcher.key
                    ) as LauncherProcess;

                    return (
                        <li
                            key={launcher.key}
                            className={
                                i == this.props.activeLauncherIndex
                                    ? "active"
                                    : ""
                            }
                            onClick={e => this.props.activate(launcher.key)}
                        >
                            <h2>
                                <span
                                    className={
                                        "signal " +
                                        (launcherProcess.processState ===
                                        ProcessState.Running
                                            ? "running"
                                            : "stopped")
                                    }
                                >
                                    ●
                                </span>
                                {launcher.name}
                            </h2>
                            <small>{launcher.directory}</small>
                        </li>
                    );
                })}
            </ul>
        );
    }
}
