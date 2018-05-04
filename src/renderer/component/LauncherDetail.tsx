import * as React from "react";

import { Launcher, ProcessState } from "../models";

import "./LauncherDetail.scss";

export interface LauncherDetailProps {
  launcher: Launcher;
  startScript: (launcher: Launcher) => any;
  stopScript: (launcher: Launcher, restart?: boolean) => any;
  restartScript: (launcher: Launcher) => any;
  beginEdit: () => void;
}

export interface LauncherDetailState {
  isEditing: boolean;
  unsavedName: string;
  unsavedDirectory: string;
  unsavedCommand: string;
}

export class LauncherDetail extends React.Component<
  LauncherDetailProps,
  LauncherDetailState
> {
  state = {
    isEditing: false,
    unsavedName: "",
    unsavedDirectory: "",
    unsavedCommand: ""
  };
  directoryInput: HTMLInputElement | null = null;
  logElement: HTMLDivElement | null = null;
  scrollFromBottom: number | undefined;

  constructor(props: LauncherDetailProps, context?: any) {
    super(props, context);
    this.setLogElementRef = this.setLogElementRef.bind(this);
    this.scrollLogBottomIfNeeded = this.scrollLogBottomIfNeeded.bind(this);
  }

  componentWillUpdate(
    nextProps: Readonly<LauncherDetailProps>,
    nextState: Readonly<LauncherDetailState>,
    nextContext: any
  ) {
    if (this.logElement === null) {
      return;
    }

    this.scrollFromBottom =
      this.logElement.scrollHeight -
      this.logElement.scrollTop -
      this.logElement.clientHeight;
    // console.log(this.scrollFromBottom);
  }

  componentDidUpdate(
    prevProps: Readonly<LauncherDetailProps>,
    prevState: Readonly<LauncherDetailState>,
    prevContext: any
  ) {
    if (this.props.launcher.process.log === prevProps.launcher.process.log) {
      return;
    }

    this.scrollLogBottomIfNeeded();
  }

  setLogElementRef(element: HTMLDivElement) {
    this.logElement = element;
  }

  scrollLogBottomIfNeeded() {
    if (
      this.logElement === null ||
      this.scrollFromBottom === undefined ||
      this.scrollFromBottom > 10
    ) {
      return;
    }

    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  render() {
    const actionButtons = (processState: ProcessState) => {
      switch (processState) {
        case ProcessState.Stopped:
        case ProcessState.Failed:
          return (
            <button
              type="button"
              className="btn btn-positive"
              onClick={e => this.props.startScript(this.props.launcher)}
            >
              <span className="icon icon-play" /> 開始
            </button>
          );
        case ProcessState.Running:
          return (
            <span>
              <button
                type="button"
                className="btn btn-negative"
                onClick={e => this.props.stopScript(this.props.launcher)}
              >
                <span className="icon icon-stop" /> 停止
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={e => this.props.restartScript(this.props.launcher)}
              >
                <span className="icon icon-cw" /> 再起動
              </button>
            </span>
          );
        default:
          return null;
      }
    };

    return (
      <div className="launcher-detail">
        <div className="launcher-detail-container">
          <div className="metadata">
            <div className="top">
              <h3>
                {this.props.launcher.config.name !== "" ? (
                  this.props.launcher.config.name
                ) : (
                  <span className="text-muted">(名称未設定)</span>
                )}
              </h3>
              <div>
                <button
                  className="btn btn-default"
                  onClick={this.props.beginEdit}
                >
                  <span className="icon icon-pencil" /> 編集
                </button>
              </div>
            </div>
            <div className="directory">
              {this.props.launcher.config.directory}
            </div>
            <div>
              <code>
                {this.props.launcher.config.command !== "" ? (
                  <pre>{this.props.launcher.config.command}</pre>
                ) : (
                  <span className="text-muted">(コマンド未設定)</span>
                )}
              </code>
            </div>
            <div>
              {this.props.launcher.config.command !== ""
                ? actionButtons(this.props.launcher.process.processState)
                : null}
            </div>
          </div>
          <div>
            <span>Log:</span>
          </div>
          <div className="log" ref={this.setLogElementRef}>
            {this.props.launcher.process.logElements}
          </div>
        </div>
      </div>
    );
  }
}
