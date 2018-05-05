import * as React from "react";
import * as path from "path";

import { Launcher, LauncherConfig } from "../models";

import "./LauncherEditForm.scss";

export interface LauncherEditFormProps {
  launcher: Launcher;
  updateLauncherConfig: (launcher: Launcher, config: LauncherConfig) => any;
  endEdit: () => void;
}

export interface LauncherEditFormState {
  unsavedName: string;
  unsavedDirectory: string;
  unsavedCommand: string;
}

export class LauncherEditForm extends React.Component<
  LauncherEditFormProps,
  LauncherEditFormState
> {
  state = {
    unsavedName: "",
    unsavedDirectory: "",
    unsavedCommand: ""
  };
  directoryInput: HTMLInputElement | null = null;

  constructor(props: LauncherEditFormProps, context?: any) {
    super(props, context);
    this.save = this.save.bind(this);
    this.cancel = this.cancel.bind(this);
    this.updateDirectoryInput = this.updateDirectoryInput.bind(this);
    this.openDirectoryDialog = this.openDirectoryDialog.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDirectoryChange = this.handleDirectoryChange.bind(this);
    this.handleDirectorySelect = this.handleDirectorySelect.bind(this);
    this.handleCommandChange = this.handleCommandChange.bind(this);
  }

  componentWillMount() {
    this.initLauncher(this.props.launcher);
  }

  componentWillReceiveProps(nextProps: LauncherEditFormProps) {
    if (nextProps.launcher.key !== this.props.launcher.key) {
      // Reset edit state
      this.initLauncher(nextProps.launcher);
    }
  }

  initLauncher(launcher: Launcher) {
    this.setState({
      unsavedName: launcher.config.name,
      unsavedDirectory: launcher.config.directory,
      unsavedCommand: launcher.config.command
    });
  }

  save() {
    const launcher = this.props.launcher;
    this.props.updateLauncherConfig(
      launcher,
      Object.assign({}, launcher.config, {
        name: this.state.unsavedName,
        directory: this.state.unsavedDirectory,
        command: this.state.unsavedCommand
      })
    );
    this.props.endEdit();
  }

  cancel() {
    this.props.endEdit();
  }

  updateDirectoryInput(input: HTMLInputElement | null) {
    this.directoryInput = input;
    if (input !== null) {
      // Set attribute here because setting webkitdirectory attribute in JSX causes TypeScript error.
      input.webkitdirectory = true;
    }
  }

  openDirectoryDialog() {
    (this.directoryInput as HTMLInputElement).click();
  }

  handleNameChange(e: any) {
    this.setState({
      unsavedName: e.target.value
    });
  }

  handleDirectoryChange(e: any) {
    this.setState({
      unsavedDirectory: e.dataTransfer
        ? e.dataTransfer.files[0].path
        : e.target.value
    });
  }

  handleDirectorySelect(e: any) {
    const files = (this.directoryInput as HTMLInputElement).files;
    if (files !== null && files.length > 0) {
      let selectedPath = files[0].path;
      if (process.env.HOME && selectedPath.startsWith(process.env.HOME)) {
        selectedPath = "~" + selectedPath.slice(process.env.HOME.length);
      }
      this.setState({
        unsavedName:
          this.state.unsavedName !== ""
            ? this.state.unsavedName
            : path.basename(selectedPath),
        unsavedDirectory: selectedPath
      });
    }
  }

  handleCommandChange(e: any) {
    this.setState({
      unsavedCommand: e.target.value
    });
  }

  isValid(): boolean {
    return (
      this.state.unsavedDirectory !== "" && this.state.unsavedCommand !== ""
    );
  }

  render() {
    return (
      <div className="launcher-edit">
        <header className="toolbar toolbar-header">
          <h1 className="title">
            コマンドの{this.props.launcher.key === undefined ? "追加" : "編集"}
          </h1>
        </header>
        <form
          onSubmit={e => {
            e.preventDefault();
            this.save();
          }}
        >
          <div className="form-group">
            <label>名前</label>
            <input
              autoFocus
              className="form-control"
              value={this.state.unsavedName}
              onChange={this.handleNameChange}
              placeholder="わかりやすい名前をつけます（例: my-app）"
            />
          </div>
          <div className="form-group">
            <label>コマンドを実行するディレクトリ（必須）</label>
            <div className="form-row">
              <input
                className="form-control"
                value={this.state.unsavedDirectory}
                onChange={this.handleDirectoryChange}
              />
              <button
                className="btn btn-default"
                type="button"
                onClick={this.openDirectoryDialog}
              >
                ...
              </button>
            </div>
            <input
              style={{ display: "none" }}
              type="file"
              ref={this.updateDirectoryInput}
              onChange={this.handleDirectorySelect}
            />
          </div>
          <div className="form-group">
            <label>コマンド（必須）</label>
            <textarea
              className="form-control"
              value={this.state.unsavedCommand}
              onChange={this.handleCommandChange}
              placeholder="実行するコマンドを入力します（例: npm start）"
            />
          </div>
          <button className="btn btn-primary" disabled={!this.isValid()}>
            保存
          </button>{" "}
          <button
            className="btn btn-default"
            type="button"
            onClick={this.cancel}
          >
            キャンセル
          </button>
        </form>
      </div>
    );
  }
}
