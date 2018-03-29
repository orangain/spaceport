import * as React from "react";

import { Launcher, ProcessState } from "../models";
import "./LauncherList.scss";

export interface LauncherListProps {
    launchers: Launcher[];
    activeLauncherIndex: number;
    activate: (index: number) => any;
}

export class LauncherList extends React.Component<LauncherListProps, {}> {
    render() {
        return (
            <ul className="launcher-list">
                {this.props.launchers.map((launcher, i) => {
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
                                        (launcher.process.processState ===
                                            ProcessState.Running
                                            ? "running"
                                            : "stopped")
                                    }
                                >
                                    ●
                                </span>
                                {launcher.config.name}
                            </h2>
                            <small>{launcher.config.directory}</small>
                        </li>
                    );
                })}
            </ul>
        );
    }
}
