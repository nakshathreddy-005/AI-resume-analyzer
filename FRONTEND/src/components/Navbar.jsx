import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          ResumeIQ
          <span className="navbar__logo-dot" />
        </Link>

        {/* Links */}
        <ul className="navbar__links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li>
            <Link to="/auth" className={location.pathname === '/auth' ? 'active' : ''}>
              Sign in
            </Link>
          </li>
        </ul>

        {/* CTAs */}
        <div className="navbar__actions">
          <Link to="/dashboard" className="btn btn--ghost">Dashboard</Link>
          <Link to="/auth" className="btn btn--primary">
            <span>✦</span> Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
