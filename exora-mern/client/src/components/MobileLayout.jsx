import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './MobileLayout.css'
import CardNav from './CardNav'
import Particles from './Particles'
import Chatbot from './Chatbot'

const MobileLayout = ({ isChatbotOpen, onChatbotToggle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Mobile Layout rendered!')
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000' }}>
      {/* Same background as desktop */}
      <div className="bg-radials" />
      
      {/* Same particles as desktop */}
      <Particles
        particleColors={[ '#c084fc', '#a855f7', '#7c3aed' ]}
        particleCount={200}
        particleSpread={8}
        speed={0.04}
        particleBaseSize={60}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
      
      {/* Same CardNav as desktop */}
      <CardNav
        items={[
          { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [ { label: 'Company', ariaLabel: 'About Company', href: '#company' }, { label: 'Careers', ariaLabel: 'About Careers', href: '#company' } ] },
          { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [ { label: 'Featured', ariaLabel: 'Featured Projects', href: '#products' }, { label: 'Case Studies', ariaLabel: 'Project Case Studies', href: '#solutions' } ] },
          { label: 'Join us', bgColor: '#271E37', textColor: '#fff', links: [ { label: 'Email', ariaLabel: 'Email us', href: '#join' }, { label: 'Twitter', ariaLabel: 'Twitter', href: '#join' }, { label: 'LinkedIn', ariaLabel: 'LinkedIn', href: '#join' } ] }
        ]}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      {/* Mobile Main Content */}
      <main style={{ position: 'relative', zIndex: 10, paddingTop: '80px' }}>
        {/* Simple test content */}
        <div style={{ padding: '20px', marginTop: '60px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px', textAlign: 'center', color: '#ffffff' }}>
            EXORA
          </h1>
          
          <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '30px', color: '#c7d2fe' }}>
            Your AI Automation Hub
          </p>
          
          <div style={{ 
            background: 'rgba(168, 85, 247, 0.1)', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '20px', 
            border: '1px solid rgba(168, 85, 247, 0.2)' 
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#ffffff' }}>
              Welcome to Mobile!
            </h2>
            <p style={{ color: '#c7d2fe' }}>
              This is the mobile-optimized version of your website.
            </p>
          </div>
          
          {user && (
            <button 
              style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                color: 'white', 
                border: 'none', 
                padding: '16px 24px', 
                borderRadius: '12px', 
                fontSize: '16px', 
                fontWeight: '600', 
                width: '100%',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
              onClick={() => {
                const dashboardPath = user.usageType === 'personal' ? '/personal-dashboard' : '/dashboard';
                navigate(dashboardPath);
              }}
            >
              Go to Dashboard
            </button>
          )}
          
          <button 
            style={{ 
              background: user ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #a855f7, #7c3aed)', 
              color: 'white', 
              border: user ? '1px solid rgba(255, 255, 255, 0.2)' : 'none', 
              padding: '16px 24px', 
              borderRadius: '12px', 
              fontSize: '16px', 
              fontWeight: '600', 
              width: '100%',
              cursor: 'pointer'
            }}
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
          </main>
          
          {/* Chatbot */}
          <Chatbot isOpen={isChatbotOpen} onToggle={onChatbotToggle} hideFloatingButton={true} />
        </div>
      )
    }

export default MobileLayout