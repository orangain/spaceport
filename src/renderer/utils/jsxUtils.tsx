import * as React from "react";

export function extendLogElements(
  logElements: React.ReactNode[],
  log: string
): React.ReactNode[] {
  return [...logElements, toLogElements(log, logElements.length)];
}

function toLogElements(log: string, keyStartIndex: number): React.ReactNode[] {
  let elements: React.ReactNode[] = [];

  const lineBreakRegex = /(\r\n|\n)/;
  elements = log.split(lineBreakRegex).map((line, i) => {
    if (line.match(lineBreakRegex)) {
      return <br key={keyStartIndex + i} />;
    } else {
      return line;
    }
  });

  return elements;
}
