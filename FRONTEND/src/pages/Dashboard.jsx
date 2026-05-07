import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const ROLES = [
  'Frontend Engineer', 'Backend Engineer', 'Full-Stack Engineer',
  'Product Manager', 'Data Scientist', 'UX Designer',
  'DevOps Engineer', 'Marketing Manager', 'Software Engineer',
];

const mockSuggestions = [
  { text: 'Add measurable impact to bullet 2 in Work Experience', priority: 'high' },
  { text: "Mention 'TypeScript' and 'CI/CD' explicitly in skills", priority: 'high' },
  { text: 'Tighten your summary to 3 clear, punchy sentences', priority: 'medium' },
  { text: 'Add a LinkedIn URL to your contact section', priority: 'medium' },
  { text: 'Include a GitHub link with at least 3 starred projects', priority: 'low' },
];

const mockMetrics = [
  { label: 'Keywords', value: 92, color: '#3b82c4' },
  { label: 'Structure', value: 88, color: '#3b82c4' },
  { label: 'Impact', value: 81, color: '#e05f3b' },
  { label: 'Role fit', value: 84, color: '#3b82c4' },
];

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [step, setStep] = useState('idle'); // idle | analyzing | done
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleAnalyze = () => {
    if (!file) return;
    setStep('analyzing');
    setTimeout(() => setStep('done'), 2800);
  };

  const resetAll = () => {
    setFile(null);
    setRole('');
    setStep('idle');
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/" className="sidebar__logo">
          ResumeIQ <span className="sidebar__dot" />
        </Link>

        <nav className="sidebar__nav">
          <a href="#" className="sidebar__link sidebar__link--active">
            <span>◈</span> Analyses
          </a>
          <a href="#" className="sidebar__link">
            <span>↓</span> Downloads
          </a>
          <a href="#" className="sidebar__link">
            <span>⚙</span> Settings
          </a>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__avatar">JS</div>
          <div>
            <p className="sidebar__name">Jane Smith</p>
            <p className="sidebar__email">jane@example.com</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Resume Analyzer</h1>
            <p className="dash-sub">Upload your resume and get an instant ATS score.</p>
          </div>
          {step === 'done' && (
            <button className="btn btn--ghost" onClick={resetAll}>
              ↺ New analysis
            </button>
          )}
        </div>

        {step === 'idle' && (
          <div className="upload-section fade-up">
            {/* Drop zone */}
            <div
              className={`dropzone ${dragOver ? 'dropzone--over' : ''} ${file ? 'dropzone--has-file' : ''}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <div className="dropzone__file-icon">📄</div>
                  <p className="dropzone__filename">{file.name}</p>
                  <p className="dropzone__hint">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <div className="dropzone__icon">↑</div>
                  <p className="dropzone__label">Drop your resume here</p>
                  <p className="dropzone__hint">PDF or DOCX · max 5 MB</p>
                </>
              )}
            </div>

            {/* Role selector */}
            <div className="form-group">
              <label htmlFor="role">Target role <span className="optional">(optional)</span></label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select a role…</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <button
              className={`analyze-btn ${!file ? 'analyze-btn--disabled' : ''}`}
              onClick={handleAnalyze}
              disabled={!file}
            >
              <span>✦</span> Analyze my resume
            </button>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="analyzing-state fade-up">
            <div className="analyzing-spinner" />
            <h2 className="analyzing-title">Analyzing your resume…</h2>
            <p className="analyzing-sub">Parsing structure, scoring keywords, matching role fit.</p>
            <div className="analyzing-steps">
              {['Parsing document', 'Scoring keywords', 'Evaluating impact', 'Generating suggestions'].map((s, i) => (
                <div className="analyzing-step" key={s} style={{ animationDelay: `${i * 0.5}s` }}>
                  <span className="analyzing-step__dot" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="results fade-up">
            {/* Score overview */}
            <div className="results__top">
              <div className="score-hero">
                <div className="score-hero__number">86</div>
                <div>
                  <div className="score-hero__label">ATS Score</div>
                  <div className="score-badge">↑ +24 vs. baseline</div>
                </div>
              </div>
              <div className="score-bars">
                {mockMetrics.map((m) => (
                  <div className="score-bar-row" key={m.label}>
                    <div className="score-bar-row__meta">
                      <span>{m.label}</span>
                      <strong>{m.value}</strong>
                    </div>
                    <div className="score-bar-row__track">
                      <div
                        className="score-bar-row__fill"
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="results__suggestions">
              <h2 className="results__section-title">Suggestions</h2>
              <div className="suggestion-list">
                {mockSuggestions.map((s, i) => (
                  <div className="suggestion-item" key={i}>
                    <span className={`s-pill s-pill--${s.priority}`}>{s.priority}</span>
                    <span className="s-text">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download */}
            <div className="results__download">
              <div className="download-card">
                <div className="download-card__left">
                  <div className="download-card__icon">📄</div>
                  <div>
                    <p className="download-card__title">Improved resume ready</p>
                    <p className="download-card__sub">Polished, recruiter-ready PDF · 1 page</p>
                  </div>
                </div>
                <button className="btn btn--primary">↓ Download PDF</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
