export enum ProcessState {
    Stopped = 0,
    Running,
    Failed,
    Stopping
}

export interface Launcher {
    key: number; // Unique key for react component
    name: string;
    directory: string;
    command: string;
}

export interface LauncherProcess {
    stdout: string;
    stderr: string;
    log: string;
    processState: ProcessState;
    restarting: boolean;
}
