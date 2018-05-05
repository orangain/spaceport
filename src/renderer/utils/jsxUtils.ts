import * as React from "react";
import { remote } from "electron";

export function extendLogElements(
  logElements: React.ReactNode[],
  log: string
): React.ReactNode[] {
  const newElements = toLogElements(log).map((e, i) => {
    if (!React.isValidElement(e)) {
      return e;
    }
    return React.cloneElement(e as React.ReactElement<any>, { key: i });
  });

  return [...logElements, newElements];
}

function toLogElements(log: string): React.ReactNode[] {
  let elements: React.ReactNode[] = [];

  const lineBreakRegex = /(\r\n|\n)/;
  log.split(lineBreakRegex).forEach(line => {
    if (line.match(lineBreakRegex)) {
      elements.push(React.createElement("br"));
    } else {
      autoLink(line).forEach(e => {
        elements.push(e);
      });
    }
  });

  return elements;
}

function autoLink(line: string): React.ReactNode[] {
  let elements: React.ReactNode[] = [];

  const urlRegex = /(https?:\/\/\S+)/;
  line.split(urlRegex).forEach(piece => {
    if (piece.match(urlRegex)) {
      elements.push(
        React.createElement(
          "a",
          {
            className: "link",
            onClick: e => {
              e.preventDefault();
              onClickLink(piece);
            }
          },
          piece
        )
      );
    } else {
      elements.push(piece);
    }
  });

  return elements;
}

function onClickLink(url: string) {
  remote.shell.openExternal(url);
}
