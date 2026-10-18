import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Sun, Moon, ArrowRight, Menu, X, Sparkles, Activity } from 'lucide-react';

export default function PublicNavbar({ theme = 'dark', toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Overview' },
    { path: '/platform', label: 'Platform & Architecture' },
    { path: '/research', label: 'Research (15 Questions)' },
    { path: '/methodology', label: 'Academic Rigor' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`public-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="public-nav-container">
        {/* Brand Identity */}
        <Link to="/" className="public-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-badge" style={{ width: 34, height: 34, borderRadius: 8 }}>
            <ShieldAlert size={19} />
          </div>
          <div className="public-brand-text">
            <div className="public-brand-name">
              IoT PULSE
              <span className="brand-badge-pill" style={{ marginLeft: 6, fontSize: '0.66rem' }}>
                Network Intelligence
              </span>
            </div>
            <div className="public-brand-sub">RT-IOT2022 Analytics Platform</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="public-nav-links">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`public-nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.label}
              {isActive(item.path) && <span className="public-nav-indicator" />}
            </Link>
          ))}
        </nav>

        {/* Actions & CTA */}
        <div className="public-nav-actions">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Launch Dashboard Primary Button */}
          <Link to="/dashboard" className="btn btn-primary public-cta-btn">
            <span>Launch Analytics</span>
            <ArrowRight size={15} />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="public-mobile-drawer">
          <div className="public-mobile-nav">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`public-mobile-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.label}</span>
                {isActive(item.path) && <span className="nav-badge">Current</span>}
              </Link>
            ))}
            <div style={{ padding: '14px 0 0 0', borderTop: '1px solid var(--border-subtle)', marginTop: 8 }}>
              <Link
                to="/dashboard"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Open Interactive Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
