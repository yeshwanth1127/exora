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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const topHorizontalLine = topHorizontalLineRef.current;
    const topVerticalLine = topVerticalLineRef.current;
    const bottomHorizontalLine = bottomHorizontalLineRef.current;
    const bottomVerticalLine = bottomVerticalLineRef.current;
    const textContainer = textContainerRef.current;

    if (!container || !topHorizontalLine || !topVerticalLine || !bottomHorizontalLine || !bottomVerticalLine || !textContainer) return;

    // Set initial states
    gsap.set(topHorizontalLine, { scaleX: 0, transformOrigin: 'right center' });
    gsap.set(topVerticalLine, { scaleY: 0, transformOrigin: 'top center' });
    gsap.set(bottomHorizontalLine, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(bottomVerticalLine, { scaleY: 0, transformOrigin: 'bottom center' });
    gsap.set(textContainer, { opacity: 0, y: 20 });

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
      duration: 1.2,
      ease: 'power3.out'
    })
    .to(topVerticalLine, {
      scaleY: 1,
      duration: 1.0,
      ease: 'power3.out'
    }, '-=0.6') // Start vertical line slightly before horizontal finishes
    // Animate lines emerging from bottom left
    .to(bottomHorizontalLine, {
      scaleX: 1,
      duration: 1.2,
      ease: 'power3.out'
    }, '-=0.8') // Start bottom lines as top lines are finishing
    .to(bottomVerticalLine, {
      scaleY: 1,
      duration: 1.0,
      ease: 'power3.out'
    }, '-=0.6')
    .to(textContainer, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4'); // Start text animation as lines are finishing

    return () => {
      tl.kill();
    };
  }, [triggerId]);

  return (
    <div ref={containerRef} className={`animated-half-box ${className}`}>
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
      </div>
    </div>
  );
};

export default AnimatedHalfBox;
