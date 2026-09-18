import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Arrow = ({ className = '' }) => (
  <svg className={`mx-arrow-icon ${className}`.trim()} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 12L12 4M12 4H6.5M12 4V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Eyebrow = ({ children }) => <div className="mx-eyebrow"><i />{children}</div>;

function PageHero({ eyebrow, title, text, action, to, href }) {
  const button = <>{action} <Arrow /></>;
  return (
    <section className="mx-hero mx-page-hero">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <p className="mx-lede">{text}</p>
      {to ? (
        <Link className="mx-button mx-button-light" to={to}>{button}</Link>
      ) : href ? (
        <a className="mx-button mx-button-light" href={href}>{button}</a>
      ) : null}
    </section>
  );
}

function LegalMeta({ updated }) {
  return <p className="mx-legal-meta">Last updated: {updated}</p>;
}

function VulnerabilityForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'vulnerability_report',
          message: `[Vulnerability report]\n\n${form.message}`,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send report. Please try again.');
      }
      setForm({ name: '', email: '', company: '', phone: '', message: '' });
      setStatus({
        type: 'success',
        message: data.message || 'Thanks — we received your report and will review it carefully.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to send report. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mx-contact-form mx-vuln-form" onSubmit={onSubmit} noValidate id="report">
      <Eyebrow>RESPONSIBLE DISCLOSURE</Eyebrow>
      <h2>Report a vulnerability.</h2>
      <p>
        If you believe you have found a security issue in Exora or Qlix, tell us privately before public disclosure.
        We investigate good-faith reports and will acknowledge receipt.
      </p>

      <div className="mx-form-grid">
        <label className="mx-field">
          <span>Name *</span>
          <input name="name" type="text" autoComplete="name" value={form.name} onChange={onChange} required placeholder="Your name" />
        </label>
        <label className="mx-field">
          <span>Email *</span>
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} required placeholder="you@example.com" />
        </label>
        <label className="mx-field">
          <span>Organization</span>
          <input name="company" type="text" autoComplete="organization" value={form.company} onChange={onChange} placeholder="Optional" />
        </label>
        <label className="mx-field">
          <span>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={onChange} placeholder="Optional" />
        </label>
      </div>

      <label className="mx-field mx-field-full">
        <span>Report details *</span>
        <textarea
          name="message"
          rows={6}
          value={form.message}
          onChange={onChange}
          required
          placeholder="Describe the issue, affected product or endpoint, steps to reproduce, and any impact assessment. Do not include real customer data."
        />
      </label>

      {status.message && (
        <div className={`mx-form-status is-${status.type}`} role="status">
          {status.message}
        </div>
      )}

      <button className="mx-button mx-button-light" type="submit" disabled={submitting}>
        {submitting ? 'Sending...' : <>Submit report <Arrow /></>}
      </button>
      <p className="mx-form-note">
        Prefer email? Write to{' '}
        <a href="mailto:security@exora.solutions">security@exora.solutions</a>
        {' '}with the same details.
      </p>
    </form>
  );
}

export function SecurityPage() {
  return (
    <main>
      <PageHero
        eyebrow="SECURITY"
        title={<>Built for control.<br /><em>Designed for trust.</em></>}
        text="Qlix is built so agents can act in real systems while ownership, approvals, and evidence stay with people."
        action="Report a vulnerability"
        href="#report"
      />

      <section className="mx-section">
        <div className="mx-section-head">
          <Eyebrow>SECURITY MODEL</Eyebrow>
          <h2>What we protect<br />and how.</h2>
        </div>
        <div className="mx-feature-grid mx-three">
          <article className="mx-feature">
            <span>01</span>
            <h3>Access boundaries</h3>
            <p>Integrations use scoped credentials. Agents only receive the tool access required for the configured workflow.</p>
          </article>
          <article className="mx-feature">
            <span>02</span>
            <h3>Human approvals</h3>
            <p>Sensitive actions can require named human approval before they execute—sending messages, changing records, or crossing risk thresholds.</p>
          </article>
          <article className="mx-feature">
            <span>03</span>
            <h3>Provable history</h3>
            <p>Configured operational events can be recorded and signed with Ed25519 so audit entries cannot be quietly rewritten.</p>
          </article>
        </div>
      </section>

      <section className="mx-section mx-deploy">
        <div>
          <Eyebrow>DEPLOYMENT</Eyebrow>
          <h2>Cloud or local.</h2>
        </div>
        <div>
          <p>
            Qlix can run as a managed cloud deployment or inside your environment. Local and private deployments keep more of the runtime and customer data under your infrastructure controls.
          </p>
          <div className="mx-deploy-options"><span>CLOUD</span><i>OR</i><span>LOCAL</span></div>
        </div>
      </section>

      <section className="mx-section mx-legal-block">
        <Eyebrow>CUSTOMER DATA</Eyebrow>
        <h2>Retention, deletion, and model training.</h2>
        <div className="mx-legal-prose">
          <h3>Retention and deletion</h3>
          <p>
            We retain customer account data and operational records for as long as your subscription or deployment remains active, and for a limited period afterward where needed for security, dispute resolution, legal compliance, or backup integrity.
          </p>
          <p>
            Customers can request deletion of account data and associated customer content by contacting{' '}
            <a href="mailto:support@exora.solutions">support@exora.solutions</a>
            {' '}or through contractual offboarding. After verification, we delete or anonymize eligible data within a commercially reasonable period, subject to legal holds and immutable audit requirements that may retain signed evidence separately.
          </p>
          <h3>Model training</h3>
          <p>
            <strong>Customer data is not used to train Exora or third-party foundation models by default.</strong>
            {' '}Agent instructions, connected-system content, and operational records remain customer data. Any use of customer data to improve models would require an explicit written agreement or documented opt-in—never silent reuse.
          </p>
          <p>
            Read more in our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
          </p>
        </div>
      </section>

      <section className="mx-section mx-contact-form-section">
        <VulnerabilityForm />
      </section>
    </main>
  );
}

