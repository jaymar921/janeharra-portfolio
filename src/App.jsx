import { useEffect, useState } from "react";
import "./App.css";

/* ------------------------------------------------------------------ */
/*  Design tokens (peach + navy palette, referenced via arbitrary      */
/*  Tailwind values so no config changes are required)                 */
/*                                                                      */
/*  Cream bg     #FFF8F0     Peach 100   #FFE9D6                       */
/*  Peach 300    #F6C99B     Peach accent #F2A65A                      */
/*  Peach deep   #DB8A46     Navy        #1B2A41                       */
/*  Charcoal     #2E2A26                                                */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "highlights", label: "Highlights" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

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
/*  Small shared building blocks                                       */
/* ------------------------------------------------------------------ */

function FadeIn({ children, delay = 0, className = "" }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`transition-all duration-700 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionEyebrow({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2 rounded-full bg-[#F2A65A]" />
      <span className="w-2 h-2 rounded-full bg-[#F6C99B]" />
      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#DB8A46]">
        {children}
      </span>
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-2xl mb-12">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2 className="font-serif text-3xl sm:text-4xl text-[#1B2A41] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[#5B5147] leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav                                                                 */
/* ------------------------------------------------------------------ */

function Nav() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/50 backdrop-blur-xl backdrop-saturate-150 border-b border-white/60 shadow-[0_1px_20px_rgba(219,138,70,0.08)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-2 font-serif text-lg text-[#1B2A41] flex-shrink-0"
        >
          <span className="w-8 h-8 rounded-full bg-[#1B2A41] text-[#FFE9D6] flex items-center justify-center text-xs font-semibold flex-shrink-0">
            JA
          </span>
          <span className="hidden sm:inline">Jane Abejar</span>
        </button>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm text-[#5B5147] hover:text-[#DB8A46] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => scrollTo("contact")}
          className="hidden md:inline-flex items-center rounded-full bg-[#1B2A41] text-[#FFE9D6] text-sm font-medium px-5 py-2 hover:bg-[#28405e] transition-colors"
        >
          Let's talk
        </button>

        <button
          className="md:hidden text-[#1B2A41]"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white/60 backdrop-blur-xl border-t border-white/60 px-4 py-3 flex flex-col">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-left text-sm text-[#5B5147] hover:text-[#DB8A46] py-3 border-b border-[#F0DCC4]/60 last:border-0"
            >
              {link.label}
            </button>
          ))}
          <a
            href={`mailto:${CONTACT.email}`}
            className="mt-3 inline-flex items-center justify-center rounded-full bg-[#1B2A41] text-[#FFE9D6] text-sm font-medium px-5 py-3"
          >
            Let's talk
          </a>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F6C99B]/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#F2A65A]/20 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-20 grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-12 items-center">
        <FadeIn>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#3FA35C] flex-shrink-0" />
            <span className="text-sm text-[#5B5147]">Available for hybrid or remote roles</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1B2A41] leading-[1.15] sm:leading-[1.1]">
            Jane Harra Marie C. Abejar
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-[#DB8A46] font-medium">
            Customer Service Representative &amp; Virtual Assistant
          </p>

          <p className="mt-5 max-w-xl text-[#5B5147] leading-relaxed">
            Magna Cum Laude graduate in Hospitality Management, now supporting
            US-based healthcare and insurance members with clear, patient,
            solutions-first service — backed by hands-on virtual assistant
            experience in data entry and administrative support.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-[#5B5147]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {CONTACT.location}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex items-center justify-center rounded-full bg-[#1B2A41] text-[#FFE9D6] text-sm font-medium px-6 py-3 hover:bg-[#28405e] transition-colors"
            >
              Email Jane
            </a>
            <a
              href={CONTACT.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#DB8A46] text-[#DB8A46] text-sm font-medium px-6 py-3 hover:bg-[#FFE9D6] transition-colors"
            >
              View LinkedIn
            </a>
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center rounded-full border border-[#E7DAC7] text-[#5B5147] text-sm font-medium px-6 py-3 hover:bg-white transition-colors"
            >
              {CONTACT.phone}
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="relative mx-auto w-64 sm:w-72">
            <div className="absolute inset-0 rounded-[2rem] bg-[#F2A65A]/30 rotate-6" />
            <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-[#F6C99B]">
              <img
                src="/profile.png"
                alt="Jane Harra Marie C. Abejar"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg px-4 py-3 border border-white/70">
              <p className="text-xs text-[#8A7F70]">Latin Honors</p>
              <p className="text-sm font-semibold text-[#1B2A41]">Magna Cum Laude</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  About                                                               */
/* ------------------------------------------------------------------ */

function About() {
  const facts = [
    { label: "Location", value: CONTACT.location },
    { label: "Work Setup", value: "Hybrid / Remote" },
    { label: "Preferred Shift", value: "Flexible" },
    { label: "Available", value: "ASAP" },
  ];

  return (
    <section id="about" className="relative bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#F6C99B]/30 blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-20 grid md:grid-cols-[1.3fr_1fr] gap-12">
        <FadeIn>
          <SectionHeading
            eyebrow="About"
            title="A dependable voice on the other end of the line"
          />
          <p className="text-[#5B5147] leading-relaxed">
            I'm from Talisay City, Cebu, and graduated with a Bachelor of
            Science in Hospitality Management in 2024. I currently work
            remotely as an Advisor I — Customer Service Representative,
            supporting members and ensuring a positive experience on every
            call. Before that, in 2023, I worked as a Virtual Assistant,
            handling data entry and administrative tasks with an emphasis on
            accuracy and efficiency.
          </p>
          <p className="mt-4 text-[#5B5147] leading-relaxed">
            I'm a dedicated, hardworking, and fast-learning professional with
            strong communication, customer service, and organizational
            skills — committed to continuous learning and to delivering
            high-quality work in every role I take on.
          </p>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 shadow-sm p-6 grid grid-cols-2 gap-5">
            {facts.map((f) => (
              <div key={f.label}>
                <p className="text-xs uppercase tracking-wide text-[#B99A6E]">
                  {f.label}
                </p>
                <p className="mt-1 text-sm font-medium text-[#1B2A41]">
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills                                                              */
/* ------------------------------------------------------------------ */

function Skills() {
  return (
    <section id="skills" className="bg-[#FFF8F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <SectionHeading
          eyebrow="Skills"
          title="What I bring to the queue"
          subtitle="A blend of frontline support skills and back-office reliability, built across customer service and virtual assistant work."
        />

        <div className="grid sm:grid-cols-2 gap-6">
          {SKILL_GROUPS.map((group, i) => (
            <FadeIn key={group.title} delay={i * 80}>
              <div className="bg-white rounded-2xl border border-[#F0DCC4] p-6 h-full shadow-sm">
                <h3 className="font-serif text-lg text-[#1B2A41] mb-4">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#FFE9D6] text-[#8A5A2C]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Experience                                                          */
/* ------------------------------------------------------------------ */

function Experience() {
  return (
    <section id="experience" className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <SectionHeading
          eyebrow="Experience"
          title="Where I've worked"
        />

        <div className="relative pl-8 sm:pl-10">
          <div className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px bg-[#F0DCC4]" />

          <div className="space-y-12">
            {EXPERIENCE.map((job, i) => (
              <FadeIn key={job.company} delay={i * 100}>
                <div className="relative">
                  <span className="absolute -left-8 sm:-left-10 top-1.5 w-4 h-4 rounded-full bg-[#F2A65A] border-4 border-[#FFF8F0]" />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl text-[#1B2A41]">
                      {job.role}
                    </h3>
                    <span className="text-sm text-[#B99A6E] font-medium">
                      {job.dates}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#DB8A46] mt-0.5">
                    {job.company}
                  </p>
                  <p className="mt-3 text-[#5B5147] leading-relaxed max-w-2xl">
                    {job.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {job.achievements.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-sm text-[#5B5147]">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F2A65A] flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Education                                                           */
/* ------------------------------------------------------------------ */

function Education() {
  return (
    <section id="education" className="bg-[#FFF8F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <SectionHeading eyebrow="Education" title="Academic background" />

        <FadeIn>
          <div className="bg-white rounded-2xl border border-[#F0DCC4] shadow-sm p-8 max-w-2xl flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#1B2A41] flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFE9D6" strokeWidth="2">
                <path d="M22 10 12 5 2 10l10 5 10-5Z" strokeLinejoin="round" />
                <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#1B2A41]">
                {EDUCATION.degree}
              </h3>
              <p className="text-sm text-[#DB8A46] font-medium mt-1">
                {EDUCATION.school}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs px-3 py-1 rounded-full bg-[#FFE9D6] text-[#8A5A2C] font-medium">
                  Class of {EDUCATION.year}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#1B2A41] text-[#FFE9D6] font-medium">
                  {EDUCATION.honor}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Certifications                                                      */
/* ------------------------------------------------------------------ */

function Certifications() {
  return (
    <section id="certifications" className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <SectionHeading
          eyebrow="Certifications"
          title="Training & recognitions"
        />

        <div className="grid sm:grid-cols-2 gap-5">
          {CERTIFICATIONS.map((cert, i) => (
            <FadeIn key={cert.name} delay={i * 70}>
              <div className="rounded-2xl border border-[#F0DCC4] bg-[#FFF8F0] p-6 h-full">
                <p className="text-xs uppercase tracking-wide text-[#B99A6E] mb-2">
                  {cert.year}
                </p>
                <h3 className="font-serif text-base text-[#1B2A41] leading-snug">
                  {cert.name}
                </h3>
                <p className="text-sm text-[#5B5147] mt-2">{cert.org}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Highlights (adapted "projects" section — measurable outcomes)      */
/* ------------------------------------------------------------------ */

function Highlights() {
  return (
    <section id="highlights" className="bg-[#1B2A41]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#F2A65A]" />
            <span className="w-2 h-2 rounded-full bg-[#F6C99B]" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F2A65A]">
              Highlights
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight">
            Results on record
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HIGHLIGHTS.map((h, i) => (
            <FadeIn key={h.label} delay={i * 80}>
              <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 h-full shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
                <p className="font-serif text-2xl text-[#F2A65A]">{h.stat}</p>
                <p className="mt-2 text-sm text-[#D8CFC2] leading-relaxed">
                  {h.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                        */
/* ------------------------------------------------------------------ */

function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#FFF8F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <SectionHeading
          eyebrow="Testimonials"
          title="What teams say"
        />

        <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name + i} delay={i * 90} className="snap-start flex-shrink-0">
              <div className="w-[85vw] max-w-80 sm:w-80 bg-white rounded-2xl border border-[#F0DCC4] shadow-sm p-6 h-full flex flex-col">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#F2A65A" className="mb-3">
                  <path d="M7 7c-2.2 0-4 1.8-4 4v6h6v-6H6.2C6.4 9.5 7.7 8.3 9.5 8V6C8 6 7 6.3 7 7Zm10 0c-2.2 0-4 1.8-4 4v6h6v-6h-2.8c.2-1.5 1.5-2.7 3.3-3V6c-1.5 0-2.5.3-2.5 1Z" />
                </svg>
                <p className="text-sm text-[#5B5147] leading-relaxed flex-1">
                  {t.quote}
                </p>
                <div className="mt-4 pt-4 border-t border-[#F0DCC4]">
                  <p className="text-sm font-semibold text-[#1B2A41]">{t.name}</p>
                  <p className="text-xs text-[#B99A6E]">{t.context}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact                                                             */
/* ------------------------------------------------------------------ */

function Contact() {
  const items = [
    {
      label: "Email",
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
    },
    {
      label: "Phone",
      value: CONTACT.phone,
      href: `tel:${CONTACT.phone.replace(/\s/g, "")}`,
    },
    {
      label: "LinkedIn",
      value: "Jane Harra Marie Abejar",
      href: CONTACT.linkedin,
    },
    {
      label: "Portfolio",
      value: "janeharraabejar.vercel.app",
      href: CONTACT.portfolio,
    },
  ];

  return (
    <section id="contact" className="relative bg-[#FFF8F0] overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#F2A65A]/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#F6C99B]/40 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <div className="rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 p-6 sm:p-12 grid md:grid-cols-[1fr_1fr] gap-10">
          <FadeIn>
            <SectionEyebrow>Contact</SectionEyebrow>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1B2A41] leading-tight">
              Let's work together
            </h2>
            <p className="mt-3 text-[#6B5A3E] max-w-md leading-relaxed">
              Open to hybrid and remote customer service or virtual assistant
              roles. Reach out any time — I usually reply within a day.
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-6 inline-flex items-center rounded-full bg-[#1B2A41] text-[#FFE9D6] text-sm font-medium px-6 py-3 hover:bg-[#28405e] transition-colors"
            >
              Email Jane
            </a>
          </FadeIn>

          <FadeIn delay={120}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white/70 hover:bg-white/70 hover:border-[#DB8A46]/50 transition-colors"
                >
                  <p className="text-xs uppercase tracking-wide text-[#B99A6E]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#1B2A41] break-words">
                    {item.value}
                  </p>
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="bg-[#1B2A41]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-[#D8CFC2]">
          © {new Date().getFullYear()} Jane Harra Marie C. Abejar. All rights reserved.
        </p>
        <p className="text-xs text-[#8E9BB0]">
          Customer Service Representative &amp; Virtual Assistant
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <div className="font-sans bg-[#FFF8F0] text-[#2E2A26]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>

      <Nav />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Education />
      <Certifications />
      <Highlights />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
