import { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../contexts/AuthContext'
import './CardNav.css'

const ArrowIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 5h6v6h-2V8.414l-9.293 9.293-1.414-1.414L15.586 7H13V5z"></path>
  </svg>
)

const ExoraTypeInline = () => {
  const FULL_TEXT = 'EXORA'
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
        timeout = setTimeout(() => setIsDeleting(true), 900)
      }
    } else {
      if (index > 0) {
        timeout = setTimeout(() => {
          setTyped(full.slice(0, index - 1))
          setIndex(index - 1)
        }, 80)
      } else {
        timeout = setTimeout(() => setIsDeleting(false), 500)
      }
    }
    return () => clearTimeout(timeout)
  }, [index, isDeleting])

  return (
    <div className="cardnav-type">
      <span className="cardnav-type-text" aria-label={FULL_TEXT} data-full={FULL_TEXT}>{typed}</span>
      <span className="cardnav-type-caret" />
    </div>
  )
}

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  ease = 'power3.out',
  baseColor = 'rgba(168, 85, 247, 0.14)',
  menuColor,
  buttonBgColor = 'rgba(17,17,17,0.75)',
  buttonTextColor = '#fff'
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navRef = useRef(null)
  const cardsRef = useRef([])
  const tlRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const safeItems = useMemo(() => (items || []).slice(0, 3), [items])

  const calculateHeight = () => {
    const navEl = navRef.current
    if (!navEl) return 260
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content')
      if (contentEl) {
        const wasVisible = contentEl.style.visibility
        const wasPointerEvents = contentEl.style.pointerEvents
        const wasPosition = contentEl.style.position
        const wasHeight = contentEl.style.height

        contentEl.style.visibility = 'visible'
        contentEl.style.pointerEvents = 'auto'
        contentEl.style.position = 'static'
        contentEl.style.height = 'auto'
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        contentEl.offsetHeight

        const topBar = 60
        const padding = 16
        const contentHeight = contentEl.scrollHeight

        contentEl.style.visibility = wasVisible
        contentEl.style.pointerEvents = wasPointerEvents
        contentEl.style.position = wasPosition
        contentEl.style.height = wasHeight

        return topBar + contentHeight + padding
      }
    }
    return 260
  }

  const createTimeline = () => {
    const navEl = navRef.current
    if (!navEl) return null

    const targetHeight = calculateHeight()
    
    gsap.set(navEl, { height: 60, overflow: 'hidden' })
    gsap.set(cardsRef.current, { y: 50, opacity: 0 })

    const tl = gsap.timeline({ paused: true })
    tl.to(navEl, { height: targetHeight, duration: 0.4, ease })
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1')
    return tl
  }

  useLayoutEffect(() => {
    const tl = createTimeline()
    tlRef.current = tl
    return () => {
      tl?.kill()
      tlRef.current = null
    }
  }, [ease, safeItems])

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return
      if (isExpanded) {
        const newHeight = calculateHeight()
        gsap.set(navRef.current, { height: newHeight })
        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) {
          newTl.progress(1)
          tlRef.current = newTl
        }
      } else {
        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) tlRef.current = newTl
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isExpanded])

  const toggleMenu = () => {
    console.log('Toggle menu clicked, isExpanded:', isExpanded, 'tl exists:', !!tlRef.current)
    const tl = tlRef.current
    if (!tl) {
      console.log('No timeline found, creating new one')
      const newTl = createTimeline()
      if (newTl) {
        tlRef.current = newTl
        if (!isExpanded) {
          setIsHamburgerOpen(true)
          setIsExpanded(true)
          newTl.play(0)
        }
      }
      return
    }
    if (!isExpanded) {
      setIsHamburgerOpen(true)
      setIsExpanded(true)
      tl.play(0)
    } else {
      setIsHamburgerOpen(false)
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false))
      tl.reverse()
    }
  }

  const setCardRef = i => el => { if (el) cardsRef.current[i] = el }

  return (
    <div className={`card-nav-container ${className}`}>
      <div className="card-nav-wrapper" style={{ borderRadius: 12 }}>
        <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu cursor-target ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#fff' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            {logo ? <img src={logo} alt={logoAlt} className="logo" /> : <div className="logo-placeholder" />}
          </div>

          <div className="center-typing">
            <ExoraTypeInline />
          </div>

          <button
            type="button"
            className="card-nav-cta-button cursor-target"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            onClick={() => {
              if (user) {
                logout()
              } else {
                navigate('/auth')
              }
            }}
          >
            {user ? `Logout (${user.firstName})` : 'Login/Signup'}
          </button>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {safeItems.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card cursor-target"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {(item.links || []).map((lnk, i) => (
                  <a key={`${lnk.label}-${i}`} className="nav-card-link" href={lnk.href || '#'} aria-label={lnk.ariaLabel}>
                    <ArrowIcon className="nav-card-link-icon" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
      </div>
    </div>
  )
}

export default CardNav