export function PrivacyPage() {
  return (
    <main>
      <PageHero
        eyebrow="PRIVACY POLICY"
        title={<>How Exora handles<br /><em>your information.</em></>}
        text="This policy explains what we collect, why we collect it, how long we keep it, and the choices available to you."
        action="Contact privacy"
        href="mailto:support@exora.solutions?subject=Privacy%20inquiry"
      />

      <section className="mx-section mx-legal-block">
        <LegalMeta updated="August 7, 2026" />
        <div className="mx-legal-prose">
          <h3>1. Who we are</h3>
          <p>
            Exora (“Exora,” “we,” “us”) builds Qlix, a platform for creating, connecting, governing, and reviewing AI agents.
            Contact: <a href="mailto:support@exora.solutions">support@exora.solutions</a>.
          </p>

          <h3>2. Information we collect</h3>
          <ul>
            <li><strong>Account and contact data</strong> — name, email, company, phone, and messages you send us.</li>
            <li><strong>Product usage data</strong> — configuration metadata, authentication events, and operational logs needed to run and secure Qlix.</li>
            <li><strong>Customer content</strong> — agent instructions, connected-tool outputs, approvals, and related workflow artifacts you choose to process through Qlix.</li>
            <li><strong>Technical data</strong> — IP address, device/browser information, and similar diagnostics for security and reliability.</li>
          </ul>

          <h3>3. How we use information</h3>
          <ul>
            <li>Provide, operate, secure, and improve Qlix and related services.</li>
            <li>Respond to demos, support requests, and vulnerability reports.</li>
            <li>Enforce access controls, approvals, and audit requirements you configure.</li>
            <li>Comply with law and protect against abuse or security incidents.</li>
          </ul>

          <h3>4. Model training</h3>
          <p>
            <strong>We do not use customer content to train foundation models by default.</strong>
            Customer prompts, connected-system data, and workflow records are processed to deliver the service you configured—not to train Exora or third-party AI models—unless you have expressly allowed that use in writing or through a documented opt-in.
          </p>

          <h3>5. Retention and deletion</h3>
          <p>
            We retain personal and customer data while your account or deployment is active. After termination or a verified deletion request, we delete or anonymize eligible data within a commercially reasonable period.
          </p>
          <p>
            Some records may be retained longer when required by law, security investigation, dispute resolution, backup cycles, or immutable audit commitments (for example, signed operational evidence that must remain verifiable).
          </p>
          <p>
            To request access, correction, or deletion, email{' '}
            <a href="mailto:support@exora.solutions">support@exora.solutions</a>
            {' '}with the subject “Data request.”
          </p>

          <h3>6. Sharing</h3>
          <p>
            We do not sell personal information. We may share data with subprocessors that help us host, secure, or operate the service; with advisors when required; or when law requires disclosure. Integration providers receive only the scoped access needed for connections you authorize.
          </p>

          <h3>7. Security</h3>
          <p>
            We use administrative, technical, and organizational measures appropriate to the sensitivity of the data, including access controls and signed audit records for configured events. Details are described on our <Link to="/security">Security</Link> page.
          </p>

          <h3>8. International transfers</h3>
          <p>
            Depending on deployment choice (cloud or local), data may be processed in regions where Exora or its infrastructure providers operate. Local deployments keep more processing inside the customer environment.
          </p>

          <h3>9. Changes</h3>
          <p>
            We may update this policy as the product and legal requirements evolve. Material changes will be reflected by updating the date above and, where appropriate, additional notice.
          </p>

          <h3>10. Contact</h3>
          <p>
            Privacy questions: <a href="mailto:support@exora.solutions">support@exora.solutions</a>.
            Security reports: <Link to="/security#report">responsible disclosure form</Link> or{' '}
            <a href="mailto:security@exora.solutions">security@exora.solutions</a>.
          </p>
        </div>
      </section>
    </main>
  );
}

