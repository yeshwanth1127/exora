import { useEffect, useState } from 'react';

const SCRIPT_ID = 'qlix-dino-element-script';

export default function DinoWanderer() {
  const [enabled, setEnabled] = useState(false);
  const [size, setSize] = useState(160);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 760px)');
    const sync = () => {
      setEnabled(!reduceMotion.matches);
      setSize(mobile.matches ? 80 : 112);
    };

    sync();
    reduceMotion.addEventListener('change', sync);
    mobile.addEventListener('change', sync);
    return () => {
      reduceMotion.removeEventListener('change', sync);
      mobile.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled || customElements.get('qlix-dino')) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = '/dino-animation/qlix-dino.js';
    script.async = true;
    document.head.appendChild(script);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <svg className="qlix-dino-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path
          id="qlix-dino-route-path"
          d="M 88 42 L 8 88"
        />
      </svg>
      <qlix-dino
        class="qlix-dino-wanderer"
        size={String(size)}
        speed="0.9"
        follow="false"
        shadow="true"
        src="/dino-animation/qlix-dino.png"
        aria-hidden="true"
      />
    </>
  );
}
