import { useEffect, useRef, useState } from 'react';
import './InfiniteMenu.css';

export default function InfiniteMenu({ items = [] }) {
  const canvasRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (canvas) {
      // Simple fallback for now - just show a placeholder
      canvas.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.innerHTML = `
        <div style="
          color: #cfcaff; 
          text-align: center; 
          padding: 40px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1));
          border-radius: 16px;
          border: 1px solid rgba(124, 58, 237, 0.3);
        ">
          <div style="font-size: 24px; margin-bottom: 16px;">🎯 Interactive 3D Menu</div>
          <div style="font-size: 16px; opacity: 0.8;">WebGL-powered sphere with rotating discs</div>
          <div style="font-size: 14px; opacity: 0.6; margin-top: 8px;">Coming soon...</div>
        </div>
      `;
      canvas.parentNode.appendChild(fallback);
    }
  }, [items]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas id="infinite-grid-menu-canvas" ref={canvasRef} />
    </div>
  );
}