export function TermsPage() {
  return (
    <main>
      <PageHero
        eyebrow="TERMS OF SERVICE"
        title={<>Terms for using<br /><em>Exora and Qlix.</em></>}
        text="These terms govern access to Exora websites, Qlix, and related services. By using the services, you agree to them."
        action="Talk to Exora"
        to="/contact"
      />

      <section className="mx-section mx-legal-block">
        <LegalMeta updated="August 7, 2026" />
        <div className="mx-legal-prose">
          <h3>1. Agreement</h3>
          <p>
            These Terms of Service (“Terms”) are an agreement between you and Exora regarding use of exora.solutions, Qlix, demos, and related offerings (the “Services”). If you use the Services on behalf of an organization, you represent that you can bind that organization.
          </p>

          <h3>2. The Services</h3>
          <p>
            Qlix lets customers create and operate AI agents with tool connections, human controls, and review capabilities. Features may vary by plan, deployment model (cloud or local), and configuration. Beta or roadmap features—including concepts labeled as future directions—are provided as-is and may change or never ship.
          </p>

          <h3>3. Accounts and acceptable use</h3>
          <ul>
            <li>Provide accurate account information and keep credentials secure.</li>
            <li>Do not misuse the Services, probe systems without authorization, or attempt to bypass security or approval controls.</li>
            <li>Do not use the Services for unlawful, harmful, or deceptive activity.</li>
            <li>You are responsible for how agents act under configurations and approvals you set.</li>
          </ul>

          <h3>4. Customer data and AI processing</h3>
          <p>
            You retain rights to your customer content. You grant Exora a limited license to host, process, and display that content solely to provide and secure the Services.
          </p>
          <p>
            <strong>Customer data is not used for model training by default.</strong>
            Any training use requires your explicit written permission or documented opt-in. See our <Link to="/privacy">Privacy Policy</Link> for retention and deletion details.
          </p>

          <h3>5. Integrations</h3>
          <p>
            Connecting third-party tools (for example Gmail, Slack, WhatsApp, Zoho) is optional and subject to those providers’ terms. You authorize Exora to use the scoped credentials you supply to perform the workflows you configure.
          </p>

          <h3>6. Human control and responsibility</h3>
          <p>
            Qlix provides mechanisms for ownership, permissions, and approvals. You remain responsible for configuring appropriate human oversight for sensitive actions and for outcomes of agents operating under your instructions.
          </p>

          <h3>7. Confidentiality and security reports</h3>
          <p>
            Please report suspected vulnerabilities through our <Link to="/security#report">responsible disclosure process</Link>. Do not publicly disclose exploitable details before we have had a reasonable opportunity to investigate and remediate.
          </p>

          <h3>8. Fees and trials</h3>
          <p>
            Paid plans, pilots, and professional services are governed by the order form, proposal, or agreement you accept. Free trials may be limited in duration, features, or support.
          </p>

          <h3>9. Disclaimers</h3>
          <p>
            Except as expressly stated in a written agreement, the Services are provided “as is” without warranties of uninterrupted operation, perfect accuracy of model outputs, or fitness for a particular purpose. AI agents can make mistakes; human review remains important for high-impact actions.
          </p>

          <h3>10. Limitation of liability</h3>
          <p>
            To the maximum extent permitted by law, Exora is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, or data, arising from use of the Services. Aggregate liability for claims relating to the Services is limited to the amounts paid to Exora for the Services in the twelve months before the claim, unless a separate agreement states otherwise.
          </p>

          <h3>11. Termination</h3>
          <p>
            You may stop using the Services at any time. We may suspend or terminate access for breach of these Terms, security risk, or non-payment. Upon termination, customer data handling follows the Privacy Policy and any applicable data processing terms.
          </p>

          <h3>12. Changes</h3>
          <p>
            We may update these Terms. Continued use after an update constitutes acceptance of the revised Terms, except where a negotiated agreement requires a different process.
          </p>

          <h3>13. Contact</h3>
          <p>
            Questions about these Terms: <a href="mailto:support@exora.solutions">support@exora.solutions</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
