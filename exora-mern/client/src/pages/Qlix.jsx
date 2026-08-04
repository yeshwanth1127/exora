import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../components/Qlix.css'

const Qlix = () => {
  const navigate = useNavigate()

  const layers = [
    {
      num: 1,
      title: 'Identity & Verification',
      desc: 'Device binding, passkeys, and biometric verification. Trust starts with verified humans.'
    },
    {
      num: 2,
      title: 'Agent Creation & Registration',
      desc: 'Scoped agent instantiation with cryptographic keys and Verifiable Credentials.'
    },
    {
      num: 3,
      title: 'Permissions & Scoping',
      desc: 'Fine-grained capability controls. Define what each agent can and cannot do.'
    },
    {
      num: 4,
      title: 'AI Coordination',
      desc: 'AI Brain orchestrates multi-agent workflows, routes tasks, learns outcomes.'
    },
    {
      num: 5,
      title: 'Approvals & Governance',
      desc: 'Just-in-Time approvals. Human oversight for high-risk actions. Role-based governance.'
    },
    {
      num: 6,
      title: 'Audit & Proof',
      desc: 'Tamper-proof ledger. Blockchain anchors. Cryptographic proof of every action.'
    }
  ]

  return (
    <div className="qlix-page">
      {/* Hero Section */}
      <section className="qlix-section-hero">
        <div className="qlix-container">
          <h1>The 6 Layers of Qlix</h1>
          <p>Complete stack for agent identity, governance, and proof. From human verification to immutable audit trails.</p>
          <div className="qlix-cta-row">
            <button className="qlix-cta qlix-cta-primary" onClick={() => navigate('/auth')}>Start free →</button>
            <button className="qlix-cta qlix-cta-secondary" onClick={() => window.open('/docs/qlix', '_blank')}>Read docs →</button>
          </div>
        </div>
      </section>

      {/* Layers Section - The Core */}
      <section className="qlix-section-layers">
        <div className="qlix-container">
          <div className="qlix-layers-stack">
            {layers.map((layer, index) => (
              <div key={index} className="qlix-layer" style={{ '--layer-index': layer.num }}>
                <div className="qlix-layer-num">{layer.num}</div>
                <div className="qlix-layer-content">
                  <h3>{layer.title}</h3>
                  <p>{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="qlix-section-footer-cta">
        <div className="qlix-container">
          <h2>Ready to build on Qlix?</h2>
          <p>Identity, governance, and proof. Built in.</p>
          <div className="qlix-cta-row">
            <button className="qlix-cta qlix-cta-primary" onClick={() => navigate('/auth')}>Create an agent</button>
            <button className="qlix-cta qlix-cta-secondary" onClick={() => window.open('/docs/qlix', '_blank')}>Documentation</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Qlix
