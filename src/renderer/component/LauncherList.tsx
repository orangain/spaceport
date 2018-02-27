import * as React from "react";

import { Launcher } from "../models";

export interface LauncherListProps {
    launchers: Launcher[];
    activate: (index: number) => any;
}

export class LauncherList extends React.Component<LauncherListProps, {}> {
    render() {
        return (
            <ul className="launcher-list">
                {this.props.launchers.map(launcher => (
                    <li
                        key={launcher.key}
                        onClick={e => this.props.activate(launcher.key)}
                    >
                        {launcher.name}
                    </li>
                ))}
            </ul>
        );
    }
}
