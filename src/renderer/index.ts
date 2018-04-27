import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./component/App";
const fixPath = require("fix-path");

fixPath(); // 環境変数PATHを設定する。
ReactDOM.render(React.createElement(App, {}), document.getElementById("app"));
