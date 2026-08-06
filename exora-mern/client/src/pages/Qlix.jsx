import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../components/Qlix.css'
import CardNav from '../components/CardNav'
import { SITE_NAV_ITEMS } from '../data/siteNavigation'

const Qlix = () => {
  const navigate = useNavigate()

  const layers = [
    {
      num: 1,
      title: 'Create & Deploy',
      desc: 'Configure agents around clear business responsibilities, systems, and expected outcomes.'
    },
    {
      num: 2,
      title: 'Assign Ownership',
      desc: 'Connect every agent to accountable people and teams before it enters a live workflow.'
    },
    {
      num: 3,
      title: 'Set Boundaries',
      desc: 'Define the systems, data, and actions available to each agent.'
    },
    {
      num: 4,
      title: 'Coordinate Work',
      desc: 'Connect agents into controlled workflows that support real business operations.'
    },
    {
      num: 5,
      title: 'Keep Humans in Control',
      desc: 'Route sensitive or high-impact actions to the right people for review and approval.'
    },
    {
      num: 6,
      title: 'Review & Improve',
      desc: 'Give teams visibility into agent activity, outcomes, exceptions, and operational history. Once recorded, a Qlix audit entry is cryptographically impossible to modify.'
    }
  ]

  return (
    <div className="qlix-page">
      <CardNav items={SITE_NAV_ITEMS} baseColor="rgba(8, 8, 12, 0.9)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />
      {/* Hero Section */}
      <section className="qlix-section-hero">
        <div className="qlix-container">
          <p className="qlix-eyebrow">QLIX BY EXORA</p>
          <h1>Put AI agents to work — with your business in control.</h1>
          <p>Qlix is a governed AI-agent platform that helps businesses deploy, coordinate, and control agents with clear ownership, defined boundaries, human approvals, and operational visibility.</p>
          <div className="qlix-cta-row">
            <button className="qlix-cta qlix-cta-primary" onClick={() => navigate('/contact')}>Request a demo →</button>
            <button className="qlix-cta qlix-cta-secondary" onClick={() => navigate('/solutions')}>Explore capabilities →</button>
          </div>
        </div>
      </section>

      {/* High-level product flow */}
      <section id="how-it-works" className="qlix-section-layers">
        <div className="qlix-container">
          <div className="qlix-section-heading">
            <p className="qlix-eyebrow">HOW QLIX WORKS</p>
            <h2>One governed path from agent creation to operational oversight.</h2>
          </div>
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

      <section id="governance" className="qlix-section-footer-cta">
        <div className="qlix-container">
          <p className="qlix-eyebrow">GOVERNANCE</p>
          <h2>Autonomy where it helps. Human control where it matters.</h2>
          <p>Qlix is designed to make ownership, access boundaries, approvals, and review part of the operating workflow—not an afterthought.</p>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="qlix-section-footer-cta">
        <div className="qlix-container">
          <h2>See where Qlix fits in your operation.</h2>
          <p>Start with a focused conversation about your agents, workflows, and control requirements.</p>
          <div className="qlix-cta-row">
            <button className="qlix-cta qlix-cta-primary" onClick={() => navigate('/contact')}>Request a demo</button>
            <button className="qlix-cta qlix-cta-secondary" onClick={() => navigate('/about')}>About Exora</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Qlix
