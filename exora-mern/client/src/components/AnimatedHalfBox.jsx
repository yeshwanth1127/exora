import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TypewriterText from './TypewriterText';
import DotGrid from './DotGrid';
import './AnimatedHalfBox.css';

gsap.registerPlugin(ScrollTrigger);

const AnimatedHalfBox = ({ 
  text = "Agentic AI adapts, learns, and makes decisions in real-time—unlike traditional rule-based automation that simply follows predefined scripts.",
  className = '',
  triggerId = 'products'
}) => {
  const containerRef = useRef(null);
  const topHorizontalLineRef = useRef(null);
  const topVerticalLineRef = useRef(null);
  const bottomHorizontalLineRef = useRef(null);
  const bottomVerticalLineRef = useRef(null);
  const textContainerRef = useRef(null);
  const corner1Ref = useRef(null);
  const corner2Ref = useRef(null);
  const corner3Ref = useRef(null);
  const corner4Ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const topHorizontalLine = topHorizontalLineRef.current;
    const topVerticalLine = topVerticalLineRef.current;
    const bottomHorizontalLine = bottomHorizontalLineRef.current;
    const bottomVerticalLine = bottomVerticalLineRef.current;
    const textContainer = textContainerRef.current;
    const corner1 = corner1Ref.current;
    const corner2 = corner2Ref.current;
    const corner3 = corner3Ref.current;
    const corner4 = corner4Ref.current;

    if (!container || !topHorizontalLine || !topVerticalLine || !bottomHorizontalLine || !bottomVerticalLine || !textContainer) return;

    // Set initial states
    gsap.set(topHorizontalLine, { scaleX: 0, transformOrigin: 'right center' });
    gsap.set(topVerticalLine, { scaleY: 0, transformOrigin: 'top center' });
    gsap.set(bottomHorizontalLine, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(bottomVerticalLine, { scaleY: 0, transformOrigin: 'bottom center' });
    gsap.set(textContainer, { opacity: 0, y: 30 });
    gsap.set([corner1, corner2, corner3, corner4], { scale: 0, opacity: 0 });

    // Create the animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: `#${triggerId}`,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
          setIsVisible(true);
        },
        onLeave: () => {
          setIsVisible(false);
        },
        onEnterBack: () => {
          setIsVisible(true);
        },
        onLeaveBack: () => {
          setIsVisible(false);
        }
      }
    });

    // Animate lines emerging from top right
    tl.to(topHorizontalLine, {
      scaleX: 1,
      duration: 0.8,
      ease: 'power3.out'
    })
    .to(topVerticalLine, {
      scaleY: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')
    // Animate lines emerging from bottom left
    .to(bottomHorizontalLine, {
      scaleX: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6')
    .to(bottomVerticalLine, {
      scaleY: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')
    // Animate corners in
    .to([corner1, corner2, corner3, corner4], {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, '-=0.3')
    // Animate text
    .to(textContainer, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.2');

    return () => {
      tl.kill();
    };
  }, [triggerId]);

  return (
    <div ref={containerRef} className={`animated-half-box ${className}`}>
      {/* Corner decorative elements */}
      <div ref={corner1Ref} className="corner-decoration corner-1"></div>
      <div ref={corner2Ref} className="corner-decoration corner-2"></div>
      <div ref={corner3Ref} className="corner-decoration corner-3"></div>
      <div ref={corner4Ref} className="corner-decoration corner-4"></div>
      
      {/* Top horizontal line (right) */}
      <div 
        ref={topHorizontalLineRef}
        className="half-box-line top-horizontal-line"
      />
      
      {/* Top vertical line (right) */}
      <div 
        ref={topVerticalLineRef}
        className="half-box-line top-vertical-line"
      />
      
      {/* Bottom horizontal line (left) */}
      <div 
        ref={bottomHorizontalLineRef}
        className="half-box-line bottom-horizontal-line"
      />
      
      {/* Bottom vertical line (left) */}
      <div 
        ref={bottomVerticalLineRef}
        className="half-box-line bottom-vertical-line"
      />
      
      {/* Text container */}
      <div ref={textContainerRef} className="half-box-content">
        <div className="half-box-dotgrid">
          <DotGrid
            dotSize={3}
            gap={12}
            baseColor="rgba(168, 85, 247, 0.15)"
            activeColor="rgba(168, 85, 247, 0.4)"
            proximity={60}
            shockRadius={80}
            shockStrength={1.5}
            resistance={1000}
            returnDuration={1.2}
          />
        </div>
        <div className="half-box-text-content">
          <TypewriterText 
            text={text}
            speed={30}
            isActive={isVisible}
          />
        </div>
        
        {/* Floating orbs for extra visual appeal */}
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
      </div>
    </div>
  );
};

export default AnimatedHalfBox;
