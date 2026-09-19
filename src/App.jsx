import { useEffect, useMemo, useRef, useState } from "react";
import Window from "./components/Window";
import DesktopIcon from "./components/DesktopIcon";
import "./App.css";

/* ------------------------------------------------------------------ */
/*  Design tokens — Catppuccin Mocha, CachyOS / Hyprland rice style    */
/*                                                                      */
/*  crust    #11111b   mantle   #181825   base     #1e1e2e             */
/*  surface0 #313244   overlay0 #6c7086   subtext0 #a6adc8             */
/*  text     #cdd6f4                                                   */
/*  mauve #cba6f7  blue #89b4fa  teal #94e2d5  green #a6e3a1            */
/*  yellow #f9e2af pink #f5c2e7  peach #fab387 red #f38ba8              */
/* ------------------------------------------------------------------ */

const SKILL_GROUPS = [
  {
    title: "Customer Support",
    skills: ["Customer Service", "Technical Support", "Email Support", "Chat Support", "Phone Handling"],
  },
  {
    title: "Sales & Growth",
    skills: ["Sales / Upselling", "Lead Generation"],
  },
  {
    title: "Operations & Quality",
    skills: ["Data Entry", "Quality Assurance", "Workforce Management", "Training & Onboarding"],
  },
  {
    title: "Tools & Platforms",
    skills: ["Zendesk", "HubSpot", "Salesforce", "Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint", "Data Sheets / Entry"],
  },
];

const EXPERIENCE = [
  {
    company: "Illuminary Peak",
    role: "Human Resource Manager",
    dates: "July 2026 — Present",
    description:
      "Lead HR operations for a fully remote Philippine startup, overseeing recruitment, onboarding, employee relations, and workplace policies for a distributed team.",
    achievements: [
      "Manage end-to-end hiring and onboarding for a remote-first team",
      "Set up HR policies and processes to support a growing startup",
      "Serve as the main point of contact for employee relations and engagement",
    ],
  },
  {
    company: "Concentrix",
    role: "Advisor I — Customer Service Representative",
    dates: "2024 — Present",
    description:
      "Support a US-based insurance membership account within the healthcare/finance vertical, assisting members with policy questions, billing concerns, and account updates.",
    achievements: [
      "Maintained a 100% Quality Assurance score across handled calls",
      "Consistently passed Average Handle Time (AHT) targets",
      "Recognized with SJH (Junior High-Representative) honors",
      "Graduated Latin Honors — Magna Cum Laude",
    ],
  },
  {
    company: "Independent Client Engagement",
    role: "Virtual Assistant",
    dates: "2023",
    description:
      "Provided remote administrative support, handling data entry and back-office tasks with an emphasis on accuracy, confidentiality, and turnaround time.",
    achievements: [
      "Maintained high data-accuracy standards across daily entry tasks",
      "Managed recurring administrative workflows independently",
    ],
  },
];

const EDUCATION = {
  school: "University of Cebu — Main Campus",
  degree: "Bachelor of Science in Hospitality Management",
  year: "2024",
  honor: "Magna Cum Laude",
};

const CERTIFICATIONS = [
  {
    name: "MICE Tourism: Tips to Become a Successful Event Planner",
    org: "University of Cebu",
    year: "May 2022",
  },
  {
    name: "Hospitality and Tourism Congress",
    org: "IEC Pavilion, Juan Luna Avenue, Mabolo, Cebu City",
    year: "December 2022",
  },
  {
    name: "Housekeeping and Food & Beverages",
    org: "Mezzo Hotel",
    year: "June 2024",
  },
  {
    name: "Leadership Award",
    org: "Waterfront Cebu City Hotel and Casino",
    year: "June 14, 2024",
  },
];

const HIGHLIGHTS = [
  { stat: "100%", label: "Quality Assurance score maintained on live calls" },
  { stat: "AHT", label: "Consistently within target handle-time benchmarks" },
  { stat: "Magna Cum Laude", label: "Graduated with Latin Honors, BS Hospitality Management" },
  { stat: "2 Roles", label: "Cross-trained across CSR and Virtual Assistant functions" },
];

