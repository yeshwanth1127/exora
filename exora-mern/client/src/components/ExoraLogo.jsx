import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ExoraLogo.css'

const FULL_TEXT = 'EXORA'

const ExoraLogo = () => {
  const [typed, setTyped] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

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

  const renderTypedText = () => {
    return typed.split('').map((char, i) => {
      if (char.toUpperCase() === 'O') {
        return <span key={i}>{char}</span>
      }
      return char
    })
  }

  return (
    <div className="exora-logo" onClick={() => navigate('/')}>
      <span className="exora-type" aria-label={FULL_TEXT} data-full={FULL_TEXT}>
        {renderTypedText()}
      </span>
      <span className="exora-caret" />
    </div>
  )
}

export default ExoraLogo


