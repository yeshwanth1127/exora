import React, { useState, useEffect, useRef } from 'react';
import './TypewriterText.css';

const TypewriterText = ({ 
  text, 
  speed = 50, 
  isActive = false,
  className = '',
  onComplete = null 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isActive && !hasStartedRef.current) {
      // Reset everything when starting
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(true);
      hasStartedRef.current = true;
      
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          setDisplayedText(text.slice(0, nextIndex));
          
          if (nextIndex >= text.length) {
            setIsTyping(false);
            if (onComplete) onComplete();
            return prevIndex;
          }
          
          return nextIndex;
        });
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, text, speed, onComplete]);

  // Reset when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(false);
      hasStartedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isActive]);

  return (
    <div className={`typewriter-text ${className}`}>
      <div className="typewriter-content">
        {displayedText.split('\n').map((line, index) => (
          <div key={index} className="typewriter-line">
            {line}
          </div>
        ))}
      </div>
      <span className={`typewriter-cursor ${isTyping ? 'blinking' : ''}`}>
        |
      </span>
    </div>
  );
};

export default TypewriterText;