const TESTIMONIALS = [
  {
    quote:
      "Jane consistently keeps her QA scores at the top of the team. Members trust her because she listens first and explains things clearly.",
    name: "Team Lead",
    context: "Concentrix, Healthcare Account",
  },
  {
    quote:
      "She picked up our CRM workflows quickly and never missed a data-entry deadline. Precise, dependable, and easy to coordinate with remotely.",
    name: "Operations Supervisor",
    context: "Virtual Assistant Engagement, 2023",
  },
  {
    quote:
      "What stands out is how calm she stays with frustrated callers. She turns tense conversations into resolved ones without escalation.",
    name: "Quality Assurance Coach",
    context: "Concentrix, Healthcare Account",
  },
];

const CONTACT = {
  email: "Abejarjane185@gmail.com",
  phone: "0991 642 8744",
  linkedin: "https://ph.linkedin.com/in/jane-harra-marie-abejar-08b555220",
  portfolio: "https://janeharraabejar.vercel.app/",
  location: "Remote (Talisay City, Cebu)",
};

/* ------------------------------------------------------------------ */
/*  Icons (used for both desktop icons and window title bars)          */
/* ------------------------------------------------------------------ */

const ICONS = {
  about: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
    </svg>
  ),
  skills: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 2 2.6 6.6L21 10l-5 4.3L17.4 21 12 17.3 6.6 21 8 14.3 3 10l6.4-1.4Z" strokeLinejoin="round" />
    </svg>
  ),
  experience: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  ),
  education: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" strokeLinejoin="round" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" strokeLinejoin="round" />
    </svg>
  ),
  certifications: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="9" r="6" />
      <path d="m8 14.5-1.5 6L12 18l5.5 2.5-1.5-6" strokeLinejoin="round" />
    </svg>
  ),
  highlights: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4" />
      <path d="M12 13v4M9 21h6" strokeLinecap="round" />
    </svg>
  ),
  testimonials: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" strokeLinejoin="round" />
    </svg>
  ),
  contact: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Window content pieces                                              */
/* ------------------------------------------------------------------ */

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-wide text-[#6c7086]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#cdd6f4]">{value}</p>
    </div>
  );
}

function AboutContent() {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <img
          src="/profile.png"
          alt="Jane Harra Marie C. Abejar"
          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 shadow-[0_0_0_1px_rgba(137,180,250,0.3)] flex-shrink-0"
        />
        <div>
          <h3 className="font-serif text-lg text-[#cdd6f4] leading-tight">
            Jane Harra Marie C. Abejar
          </h3>
          <p className="text-sm text-[#89b4fa] font-medium">
            Customer Service Representative &amp; Virtual Assistant
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm text-[#a6adc8] leading-relaxed">
        I'm from Talisay City, Cebu, and graduated with a Bachelor of Science
        in Hospitality Management in 2024. I currently work remotely as an
        Advisor I — Customer Service Representative, supporting members and
        ensuring a positive experience on every call. Before that, in 2023, I
        worked as a Virtual Assistant, handling data entry and administrative
        tasks with an emphasis on accuracy and efficiency.
      </p>
      <p className="mt-3 text-sm text-[#a6adc8] leading-relaxed">
        I'm a dedicated, hardworking, and fast-learning professional with
        strong communication, customer service, and organizational skills —
        committed to continuous learning and to delivering high-quality work
        in every role I take on.
      </p>

      <div className="mt-5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 grid grid-cols-2 gap-4">
        <Field label="Location" value={CONTACT.location} />
        <Field label="Work Setup" value="Hybrid / Remote" />
        <Field label="Preferred Shift" value="Flexible" />
        <Field label="Available" value="ASAP" />
      </div>
    </div>
  );
}

