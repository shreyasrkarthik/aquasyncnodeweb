import React, { useEffect, useRef, useState } from 'react';

/**
 * React component for the AquaSync MVP.
 *
 * This component fetches dummy data from the backend API and displays
 * several sections describing the product along with interactive
 * charts. The charts are drawn using Chart.js on canvas elements
 * referenced via `useRef` hooks. Data is stored in state variables and
 * charts are initialised when the data arrives.
 */
const App: React.FC = () => {
  // State for descriptive information
  const [info, setInfo] = useState<any>(null);
  // State for chart data
  const [energy, setEnergy] = useState<{ labels: string[]; data: number[]; unit: string } | null>(null);
  const [quality, setQuality] = useState<{ labels: string[]; data: number[]; unit: string } | null>(null);
  const [status, setStatus] = useState<{ labels: string[]; data: number[] } | null>(null);

  // References to canvas elements
  const energyRef = useRef<HTMLCanvasElement>(null);
  const qualityRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLCanvasElement>(null);

  // Chart instance refs for cleanup
  const energyChartRef = useRef<any>(null);
  const qualityChartRef = useRef<any>(null);
  const statusChartRef = useRef<any>(null);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');

  // Base API URL. Uses environment variable for production deployment
  // Falls back to localhost for development
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Apply theme on mount and when changed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch data once after the component mounts
  useEffect(() => {
    // Fetch descriptive info
    fetch(`${API_BASE}/info`)
      .then((res) => res.json())
      .then((data) => setInfo(data))
      .catch((err) => console.error('Failed to fetch info', err));
    // Fetch energy data
    fetch(`${API_BASE}/energy`)
      .then((res) => res.json())
      .then((data) => setEnergy(data))
      .catch((err) => console.error('Failed to fetch energy data', err));
    // Fetch quality data
    fetch(`${API_BASE}/quality`)
      .then((res) => res.json())
      .then((data) => setQuality(data))
      .catch((err) => console.error('Failed to fetch quality data', err));
    // Fetch status distribution
    fetch(`${API_BASE}/status`)
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch((err) => console.error('Failed to fetch status data', err));
  }, []);

  // Lazy render charts when canvases enter viewport
  useEffect(() => {
    const createEnergy = async () => {
      if (!energy || !energyRef.current) return;
      const ctx = energyRef.current.getContext('2d');
      if (!ctx) return;
      const { Chart } = await import('chart.js/auto');
      if (energyChartRef.current) energyChartRef.current.destroy();
      energyChartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: energy.labels,
          datasets: [
            {
              label: `Energy Consumption (${energy.unit})`,
              data: energy.data,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.2)',
              fill: true,
              tension: 0.2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        },
      });
    };

    const createQuality = async () => {
      if (!quality || !qualityRef.current) return;
      const ctx = qualityRef.current.getContext('2d');
      if (!ctx) return;
      const { Chart } = await import('chart.js/auto');
      if (qualityChartRef.current) qualityChartRef.current.destroy();
      qualityChartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: quality.labels,
          datasets: [
            {
              label: `Water Quality (${quality.unit})`,
              data: quality.data,
              backgroundColor: '#28a745',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        },
      });
    };

    const createStatus = async () => {
      if (!status || !statusRef.current) return;
      const ctx = statusRef.current.getContext('2d');
      if (!ctx) return;
      const { Chart } = await import('chart.js/auto');
      if (statusChartRef.current) statusChartRef.current.destroy();
      statusChartRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: status.labels,
          datasets: [
            { data: status.data, backgroundColor: ['#ffc107', '#fd7e14', '#dc3545'] },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    };

    const observers: IntersectionObserver[] = [];
    const makeObserver = (el: HTMLCanvasElement | null, cb: () => void) => {
      if (!el) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cb();
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      obs.observe(el);
      observers.push(obs);
    };

    makeObserver(energyRef.current, createEnergy);
    makeObserver(qualityRef.current, createQuality);
    makeObserver(statusRef.current, createStatus);

    return () => {
      observers.forEach((o) => o.disconnect());
      energyChartRef.current?.destroy?.();
      qualityChartRef.current?.destroy?.();
      statusChartRef.current?.destroy?.();
    };
  }, [energy, quality, status]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div>
      {/* Navigation bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#home">AquaSync</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#problem">Problem</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#solution">Solution</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#dashboard">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#model">Model</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#team">Team</a>
              </li>
              <li className="nav-item d-flex align-items-center ms-2">
                <button className="btn btn-sm btn-outline-light" onClick={toggleTheme} aria-label="Toggle dark mode">
                  {theme === 'dark' ? <i className="bi bi-sun"></i> : <i className="bi bi-moon"></i>}
                </button>
              </li>
              <li className="nav-item d-none d-md-block ms-2">
                <button className="btn btn-warning" data-bs-toggle="offcanvas" data-bs-target="#demoOffcanvas">
                  Book a Demo
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <header id="home" className="hero d-flex align-items-center text-white">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Securing India’s Water Future</h1>
          <p className="lead mb-4">AI‑native OS for decentralised water treatment</p>
          <div className="cta-group d-flex gap-3 justify-content-center">
            <a href="#dashboard" className="btn btn-light btn-lg">
              <i className="bi bi-speedometer2 me-2"></i>
              View Demo
            </a>
            <a href="#solution" className="btn btn-outline-light btn-lg">
              <i className="bi bi-cpu me-2"></i>
              See How It Works
            </a>
          </div>
        </div>
      </header>
      <div className="hero-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120"><path fill="#ffffff" fillOpacity="1" d="M0,64L60,69.3C120,75,240,85,360,96C480,107,600,117,720,106.7C840,96,960,64,1080,64C1200,64,1320,96,1380,112L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path></svg>
      </div>

      {/* Stats strip */}
      <section className="container stats-strip p-3">
        <div className="row text-center">
          <div className="col-6 col-md-3 stat">
            <h3>12+</h3>
            <p>Pilot Plants</p>
          </div>
          <div className="col-6 col-md-3 stat">
            <h3>25%</h3>
            <p>Energy Savings</p>
          </div>
          <div className="col-6 col-md-3 stat">
            <h3>3x</h3>
            <p>Fewer Breakdowns</p>
          </div>
          <div className="col-6 col-md-3 stat">
            <h3>24/7</h3>
            <p>Predictive Monitoring</p>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section id="problem" className="py-5 bg-light">
        <div className="container">
          <h2 className="mb-4">The Problem</h2>
          {info ? (
            <>
              <p>{info.context}</p>
              <div className="row mt-3">
                <div className="col-md-6">
                  <h5>For Plant Owners</h5>
                  <p>{info.problem.owners}</p>
                </div>
                <div className="col-md-6">
                  <h5>For Service Vendors</h5>
                  <p>{info.problem.vendors}</p>
                </div>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </section>

      {/* Solution section */}
      <section id="solution" className="py-5">
        <div className="container">
          <h2 className="mb-4">Our Solution</h2>
          {info ? (
            <div className="row text-center">
              <div className="col-md-4 mb-4">
                <div className="feature-icon bg-soft-primary">
                  <i className="bi bi-diagram-3 fs-4"></i>
                </div>
                <h5>IoT Modules</h5>
                <p>{info.solution.modules}</p>
              </div>
              <div className="col-md-4 mb-4">
                <div className="feature-icon bg-soft-success">
                  <i className="bi bi-robot fs-4"></i>
                </div>
                <h5>AI Models</h5>
                <p>{info.solution.ai}</p>
              </div>
              <div className="col-md-4 mb-4">
                <div className="feature-icon bg-soft-warning">
                  <i className="bi bi-grid-1x2 fs-4"></i>
                </div>
                <h5>Dashboard & Digital Twin</h5>
                <p>{info.solution.dashboard}</p>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </section>

      {/* Dashboard section */}
      <section id="dashboard" className="py-5 bg-light">
        <div className="container">
          <h2 className="mb-4">Live Dashboard (Dummy Data)</h2>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Energy Consumption</h5>
                  <div style={{ height: '300px' }}>
                    <canvas ref={energyRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Water Quality</h5>
                  <div style={{ height: '300px' }}>
                    <canvas ref={qualityRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Asset Health Distribution</h5>
                  <div style={{ height: '350px', maxWidth: '450px', margin: '0 auto' }}>
                    <canvas ref={statusRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Model / Business Model section */}
      <section id="model" className="py-5">
        <div className="container">
          <h2 className="mb-4">Business Model</h2>
          {info ? (
            <p>{info.business_model}</p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </section>

      {/* Team section */}
      <section id="team" className="py-5 bg-light">
        <div className="container">
          <h2 className="mb-4">The Team</h2>
          <div className="row">
            <div className="col-md-6">
              <h5>Swathi Sharma</h5>
              <p>
                Founder – M.S. Data Science with 5+ years experience. Grew up in the
                family sewage treatment business. Passionate about applying AI to
                critical infrastructure.
              </p>
            </div>
            <div className="col-md-6">
              <h5>Future CTO (Open Position)</h5>
              <p>
                We're looking for a world‑class hardware and cloud engineer to
                join as co‑founder and help build the next generation of water
                infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-4">
        <div className="container text-center">
          <p className="mb-1">&copy; {new Date().getFullYear()} AquaSync</p>
          <p className="mb-0">Interested in partnering or investing? Email us at info@aquasync.example.com</p>
        </div>
      </footer>

      {/* Sticky CTA button (mobile) */}
      <button className="sticky-cta btn btn-warning d-md-none" data-bs-toggle="offcanvas" data-bs-target="#demoOffcanvas">
        <i className="bi bi-telephone me-1"></i> Demo
      </button>

      {/* Offcanvas contact form */}
      <div className="offcanvas offcanvas-end" tabIndex={-1} id="demoOffcanvas" aria-labelledby="demoOffcanvasLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="demoOffcanvasLabel">Book a Demo</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={(e) => { e.preventDefault(); alert('Thanks! We\'ll be in touch.'); }}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={3} placeholder="Tell us about your plant"></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-100">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;