import { useNavigate } from 'react-router-dom'
import './ExoraLogo.css'

const ExoraLogo = () => {
  const navigate = useNavigate()

  return (
    <button className="exora-logo exora-logo-static" onClick={() => navigate('/')} aria-label="Exora home">
      <img src="/logo_solo.png" alt="" />
      <span>EXORA</span>
    </button>
  )
}

export default ExoraLogo
