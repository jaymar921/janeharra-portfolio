import { useRef, useState } from "react";

const DRAG_THRESHOLD = 8;

export default function DesktopIcon({ app, x, y, isActive, onMove, onOpen }) {
  const dragState = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e) => {
    dragState.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: x,
      originY: y,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const state = dragState.current;
    if (!state) return;

    const dx = e.clientX - state.startClientX;
    const dy = e.clientY - state.startClientY;

    if (!state.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      state.moved = true;
      setDragging(true);
    }

    if (state.moved) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const nextX = Math.min(Math.max(state.originX + dx, 4), vw - 88);
      const nextY = Math.min(Math.max(state.originY + dy, 4), vh - 148);
      onMove(app.id, nextX, nextY);
    }
  };

  const handlePointerUp = (e) => {
    const state = dragState.current;
    dragState.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    if (state && !state.moved) {
      onOpen(app.id);
    }
  };

  return (
    <button
      style={{ left: x, top: y, touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute flex flex-col items-center gap-1.5 w-20 py-2 px-1 rounded-xl select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-colors ${
        dragging ? "bg-white/10 scale-105 z-50" : isActive ? "bg-white/10" : "hover:bg-white/5"
      }`}
    >
      <span
        className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center overflow-hidden transition-transform ${
          dragging ? "scale-110" : ""
        }`}
        style={{
          width: 52,
          height: 52,
          backgroundImage: `linear-gradient(150deg, ${app.accent} 0%, ${app.accent}cc 35%, #11111b 130%)`,
          boxShadow: dragging
            ? `0 10px 30px -6px ${app.accent}99, 0 0 0 1px ${app.accent}55`
            : `0 6px 18px -6px ${app.accent}80, 0 0 0 1px rgba(255,255,255,0.08)`,
        }}
      >
        {/* gloss highlight */}
        <span
          className="pointer-events-none absolute -top-3 -left-3 w-10 h-10 rounded-full opacity-40 blur-md"
          style={{ background: "radial-gradient(circle, #ffffff, transparent 70%)" }}
        />
        <span className="relative text-white scale-150">{app.icon}</span>
      </span>
      <span className="text-[11px] sm:text-xs font-medium font-mono text-[#cdd6f4] text-center leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
        {app.label}
      </span>
    </button>
  );
}
