const features = [
  {
    title: 'OS‑Level Presence',
    desc: 'Scribe runs alongside your operating system, understanding windows, inputs and app context.',
  },
  {
    title: 'Hybrid Recording',
    desc: 'Continuously logs events and captures crisp screenshots at key moments for perfect recall.',
  },
  {
    title: 'Action Intelligence',
    desc: 'Turns sessions into reusable steps with variables, waits, conditions and retries built‑in.',
  },
  {
    title: 'Privacy‑First',
    desc: 'Local processing and selective capture keep your data safe and in your control.',
  },
  {
    title: 'Developer API',
    desc: 'Call desktop actions like an API. Compose flows, schedule runs, and integrate with your stack.',
  },
  {
    title: 'For Teams & Individuals',
    desc: 'From daily personal tasks to shared team workflows—ship faster with reliable automation.',
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


