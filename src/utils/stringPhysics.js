// SVG path helpers used by the interaction layer.
// We sample each path so pointer hit-testing can remain cheap and independent
// from React state updates.

export function samplePath(pathElement, count = 42) {
  const total = pathElement.getTotalLength();
  const points = [];

  for (let i = 0; i <= count; i += 1) {
    const p = pathElement.getPointAtLength((total * i) / count);
    points.push({ x: p.x, y: p.y });
  }

  return points;
}

export function closestPointOnPolyline(point, points) {
  let best = {
    distance: Number.POSITIVE_INFINITY,
    index: 0,
    t: 0,
    point: points[0],
  };

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const len2 = abx * abx + aby * aby;

    const rawT =
      len2 === 0
        ? 0
        : ((point.x - a.x) * abx + (point.y - a.y) * aby) / len2;

    const t = Math.max(0, Math.min(1, rawT));
    const x = a.x + abx * t;
    const y = a.y + aby * t;
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = Math.hypot(dx, dy);

    if (distance < best.distance) {
      best = { distance, index: i, t, point: { x, y } };
    }
  }

  return best;
}

export function signedSide(point, points, nearest) {
  const i = Math.min(nearest.index, points.length - 2);
  const a = points[i];
  const b = points[i + 1];
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  const px = point.x - nearest.point.x;
  const py = point.y - nearest.point.y;

  // 2D cross product gives which side of the local tangent the pointer is on.
  const cross = tx * py - ty * px;
  return Math.sign(cross) || 0;
}