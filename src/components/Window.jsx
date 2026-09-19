import { useRef, useState } from "react";

const TASKBAR_HEIGHT = 56;
const TITLEBAR_HEIGHT = 44;

export default function Window({
  id,
  title,
  icon,
  accent,
  x,
  y,
  width,
  height,
  zIndex,
  minimized,
  maximized,
  focused,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  children,
}) {
  const dragState = useRef(null);
  const [dragging, setDragging] = useState(false);

  if (minimized) return null;

  const handlePointerDown = (e) => {
    if (maximized) {
      onFocus();
      return;
    }
    onFocus();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: x,
      originY: y,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragState.current) return;
    const { startX, startY, originX, originY } = dragState.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - TASKBAR_HEIGHT - 40;

    const nextX = Math.min(Math.max(originX + dx, -width + 160), maxX);
    const nextY = Math.min(Math.max(originY + dy, 0), maxY);

    onMove(id, nextX, nextY);
  };

  const handlePointerUp = (e) => {
    dragState.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const style = maximized
    ? {
        left: 8,
        top: 8,
        width: "calc(100% - 16px)",
        height: `calc(100% - ${TASKBAR_HEIGHT + 16}px)`,
        zIndex,
        borderColor: focused ? `${accent}66` : "rgba(255,255,255,0.08)",
        boxShadow: focused
          ? `0 0 0 1px ${accent}33, 0 0 50px -8px ${accent}55, 0 25px 70px -20px rgba(0,0,0,0.7)`
          : "0 20px 60px -20px rgba(0,0,0,0.65)",
      }
    : {
        left: x,
        top: y,
        width,
        height,
        zIndex,
        borderColor: focused ? `${accent}66` : "rgba(255,255,255,0.08)",
        boxShadow: focused
          ? `0 0 0 1px ${accent}33, 0 0 50px -8px ${accent}55, 0 25px 70px -20px rgba(0,0,0,0.7)`
          : "0 20px 60px -20px rgba(0,0,0,0.65)",
      };

  return (
    <div
      className="fixed rounded-2xl overflow-hidden border flex flex-col animate-window-in bg-[#1e1e2e]/50 backdrop-blur-2xl backdrop-saturate-150 transition-[border-color,box-shadow] duration-200"
      style={style}
      onPointerDown={onFocus}
    >
      {/* Title bar */}
      <div
        className={`flex items-center justify-between gap-2 px-3 sm:px-4 border-b border-white/10 bg-black/20 backdrop-blur-xl select-none ${
          maximized ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ height: TITLEBAR_HEIGHT }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={onToggleMaximize}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-6 h-6 rounded-lg text-[#11111b] flex items-center justify-center flex-shrink-0"
            style={{ backgroundImage: `linear-gradient(135deg, ${accent}, #11111b)` }}
          >
            <span className="text-white">{icon}</span>
          </span>
          <span className="text-sm font-medium font-mono text-[#cdd6f4] truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#a6adc8] hover:bg-white/10 hover:text-[#cdd6f4] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0" y="4.5" width="10" height="1.4" rx="0.7" fill="currentColor" />
            </svg>
          </button>
          <button
            aria-label={maximized ? "Restore" : "Maximize"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaximize();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#a6adc8] hover:bg-white/10 hover:text-[#cdd6f4] transition-colors"
          >
            {maximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="1.5" y="0" width="7" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <rect x="0" y="2.5" width="7" height="7" rx="1" fill="#1e1e2e" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="0.5" y="0.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </button>
          <button
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#a6adc8] hover:bg-[#f38ba8] hover:text-[#11111b] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M0.5 0.5 9.5 9.5M9.5 0.5 0.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
}
