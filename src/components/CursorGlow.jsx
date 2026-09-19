import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX - 260}px, ${e.clientY - 260}px, 0)`;
      if (el.style.opacity !== "1") el.style.opacity = "1";
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 w-[520px] h-[520px] rounded-full mix-blend-screen opacity-0 transition-[transform,opacity] duration-300 ease-out will-change-transform"
      style={{
        background:
          "radial-gradient(circle, rgba(203,166,247,0.35) 0%, rgba(137,180,250,0.18) 45%, transparent 72%)",
      }}
    />
  );
}
