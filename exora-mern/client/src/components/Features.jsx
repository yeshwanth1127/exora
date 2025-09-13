const features = [
  {
    title: 'Hybrid Recording',
    desc: 'Continuously logs screen events with high‑res screenshots at key moments for perfect context.',
  },
  {
    title: 'Action Intelligence',
    desc: 'Transforms rich logs into reusable steps that map to real desktop actions.',
  },
  {
    title: 'Privacy‑First',
    desc: 'Local processing and selective capture keep your data safe and in your control.',
  },
  {
    title: 'Developers + Teams',
    desc: 'From dev workflows to onboarding and support—ship faster with sharable automation.',
  },
]

const Features = () => {
  return (
    <section className="landing-grid">
      {features.map((f) => (
        <div key={f.title} className="glass-card">
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </section>
  )
}

export default Features


