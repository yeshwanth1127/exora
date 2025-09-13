import { useEffect, useState } from 'react'
import './ExoraLogo.css'

const FULL_TEXT = 'EXORA'

const ExoraLogo = () => {
  const [typed, setTyped] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let timeout
    const full = FULL_TEXT

    if (!isDeleting) {
      if (index < full.length) {
        timeout = setTimeout(() => {
          setTyped(full.slice(0, index + 1))
          setIndex(index + 1)
        }, 120)
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, 900)
      }
    } else {
      if (index > 0) {
        timeout = setTimeout(() => {
          setTyped(full.slice(0, index - 1))
          setIndex(index - 1)
        }, 80)
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false)
        }, 500)
      }
    }

    return () => clearTimeout(timeout)
  }, [index, isDeleting])

  return (
    <div className="exora-logo">
      <span className="exora-type" aria-label={FULL_TEXT} data-full={FULL_TEXT}>
        {typed}
      </span>
      <span className="exora-caret" />
    </div>
  )
}

export default ExoraLogo


