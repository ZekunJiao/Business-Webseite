type Point = { x: number; y: number };

// Keep the animated mascot outside of visible interactive controls.
export function keepCursorClear(
  point: Point,
  host: HTMLElement,
  radius = 32,
): Point | null {
  const bounds = host.getBoundingClientRect();
  const controls = Array.from(
    host.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input, select, textarea, [role="button"]',
    ),
  )
    .filter((el) => el.offsetWidth > 0 && el.offsetHeight > 0)
    .map((el) => el.getBoundingClientRect())
    .filter((rect) => rect.right > bounds.left && rect.left < bounds.right);

  const clear = (candidate: Point) =>
    !controls.some(
      (rect) =>
        candidate.x + radius > rect.left - bounds.left &&
        candidate.x - radius < rect.right - bounds.left &&
        candidate.y + radius > rect.top - bounds.top &&
        candidate.y - radius < rect.bottom - bounds.top,
    );
  if (clear(point)) return point;

  const candidates = controls.flatMap((rect) => {
    const left = rect.left - bounds.left - radius - 8;
    const right = rect.right - bounds.left + radius + 8;
    const top = rect.top - bounds.top - radius - 8;
    const bottom = rect.bottom - bounds.top + radius + 8;
    return [
      { x: left, y: point.y },
      { x: right, y: point.y },
      { x: point.x, y: top },
      { x: point.x, y: bottom },
    ].filter(
      (p) =>
        p.x >= radius &&
        p.x <= bounds.width - radius &&
        p.y >= radius &&
        p.y <= bounds.height - radius,
    );
  });
  return (
    candidates
      .filter(clear)
      .sort(
        (a, b) =>
          Math.hypot(a.x - point.x, a.y - point.y) -
          Math.hypot(b.x - point.x, b.y - point.y),
      )[0] ?? null
  );
}
