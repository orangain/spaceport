import * as React from "react";

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
      elements.push(line);
    }
  });

  return elements;
}
