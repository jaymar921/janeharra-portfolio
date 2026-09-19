const BOOT_LINES = [
  "mounting /home/jane ...",
  "starting compositor ...",
  "loading portfolio.desktop ...",
];

export default function LoadingScreen({ fading }) {
  return (
    <div
      className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#11111b] transition-opacity duration-[420ms] ease-in ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#232438_0%,#11111b_55%)]" />

      <div className="relative flex flex-col items-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-[#11111b] font-mono font-bold text-xl boot-logo-pulse"
          style={{ backgroundImage: "linear-gradient(135deg, #cba6f7, #89b4fa)" }}
        >
          JA
        </div>

        <p className="mt-5 font-mono text-sm tracking-[0.3em] uppercase bg-clip-text text-transparent bg-[linear-gradient(120deg,#cba6f7,#89b4fa_45%,#94e2d5)]">
          jane-OS
        </p>

        <div className="mt-6 w-56 h-[3px] rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full boot-progress-fill"
            style={{ backgroundImage: "linear-gradient(90deg,#cba6f7,#89b4fa,#94e2d5)" }}
          />
        </div>

        <div className="mt-5 space-y-1 text-center h-16">
          {BOOT_LINES.map((line, i) => (
            <p
              key={line}
              className="text-[11px] font-mono text-[#6c7086] opacity-0 boot-line"
              style={{ animationDelay: `${300 + i * 320}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
