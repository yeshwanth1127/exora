import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

const HowItWorks = ({ steps, nodes, themeColor = '#34d399' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressInterval = useRef(null);
  const scrollContainerRef = useRef(null);
  const stepRefs = useRef([]);

  const STEP_DURATION = 3500;
  const UPDATE_INTERVAL = 20; // ms

  // Scroll active step into view on mobile (horizontal only)
  useEffect(() => {
    if (stepRefs.current[activeStep] && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const stepEl = stepRefs.current[activeStep];
      
      const containerWidth = container.offsetWidth;
      const stepOffsetLeft = stepEl.offsetLeft;
      const stepWidth = stepEl.offsetWidth;
      
      const scrollLeft = stepOffsetLeft - (containerWidth / 2) + (stepWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeStep]);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + (UPDATE_INTERVAL / STEP_DURATION) * 100;
        });
      }, UPDATE_INTERVAL);
    } else {
      clearInterval(progressInterval.current);
    }

    return () => clearInterval(progressInterval.current);
  }, [isPlaying, activeStep]);

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
    setProgress(0);
  };

  const jumpToStep = (index) => {
    setActiveStep(index);
    setProgress(0);
  };

  return (
    <div className="hiw-container w-full max-w-7xl mx-auto py-12">
      {/* ── Workflow Track ── */}
      <div className="hiw-track-wrap relative mb-16 px-4 overflow-x-auto pb-8 hide-scrollbar" ref={scrollContainerRef}>
        <div className="hiw-track flex justify-between items-start min-w-max w-full relative px-10">
          
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              {/* Step Node */}
              <div className="hiw-step flex flex-col items-center relative z-10" ref={el => stepRefs.current[i] = el}>
                <button
                  className={`hiw-node relative w-14 h-14 md:w-20 md:h-20 flex items-center justify-center transition-all duration-500 ${
                    activeStep === i ? 'scale-110 shadow-[0_0_40px_rgba(255,255,255,0.12)]' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ 
                    borderRadius: '50%', // Force circle shape
                    background: 'transparent',
                    border: activeStep === i ? '1.5px solid #ffffff' : `1.5px solid ${themeColor}80`,
                  }}
                  onClick={() => jumpToStep(i)}
                >
                  {/* Progress Ring */}
                    {activeStep === i && (
                    <div className="absolute inset-0 pointer-events-none z-0">
                      <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="37"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="3"
                          strokeDasharray="232.5"
                          strokeDashoffset={232.5 - (232.5 * progress) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="relative z-10" style={{ color: activeStep === i ? '#ffffff' : themeColor }}>
                    {React.cloneElement(nodes[i], { size: 32 })}
                  </div>
                </button>
                <div className="mt-6 flex flex-col items-center">
                  <span className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                    activeStep === i ? 'text-white' : 'text-gray-600'
                  }`}>
                    {step.label || step.title}
                  </span>
                </div>
              </div>

              {/* Line Segment between nodes */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-14 md:h-20 flex items-center mx-2 md:mx-4 relative" style={{ minWidth: '30px' }}>
                  <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full" 
                      style={{ 
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 15px rgba(255,255,255,0.4)'
                      }}
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: activeStep > i ? '100%' : (activeStep === i ? `${progress}%` : '0%') 
                      }}
                      transition={{ duration: activeStep === i ? 0.05 : 0.4, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Content Card ── */}
      <div className="hiw-content-wrap px-4">
        <div className="hiw-card bg-[#0a0a0c] border border-white/5 rounded-[20px] md:rounded-[24px] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-white/20" />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <h3 className="text-2xl md:text-[32px] font-bold mb-6 tracking-tight text-white">
                {steps[activeStep].title}
              </h3>
              <p className="text-lg md:text-[18px] text-[#9494a3] leading-relaxed max-w-4xl font-medium">
                {steps[activeStep].description || steps[activeStep].d}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls & Nav dots */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-8 md:mt-12 gap-6 md:gap-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-5">
                <button 
                  onClick={handlePrev} 
                  className="flex items-center justify-center transition-all z-10 hover:opacity-80 group"
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    background: 'transparent', 
                    border: '1.5px solid rgba(255,255,255,0.4)' 
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="relative z-50">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center justify-center transition-all z-10 hover:opacity-80 shadow-2xl"
                  style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '50%', 
                    background: 'transparent', 
                    border: '2px solid rgba(255,255,255,0.5)' 
                  }}
                >
                  {isPlaying ? (
                    <Pause size={38} fill="#ffffff" stroke="#ffffff" strokeWidth={1} className="relative z-50" />
                  ) : (
                    <Play size={38} fill="#ffffff" stroke="#ffffff" strokeWidth={1} className="ml-1 relative z-50" />
                  )}
                </button>
                <button 
                  onClick={handleNext} 
                  className="flex items-center justify-center transition-all z-10 hover:opacity-80 group"
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    background: 'transparent', 
                    border: '1.5px solid rgba(255,255,255,0.4)' 
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="relative z-50">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => jumpToStep(i)}
                  className="relative h-[6px] rounded-full bg-white/10 transition-all duration-300 overflow-hidden"
                  style={{ width: activeStep === i ? '48px' : '12px' }}
                >
                  {activeStep === i && (
                    <div 
                      className="absolute top-0 left-0 h-full transition-all duration-[20ms] linear bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" 
                      style={{ width: `${progress}%` }} 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default HowItWorks;
