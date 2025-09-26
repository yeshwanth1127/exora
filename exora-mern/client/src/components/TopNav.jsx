import { useRef } from 'react'
import './TopNav.css'
import VariableProximity from './VariableProximity'

const TopNav = () => {
  const railRef = useRef(null)
  return (
    <nav className="topnav" ref={railRef}>
      <div className="topnav-inner">
        <a href="#company" className="topnav-link">
          <VariableProximity
            label={'About us'}
            className={'topnav-prox'}
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 800, 'opsz' 40"
            containerRef={railRef}
            radius={90}
            falloff='linear'
          />
        </a>
        <a href="#products" className="topnav-link">
          <VariableProximity
            label={'Our products'}
            className={'topnav-prox'}
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 800, 'opsz' 40"
            containerRef={railRef}
            radius={90}
            falloff='linear'
          />
        </a>
        <a href="#join" className="topnav-link">
          <VariableProximity
            label={'Join us'}
            className={'topnav-prox'}
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 800, 'opsz' 40"
            containerRef={railRef}
            radius={90}
            falloff='linear'
          />
        </a>
      </div>
    </nav>
  )
}

export default TopNav


