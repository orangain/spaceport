export enum ProcessState {
  Stopped = 0,
  Running,
  Failed,
  Stopping
}

export interface Launcher {
  key: number; // Unique key for react component
  config: LauncherConfig;
  process: LauncherProcess;
}

export class Launcher {
  static lastKey: number = 0;
  key: number; // Unique key for react component

  constructor(public config: LauncherConfig, public process: LauncherProcess) {
    if (Launcher.lastKey == Number.MAX_SAFE_INTEGER) {
      Launcher.lastKey = -Number.MAX_SAFE_INTEGER;
    } else {
      Launcher.lastKey++;
    }

    this.key = Launcher.lastKey;
  }
}

export interface LauncherConfig {
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
