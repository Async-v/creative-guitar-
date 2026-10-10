import React from "react";

export default function GuitarString({
  data,
  index,
  setPathRef,
  onTap,
}) {
  return (
    <g>
      {/* The invisible wide path is the interaction/hit area. */}
      <path
        ref={setPathRef}
        d={data.d}
        className="string-hit"
        aria-label={`Guitar string ${data.id}, ${data.note}`}
        onPointerDown={(event) => {
          event.stopPropagation();
          onTap(index);
        }}
      />
      {/* The visible path is kept separate so physics can update it directly. */}
      <path
        d={data.d}
        className="string-visual"
        strokeWidth={data.thickness}
      />
    </g>
  );
}