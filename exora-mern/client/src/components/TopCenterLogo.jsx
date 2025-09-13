import { useState } from 'react'
import './TopCenterLogo.css'

const TopCenterLogo = () => {
  const [loadFailed, setLoadFailed] = useState(false)

  if (loadFailed) {
    return (
      <div className="top-center-logo fallback">
        EXORA
      </div>
    )
  }

  return (
    <img
      className="top-center-logo"
      src={import.meta.env.BASE_URL + 'logo_solo.png'}
      alt="EXORA logo"
      draggable="false"
      onError={() => setLoadFailed(true)}
    />
  )
}

export default TopCenterLogo


