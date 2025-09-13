import { useEffect, useRef } from 'react'

const sampleLines = [
  'record: click(#submit) at (842, 512)',
  'record: type("Quarterly Report v3") in input[name=title]',
  'record: open(app://sheets) and paste 124 rows',
  'ai:   detect pattern → create workflow steps',
  'ai:   add retry + wait for element',
  'save: Scribe → "Generate finance summary"',
]

const DemoPanel = () => {
  const bodyRef = useRef(null)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    let i = 0
    const id = setInterval(() => {
      el.innerText = sampleLines.slice(0, (i % sampleLines.length) + 1).join('\n')
      i += 1
    }, 850)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="demo-panel">
      <div className="demo-header">
        <span className="demo-dot red" />
        <span className="demo-dot yellow" />
        <span className="demo-dot green" />
      </div>
      <pre ref={bodyRef} className="demo-body" />
    </section>
  )
}

export default DemoPanel


