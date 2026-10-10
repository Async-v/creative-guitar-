import React, { useRef } from "react";
import GuitarString from "./GuitarString";
import { GUITAR_STRINGS } from "../utils/guitarNotes";
import { useGuitarInteraction } from "../hooks/useGuitarInteraction";

const STRING_PATHS = [
  // These normalized coordinates are intentionally tied to the supplied
  // 1672x941 photograph. The six paths run from bridge toward the fretboard.
  "M 1048 633 C 1112 561, 1192 450, 1292 36",
  "M 1074 638 C 1134 568, 1211 457, 1308 34",
  "M 1101 643 C 1156 574, 1230 462, 1324 32",
  "M 1128 648 C 1180 582, 1248 468, 1340 30",
  "M 1156 652 C 1203 589, 1267 475, 1357 27",
  "M 1183 657 C 1228 595, 1286 481, 1373 24",
];

export default function GuitarStrings({ svgRef, onPluck, enabled }) {
  const stringRefs = useRef([]);

  const stringData = GUITAR_STRINGS.map((string, index) => ({
    ...string,
    d: STRING_PATHS[index],
  }));

  const setPathRef = (index) => (node) => {
    stringRefs.current[index] = node;
  };

  const { tapString } = useGuitarInteraction({
    svgRef,
    stringRefs,
    stringData,
    onPluck,
    enabled,
  });

  return (
    <svg
      ref={svgRef}
      className="string-layer"
      viewBox="0 0 1672 941"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Interactive six-string guitar"
    >
      {stringData.map((data, index) => (
        <GuitarString
          key={data.id}
          data={data}
          index={index}
          path={stringRefs.current[index]}
          setPathRef={setPathRef(index)}
          onTap={tapString}
        />
      ))}
    </svg>
  );
}