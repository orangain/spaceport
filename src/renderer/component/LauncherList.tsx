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
            <ul className="list-group">
                {this.props.launchers.map((launcher, i) => {
                    return (
                        <li
                            key={launcher.key}
                            className={"list-group-item " + (
                                i == this.props.activeLauncherIndex
                                    ? "active"
                                    : "")
                            }
                            onClick={e => this.props.activate(launcher.key)}
                        >
                            <div className="media-body">
                                <h4>
                                    <span
                                        className={
                                            "icon icon-record " +
                                            (launcher.process.processState ===
                                                ProcessState.Running
                                                ? "running"
                                                : "stopped")
                                        }
                                    /> {launcher.config.name}
                                </h4>
                                <p>{launcher.config.directory}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }
}
