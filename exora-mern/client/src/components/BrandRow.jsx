import { useEffect, useState } from 'react'
import './BrandRow.css'

const FULL_TEXT = 'EXORA'

const BrandRow = () => {
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
    } else if (index > 0) {
      timeout = setTimeout(() => {
        setTyped(full.slice(0, index - 1))
        setIndex(index - 1)
      }, 80)
    } else {
      timeout = setTimeout(() => {
        setIsDeleting(false)
      }, 500)
    }

    return () => clearTimeout(timeout)
  }, [index, isDeleting])

  return (
    <div className="brand-row">
      <img
        className="brand-logo"
        src={import.meta.env.BASE_URL + 'logo_solo.png'}
        alt="EXORA logo"
        draggable="false"
      />
      <div className="brand-typewrap" aria-label={FULL_TEXT}>
        <span className="brand-type">{typed}</span>
        <span className="brand-caret" />
      </div>
    </div>
  )
}

export default BrandRow



