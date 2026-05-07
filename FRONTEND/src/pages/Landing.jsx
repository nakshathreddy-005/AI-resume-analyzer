import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
  {
    icon: '⬡',
    title: 'Smart Parsing',
    desc: 'Extracts text from PDF and DOCX with structure-aware analysis — headings, bullets, dates all understood.',
  },
  {
    icon: '◎',
    title: 'ATS Score',
    desc: '0–100 score with breakdown across keywords, clarity, structure, and role impact.',
  },
  {
    icon: '✦',
    title: 'AI Suggestions',
    desc: 'Specific, prioritized fixes — not vague advice. Know exactly what to change and why.',
  },
  {
    icon: '⌖',
    title: 'Role-targeted',
    desc: 'Tailor scoring to any job role you\'re aiming for. Frontend engineer ≠ product manager.',
  },
  {
    icon: '↓',
    title: 'Improved PDF',
    desc: 'Download a polished, recruiter-ready version of your resume instantly.',
  },
  {
    icon: '⬡',
    title: 'Private by default',
    desc: 'Your resume stays in your account. We don\'t train on your data. Ever.',
  },
];

export default function Landing() {
  return (
    <main className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-grid" aria-hidden />
        <div className="container">
          <div className="hero__badge fade-up">
            <span className="hero__badge-dot" />
            AI-powered resume analysis
          </div>

          <h1 className="hero__headline fade-up-1">
            Land more interviews<br />
            with a resume <em>that ranks.</em>
          </h1>

          <p className="hero__sub fade-up-2">
            Upload your resume, pick a target role, and get an instant ATS score
            with concrete suggestions and a polished, recruiter-ready PDF — in seconds.
          </p>

          <div className="hero__ctas fade-up-3">
            <Link to="/auth" className="btn btn--primary btn--lg">
              <span>✦</span> Analyze my resume
            </Link>
            <Link to="/dashboard" className="btn btn--ghost btn--lg">
              Go to dashboard
            </Link>
          </div>

          <p className="hero__trust fade-up-4">
            Free to try &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Results in under 30 seconds
          </p>

          {/* Score card preview */}
          <div className="hero__preview fade-up-4">
            <ScoreCard />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">Everything you need to stand out</h2>
          <p className="section-sub">
            From parsing to scoring to polishing — ResumeIQ handles the entire flow.
          </p>
          <div className="features__grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-banner__inner">
            <h2 className="cta-banner__title">Ready to upgrade your resume?</h2>
            <p className="cta-banner__sub">
              Sign up free and analyze your first resume in under a minute.
            </p>
            <Link to="/auth" className="btn btn--primary btn--lg btn--coral">
              Get started — it's free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <span className="footer__logo">ResumeIQ<span className="footer__dot" /></span>
          <span className="footer__copy">© 2026 ResumeIQ. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}

/* Inline Score Card preview component */
function ScoreCard() {
  const metrics = [
    { label: 'Keywords', value: 92 },
    { label: 'Structure', value: 88 },
    { label: 'Impact', value: 81 },
    { label: 'Role fit', value: 84 },
  ];

  const suggestions = [
    { text: 'Add measurable impact to bullet 2', priority: 'high' },
    { text: "Mention 'TypeScript' and 'CI/CD' explicitly", priority: 'high' },
    { text: 'Tighten summary to 3 sentences', priority: 'medium' },
  ];

  return (
    <div className="score-card">
      <div className="score-card__header">
        <div className="score-card__main-score">
          <span className="score-card__number">86</span>
          <div className="score-card__badge">
            <span>↑</span> +24 vs. baseline
          </div>
        </div>
        <div className="score-card__label">ATS Score</div>
      </div>

      <div className="score-card__metrics">
        {metrics.map((m) => (
          <div className="score-metric" key={m.label}>
            <div className="score-metric__top">
              <span className="score-metric__label">{m.label}</span>
              <span className="score-metric__val">{m.value}</span>
            </div>
            <div className="score-metric__bar">
              <div
                className="score-metric__fill"
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="score-card__suggestions">
        <p className="score-card__suggestions-title">Top suggestions</p>
        {suggestions.map((s, i) => (
          <div className="suggestion" key={i}>
            <span className={`suggestion__pill suggestion__pill--${s.priority}`}>
              {s.priority}
            </span>
            <span className="suggestion__text">{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
