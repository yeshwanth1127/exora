import { useState, useEffect, useRef } from 'react'

/**
 * IntroVideo
 * ----------
 * Shows /video.mp4 full-screen on first load.
 * When the video ends it fades out (1 s), then fades the children in (1 s).
 * After the fade-out completes the video element is removed from the DOM.
 */
export default function IntroVideo({ children, speed = 1 }) {
  // 'video'   → video is playing / visible
  // 'fading'  → video is fading out, children fading in
  // 'done'    → video removed, children fully visible
  const [phase, setPhase] = useState('video')
  const videoRef = useRef(null)

  // When the video ends, trigger the fade transition
  const handleEnded = () => {
    if (phase === 'video') {
      setPhase('fading')
      if (videoRef.current) videoRef.current.pause()
    }
  }

  // After the 1-second CSS transition finishes, remove the video from the DOM
  const handleVideoTransitionEnd = (e) => {
    // Only react to the opacity transition on the video wrapper
    if (e.propertyName === 'opacity' && phase === 'fading') {
      setPhase('done')
    }
  }

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    // Play the video explicitly
    vid.play().catch(err => {
      console.warn('IntroVideo: Playback failed (likely autoplay policy):', err)
      // If it fails to play, we don't necessarily skip immediately, 
      // let the timeouts handle it or wait for user interaction to trigger it if we had a button.
      // But for a silent intro, we might as well skip if it's blocked.
      // setPhase('fading') 
    })

    // Skip intro if video file is empty or has no duration; otherwise set speed
    const onLoadedMetadata = () => {
      if (!vid.duration || vid.duration === 0 || !isFinite(vid.duration)) {
        console.warn('IntroVideo: video has no duration, skipping intro.')
        setPhase('fading')
      } else {
        vid.playbackRate = speed
      }
    }

    // Skip intro on any error (missing file, codec issue, 0-byte file, etc.)
    const onError = () => {
      console.warn('IntroVideo: video failed to load, skipping intro.')
      setPhase('fading')
    }

    vid.addEventListener('loadedmetadata', onLoadedMetadata)
    vid.addEventListener('error', onError)

    // Fallback 1: If the video hasn't even started loading ANY data after 1 second
    const readyTimeout = setTimeout(() => {
      if (phase === 'video' && vid.readyState === 0) {
        console.warn('IntroVideo: video still not ready after 1s, skipping.')
        setPhase('fading')
      }
    }, 1000)

    // Fallback 2: Absolute maximum timeout (2s) - exactly as requested
    const absoluteTimeout = setTimeout(() => {
      if (phase === 'video') {
        console.log('IntroVideo: 2s absolute limit reached, transitioning to app.')
        setPhase('fading')
        if (vid) vid.pause()
      }
    }, 2000)

    return () => {
      vid.removeEventListener('loadedmetadata', onLoadedMetadata)
      vid.removeEventListener('error', onError)
      clearTimeout(readyTimeout)
      clearTimeout(absoluteTimeout)
    }
  }, [phase, speed])

  return (
    <>
      {/* ── Video overlay ─────────────────────────────────────────────── */}
      {phase !== 'done' && (
        <div
          onTransitionEnd={handleVideoTransitionEnd}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            background: '#000',
            opacity: phase === 'fading' ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: phase === 'fading' ? 'none' : 'auto',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleEnded}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* ── Main app content ──────────────────────────────────────────── */}
      <div
        style={{
          opacity: phase === 'done' ? 1 : phase === 'fading' ? 1 : 0,
          transition: 'opacity 0.5s ease',
          // Keep it in the layout but invisible while the video plays so
          // React can mount & initialise everything in the background.
          visibility: phase === 'video' ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>
    </>
  )
}
