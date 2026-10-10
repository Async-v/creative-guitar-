import { useCallback, useEffect, useRef } from "react";
import anime from "animejs";
import { closestPointOnPolyline, samplePath, signedSide } from "../utils/stringPhysics";

const HIT_RADIUS = 18;

export function useGuitarInteraction({
  svgRef,
  stringRefs,
  stringData,
  onPluck,
  enabled = true,
}) {
  const cacheRef = useRef([]);
  const previousPointRef = useRef(null);
  const previousSidesRef = useRef(new Map());
  const animationRef = useRef(new Map());

  const rebuildCache = useCallback(() => {
    cacheRef.current = stringData.map((data, index) => {
      const path = stringRefs.current[index];
      return {
        ...data,
        path,
        points: path ? samplePath(path, 48) : [],
      };
    });
  }, [stringData, stringRefs]);

  useEffect(() => {
    if (!svgRef.current) return undefined;

    rebuildCache();

    const onResize = () => rebuildCache();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [rebuildCache, svgRef]);

  const animateString = useCallback(
    (index) => {
      const path = stringRefs.current[index];
      const data = stringData[index];
      if (!path || !data) return;

      const old = animationRef.current.get(index);
      if (old) old.pause();

      // We animate the actual SVG path geometry through a custom "wave" value.
      // React never re-renders during the high-frequency animation.
      const original = path.getAttribute("d");
      const nums = original.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

      if (nums.length < 4) return;

      const [x1, y1, x2, y2] = nums.slice(0, 4);
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;

      // A cubic Bézier gives us a physically readable sideways displacement.
      const duration = data.duration + Math.random() * 80;
      const amplitude = data.amplitude * (0.86 + Math.random() * 0.28);
      const cycles = 8 + Math.random() * 3;

      const state = { wave: 0, progress: 0 };

      const animation = anime({
        targets: state,
        wave: [1, 0],
        progress: [0, 1],
        duration,
        easing: "easeOutElastic(1, 7)",
        update: () => {
          const decay = Math.pow(1 - state.progress, 1.8);
          const oscillation = Math.sin(state.progress * Math.PI * 2 * cycles);
          const displacement = amplitude * decay * oscillation * state.wave;

          const c1x = x1 + dx * 0.28 + nx * displacement;
          const c1y = y1 + dy * 0.28 + ny * displacement;
          const c2x = x1 + dx * 0.72 - nx * displacement * 0.8;
          const c2y = y1 + dy * 0.72 - ny * displacement * 0.8;

          path.setAttribute(
            "d",
            `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
          );
        },
        complete: () => {
          path.setAttribute("d", original);
          animationRef.current.delete(index);
        },
      });

      animationRef.current.set(index, animation);
    },
    [stringData, stringRefs]
  );

  const getSvgPoint = useCallback(
    (event) => {
      const svg = svgRef.current;
      if (!svg) return null;

      const rect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;

      return {
        x: ((event.clientX - rect.left) / rect.width) * viewBox.width,
        y: ((event.clientY - rect.top) / rect.height) * viewBox.height,
      };
    },
    [svgRef]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!enabled) return;

      const point = getSvgPoint(event);
      if (!point) return;

      const previous = previousPointRef.current;

      cacheRef.current.forEach((item, index) => {
        if (!item.path || item.points.length < 2) return;

        const nearest = closestPointOnPolyline(point, item.points);
        const near = nearest.distance <= HIT_RADIUS;

        if (near) {
          item.path.dataset.near = "true";
        } else {
          item.path.dataset.near = "false";
        }

        const side = signedSide(point, item.points, nearest);
        const oldSide = previousSidesRef.current.get(index) || 0;

        // A pluck occurs when the pointer crosses the local tangent while
        // staying close enough to the string. This prevents hover-spam.
        if (
          previous &&
          near &&
          side !== 0 &&
          oldSide !== 0 &&
          side !== oldSide
        ) {
          const speed = Math.min(1.25, Math.max(0.45, Math.hypot(
            point.x - previous.x,
            point.y - previous.y
          ) / 8));

          animateString(index);
          onPluck(item, speed);
        }

        if (side !== 0) previousSidesRef.current.set(index, side);
      });

      previousPointRef.current = point;
    },
    [animateString, enabled, getSvgPoint, onPluck]
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !enabled) return undefined;

    svg.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      svg.removeEventListener("pointermove", handlePointerMove);
      previousPointRef.current = null;
      previousSidesRef.current.clear();

      animationRef.current.forEach((animation) => animation.pause());
      animationRef.current.clear();
    };
  }, [enabled, handlePointerMove, svgRef]);

  const tapString = useCallback(
    (index) => {
      if (!enabled || !stringData[index]) return;
      animateString(index);
      onPluck(stringData[index], 0.95);
    },
    [animateString, enabled, onPluck, stringData]
  );

  return { tapString };
}