function SkillsContent() {
  return (
    <div className="p-5 sm:p-6 space-y-5">
      {SKILL_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="font-serif text-base text-[#cdd6f4] mb-2.5">
            {group.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium font-mono px-3 py-1.5 rounded-full bg-[#cba6f7]/10 backdrop-blur-sm border border-[#cba6f7]/25 text-[#cba6f7]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceContent() {
  return (
    <div className="p-5 sm:p-6">
      <div className="relative pl-6">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10" />
        <div className="space-y-8">
          {EXPERIENCE.map((job) => (
            <div key={job.company} className="relative">
              <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#fab387] shadow-[0_0_12px_2px_rgba(250,179,135,0.6)] border-2 border-[#181825]" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-base text-[#cdd6f4]">{job.role}</h3>
                <span className="text-xs text-[#6c7086] font-mono">{job.dates}</span>
              </div>
              <p className="text-xs font-semibold text-[#fab387] mt-0.5">{job.company}</p>
              <p className="mt-2 text-sm text-[#a6adc8] leading-relaxed">
                {job.description}
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {job.achievements.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-xs text-[#a6adc8]">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-[#fab387] flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EducationContent() {
  return (
    <div className="p-5 sm:p-6">
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-5 flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundImage: "linear-gradient(150deg, #a6e3a1, #11111b 130%)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#11111b" strokeWidth="2">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" strokeLinejoin="round" />
            <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="font-serif text-base text-[#cdd6f4]">{EDUCATION.degree}</h3>
          <p className="text-sm text-[#a6e3a1] font-medium mt-1">{EDUCATION.school}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-[#cdd6f4] font-mono">
              Class of {EDUCATION.year}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#a6e3a1] text-[#11111b] font-mono font-semibold">
              {EDUCATION.honor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertificationsContent() {
  return (
    <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
      {CERTIFICATIONS.map((cert) => (
        <div
          key={cert.name}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4"
        >
          <p className="text-[11px] font-mono uppercase tracking-wide text-[#f9e2af] mb-1.5">
            {cert.year}
          </p>
          <h3 className="font-serif text-sm text-[#cdd6f4] leading-snug">{cert.name}</h3>
          <p className="text-xs text-[#a6adc8] mt-1.5">{cert.org}</p>
        </div>
      ))}
    </div>
  );
}

function HighlightsContent() {
  return (
    <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
      {HIGHLIGHTS.map((h) => (
        <div
          key={h.label}
          className="rounded-xl bg-white/5 backdrop-blur-md border border-[#f5c2e7]/20 p-5"
        >
          <p className="font-serif text-xl text-[#f5c2e7]">{h.stat}</p>
          <p className="mt-1.5 text-xs text-[#a6adc8] leading-relaxed">{h.label}</p>
        </div>
      ))}
    </div>
  );
}

function TestimonialsContent() {
  return (
    <div className="p-5 sm:p-6 space-y-4">
      {TESTIMONIALS.map((t, i) => (
        <div
          key={t.name + i}
          className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#94e2d5" className="mb-2">
            <path d="M7 7c-2.2 0-4 1.8-4 4v6h6v-6H6.2C6.4 9.5 7.7 8.3 9.5 8V6C8 6 7 6.3 7 7Zm10 0c-2.2 0-4 1.8-4 4v6h6v-6h-2.8c.2-1.5 1.5-2.7 3.3-3V6c-1.5 0-2.5.3-2.5 1Z" />
          </svg>
          <p className="text-sm text-[#cdd6f4] leading-relaxed">{t.quote}</p>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-sm font-semibold text-[#94e2d5]">{t.name}</p>
            <p className="text-xs text-[#6c7086] font-mono">{t.context}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactContent() {
  const items = [
    { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    { label: "LinkedIn", value: "Jane Harra Marie Abejar", href: CONTACT.linkedin },
    { label: "Portfolio", value: "janeharraabejar.vercel.app", href: CONTACT.portfolio },
  ];

  return (
    <div className="p-5 sm:p-6">
      <p className="text-sm text-[#a6adc8] leading-relaxed">
        Open to hybrid and remote customer service or virtual assistant
        roles. Reach out any time — I usually reply within a day.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={`mailto:${CONTACT.email}`}
          className="inline-flex items-center rounded-full text-[#11111b] text-sm font-mono font-semibold px-5 py-2.5 transition-opacity hover:opacity-90"
          style={{ backgroundImage: "linear-gradient(120deg, #f38ba8, #fab387)" }}
        >
          Email Jane
        </a>
        <a
          href="/resume.pdf"
          download="Jane-Harra-Abejar-Resume.pdf"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 text-[#cdd6f4] text-sm font-mono font-semibold px-5 py-2.5 hover:bg-white/10 hover:border-[#94e2d5]/40 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12" strokeLinecap="round" />
            <path d="m6 11 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 19.5h16" strokeLinecap="round" />
          </svg>
          Download Résumé (PDF)
        </a>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-[#f38ba8]/40 transition-colors"
          >
            <p className="text-[11px] font-mono uppercase tracking-wide text-[#6c7086]">{item.label}</p>
            <p className="mt-1 text-sm font-medium text-[#cdd6f4] break-words">
              {item.value}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App registry — one entry per desktop icon / window                 */
/* ------------------------------------------------------------------ */

const APPS = [
  { id: "about", label: "About", icon: ICONS.about, accent: "#89b4fa", width: 480, height: 460, Content: AboutContent },
  { id: "skills", label: "Skills", icon: ICONS.skills, accent: "#cba6f7", width: 520, height: 480, Content: SkillsContent },
  { id: "experience", label: "Experience", icon: ICONS.experience, accent: "#fab387", width: 560, height: 520, Content: ExperienceContent },
  { id: "education", label: "Education", icon: ICONS.education, accent: "#a6e3a1", width: 460, height: 300, Content: EducationContent },
  { id: "certifications", label: "Certifications", icon: ICONS.certifications, accent: "#f9e2af", width: 560, height: 420, Content: CertificationsContent },
  { id: "highlights", label: "Highlights", icon: ICONS.highlights, accent: "#f5c2e7", width: 520, height: 380, Content: HighlightsContent },
  { id: "testimonials", label: "Testimonials", icon: ICONS.testimonials, accent: "#94e2d5", width: 520, height: 520, Content: TestimonialsContent },
  { id: "contact", label: "Contact", icon: ICONS.contact, accent: "#f38ba8", width: 520, height: 420, Content: ContactContent },
];

/* ------------------------------------------------------------------ */
/*  Desktop icon layout                                                */
/* ------------------------------------------------------------------ */

const ICON_COL_WIDTH = 88;
const ICON_ROW_HEIGHT = 104;
const ICON_TOP_OFFSET = 112;
const ICON_SIDE_PADDING = 12;
const ICON_BOTTOM_PADDING = 96;

function computeInitialIconPositions() {
  if (typeof window === "undefined") return {};
  const vh = window.innerHeight;
  const usableHeight = vh - ICON_TOP_OFFSET - ICON_BOTTOM_PADDING;
  const rows = Math.max(1, Math.floor(usableHeight / ICON_ROW_HEIGHT));

  const positions = {};
  APPS.forEach((app, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    positions[app.id] = {
      x: ICON_SIDE_PADDING + col * ICON_COL_WIDTH,
      y: ICON_TOP_OFFSET + row * ICON_ROW_HEIGHT,
    };
  });
  return positions;
}

/* ------------------------------------------------------------------ */
/*  Clock (taskbar)                                                     */
/* ------------------------------------------------------------------ */

function TaskbarClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div className="hidden sm:flex flex-col items-end px-3 leading-tight font-mono">
      <span className="text-xs font-semibold text-[#cdd6f4]">{time}</span>
      <span className="text-[10px] text-[#6c7086]">{date}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App (window manager + desktop)                                     */
/* ------------------------------------------------------------------ */

let zCounter = 10;

export default function App() {
  const [windows, setWindows] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [iconPositions, setIconPositions] = useState(computeInitialIconPositions);
  const cascadeRef = useRef(0);

  const moveIcon = (id, x, y) => {
    setIconPositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const clampInitial = (app) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const isSmall = vw < 640;
    const width = isSmall ? Math.min(app.width, vw - 24) : app.width;
    const height = isSmall ? Math.min(app.height, vh - 140) : app.height;

    const offset = (cascadeRef.current % 6) * 28;
    cascadeRef.current += 1;

    const baseX = isSmall ? 12 : Math.max(40, vw / 2 - width / 2 - 120);
    const baseY = isSmall ? 60 : Math.max(60, vh / 2 - height / 2 - 60);

    return {
      x: Math.min(baseX + offset, vw - width - 12),
      y: Math.min(baseY + offset, vh - height - 100),
      width,
      height,
      // Every app opens fullscreen on click — the maximize/restore
      // button still lets the visitor shrink it back down afterward.
      maximized: true,
    };
  };

  const nextActiveAfter = (excludeId, snapshot) => {
    const candidates = APPS.filter(
      (a) => a.id !== excludeId && snapshot[a.id]?.open && !snapshot[a.id]?.minimized
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((best, a) =>
      snapshot[a.id].zIndex > snapshot[best.id].zIndex ? a : best
    ).id;
  };

  const openWindow = (id) => {
    zCounter += 1;
    const z = zCounter;
    setWindows((prev) => {
      const existing = prev[id];
      if (existing) {
        return {
          ...prev,
          [id]: { ...existing, open: true, minimized: false, zIndex: z },
        };
      }
      const app = APPS.find((a) => a.id === id);
      const rect = clampInitial(app);
      return {
        ...prev,
        [id]: { ...rect, open: true, minimized: false, zIndex: z },
      };
    });
    setActiveId(id);
  };

  const closeWindow = (id) => {
    setWindows((prev) => {
      const next = { ...prev, [id]: { ...prev[id], open: false } };
      setActiveId((current) => (current === id ? nextActiveAfter(id, next) : current));
      return next;
    });
  };

  const minimizeWindow = (id) => {
    setWindows((prev) => {
      const next = { ...prev, [id]: { ...prev[id], minimized: true } };
      setActiveId((current) => (current === id ? nextActiveAfter(id, next) : current));
      return next;
    });
  };

  const focusWindow = (id) => {
    zCounter += 1;
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], zIndex: zCounter, minimized: false },
    }));
    setActiveId(id);
  };

  const toggleMaximize = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], maximized: !prev[id].maximized },
    }));
  };

  const moveWindow = (id, x, y) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], x, y },
    }));
  };

  const openIds = useMemo(
    () => APPS.filter((a) => windows[a.id]?.open).map((a) => a.id),
    [windows]
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans text-[#cdd6f4] bg-[#11111b]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        @keyframes window-in {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-window-in { animation: window-in 160ms ease-out; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(166,227,161,0.6); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(166,227,161,0); }
        }
        .pulse-dot { animation: pulse-dot 2.2s ease-in-out infinite; }
      `}</style>

      {/* Wallpaper: dark gradient base */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#232438_0%,#11111b_55%)]" />

      {/* Subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(rgba(205,214,244,0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Wallpaper art — headset / support-chat motif, blended into the rice desktop */}
      <img
        src="/wallpaper.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
      />

      {/* Ambient neon glow orbs */}
      <div className="pointer-events-none absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#cba6f7]/20 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/2 -left-24 w-96 h-96 rounded-full bg-[#89b4fa]/20 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 w-[26rem] h-[26rem] rounded-full bg-[#94e2d5]/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 w-72 h-72 rounded-full bg-[#f5c2e7]/10 blur-[100px]" />

      {/* Desktop icons — freely draggable anywhere on the desktop */}
      <div className="absolute inset-0 pb-14">
        <div className="px-4 sm:px-8 pt-5 sm:pt-6 max-w-xs sm:max-w-sm pointer-events-none">
          <h1 className="font-serif font-bold text-xl sm:text-3xl bg-clip-text text-transparent bg-[linear-gradient(120deg,#cba6f7,#89b4fa_45%,#94e2d5)]">
            Jane Harra Marie C. Abejar
          </h1>
          <p className="text-xs sm:text-sm text-[#6c7086] font-mono mt-1">
            $ tap an icon to open · drag to move
          </p>
        </div>

        {APPS.map((app) => {
          const pos = iconPositions[app.id] || { x: ICON_SIDE_PADDING, y: ICON_TOP_OFFSET };
          return (
            <DesktopIcon
              key={app.id}
              app={app}
              x={pos.x}
              y={pos.y}
              onMove={moveIcon}
              onOpen={openWindow}
              isActive={windows[app.id]?.open && !windows[app.id]?.minimized}
            />
          );
        })}
      </div>

      {/* Windows */}
      {APPS.map((app) => {
        const w = windows[app.id];
        if (!w || !w.open) return null;
        return (
          <Window
            key={app.id}
            id={app.id}
            title={app.label}
            icon={app.icon}
            accent={app.accent}
            x={w.x}
            y={w.y}
            width={w.width}
            height={w.height}
            zIndex={w.zIndex}
            minimized={w.minimized}
            maximized={w.maximized}
            focused={activeId === app.id}
            onFocus={() => focusWindow(app.id)}
            onClose={() => closeWindow(app.id)}
            onMinimize={() => minimizeWindow(app.id)}
            onToggleMaximize={() => toggleMaximize(app.id)}
            onMove={moveWindow}
          >
            <app.Content />
          </Window>
        );
      })}

      {/* Taskbar — Waybar-style */}
      <div className="fixed bottom-0 left-0 right-0 h-14 z-[9999]">
        <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,#cba6f7,#89b4fa,#94e2d5,#f5c2e7)] opacity-70" />
        <div className="h-full bg-[#11111b]/80 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/10 flex items-center px-2 sm:px-4 gap-2">
          <div className="flex items-center gap-2 flex-shrink-0 pr-2 sm:pr-3 border-r border-white/10">
            <span
              className="w-8 h-8 rounded-lg text-[#11111b] flex items-center justify-center text-xs font-mono font-bold"
              style={{ backgroundImage: "linear-gradient(135deg, #cba6f7, #89b4fa)" }}
            >
              JA
            </span>
          </div>

          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {openIds.map((id) => {
              const app = APPS.find((a) => a.id === id);
              const w = windows[id];
              const focused = activeId === id && !w.minimized;
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (!w.minimized && focused) {
                      minimizeWindow(id);
                    } else {
                      focusWindow(id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono flex-shrink-0 transition-colors border ${
                    w.minimized
                      ? "bg-white/5 border-white/10 text-[#6c7086]"
                      : focused
                      ? "bg-white/10 text-[#cdd6f4]"
                      : "bg-white/5 border-white/10 text-[#a6adc8]"
                  }`}
                  style={focused ? { borderColor: `${app.accent}80`, boxShadow: `0 0 12px -2px ${app.accent}70` } : undefined}
                >
                  <span style={{ color: app.accent }} className="w-4 h-4 flex items-center justify-center">
                    {app.icon}
                  </span>
                  <span className="hidden sm:inline">{app.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 border-l border-white/10 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#a6e3a1] pulse-dot flex-shrink-0" />
            <span className="text-[11px] font-mono text-[#a6adc8]">open to work</span>
          </div>

          <a
            href="/resume.pdf"
            download="Jane-Harra-Abejar-Resume.pdf"
            aria-label="Download résumé (PDF)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold flex-shrink-0 border border-[#94e2d5]/30 bg-[#94e2d5]/10 text-[#94e2d5] hover:bg-[#94e2d5]/20 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12" strokeLinecap="round" />
              <path d="m6 11 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 19.5h16" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Résumé</span>
          </a>

          <TaskbarClock />
        </div>
      </div>
    </div>
  );
}
