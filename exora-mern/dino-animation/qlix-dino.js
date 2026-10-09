// <qlix-dino> — the 2D Qlix dino wandering the viewport on a transparent layer.
// Attributes/props: size (px width, default 200), speed (1 = normal), follow ("true"/"false"),
// shadow ("true"/"false"), src (image url, default assets/qlix-dino.png).
(function () {
  if (customElements.get('qlix-dino')) return;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const FEET = 0.844, EYE = { x: 0.223, y: 0.184 };
  // layer clips (fractions of the square image): head + upper neck, tail, and the rest
  const HEAD = { clip: 'inset(0 60% 58% 0)', pivot: '25% 42%' };
  const TAIL = { clip: 'inset(45% 0 0 64%)', pivot: '64% 66%' };
  const FRONT_LEG = { clip: 'inset(63% 69% 13% 20%)' };
  const REAR_LEG = { clip: 'inset(64% 42% 12% 45%)' };
  const BODY = 'polygon(38% 0, 100% 0, 100% 47%, 66% 47%, 66% 100%, 0 100%, 0 40%, 38% 40%)';

  class QlixDino extends HTMLElement {
    static get observedAttributes() { return ['size', 'speed', 'follow', 'shadow', 'src']; }
    set size(v) { this._size = v; } get size() { return this._size; }
    set speed(v) { this._speed = v; } get speed() { return this._speed; }
    set follow(v) { this._follow = v; } get follow() { return this._follow; }
    set shadow(v) { this._shadow = v; } get shadow() { return this._shadow; }
    opt(name, def) {
      const v = this['_' + name] ?? this.getAttribute(name);
      if (v === null || v === undefined || v === '') return def;
      if (typeof def === 'boolean') return v === true || v === 'true';
      const n = +v; return isNaN(n) ? def : n;
    }
    connectedCallback() {
      this.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:40;display:block;overflow:hidden;';
      this.dead = false;
      this.build();
    }
    disconnectedCallback() {
      this.dead = true;
      cancelAnimationFrame(this.raf);
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('pointerdown', this.onDown);
      this.innerHTML = '';
    }
    build() {
      const src = this.getAttribute('src') || 'assets/qlix-dino.png';
      const abs = 'position:absolute;left:0;top:0;width:100%;height:100%;';
      const N = 12;
      // a stack of cut-outs through the thickness: lit faces front and back, darker crayon edge between
      const stack = (clip) => Array.from({ length: N }, (_, i) => {
        const f = i / (N - 1), edge = i > 0 && i < N - 1;
        return `<img data-z="${(f - 0.5).toFixed(3)}" src="${src}" alt="" draggable="false" style="${abs}clip-path:${clip};backface-visibility:visible;${edge ? 'filter:brightness(.42) saturate(1.3);' : ''}">`;
      }).join('');
      const eye = (z) => `<div data-r="eye" data-z="${z}" style="position:absolute;left:${EYE.x * 100}%;top:${EYE.y * 100}%;width:2.6%;height:3%;margin:-1.3% 0 0 -1.3%;border-radius:50%;background:#262a0c;"><div style="position:absolute;left:22%;top:18%;width:38%;height:34%;border-radius:50%;background:#f4f1e2;"></div></div>`;
      const p3 = 'transform-style:preserve-3d;';
      this.innerHTML = `
        <div data-r="shadow" style="position:absolute;left:0;top:0;border-radius:50%;background:radial-gradient(closest-side,rgba(40,44,18,.22),rgba(40,44,18,0));will-change:transform;"></div>
        <div data-r="root" style="position:absolute;left:0;top:0;will-change:transform;transform-style:preserve-3d;">
          <div data-r="flip" style="${abs}${p3}">
            <div style="${abs}${p3}">${stack(BODY)}</div>
            <div data-r="rear-leg" style="${abs}${p3}"><img src="${src}" alt="" draggable="false" style="${abs}clip-path:${REAR_LEG.clip};"></div>
            <div data-r="front-leg" style="${abs}${p3}"><img src="${src}" alt="" draggable="false" style="${abs}clip-path:${FRONT_LEG.clip};"></div>
            <div data-r="tail" style="${abs}${p3}transform-origin:${TAIL.pivot};">${stack(TAIL.clip)}</div>
            <div data-r="head" style="${abs}${p3}transform-origin:${HEAD.pivot};">${stack(HEAD.clip)}${eye(0.52)}${eye(-0.52)}</div>
          </div>
        </div>`;
      const r = (k) => this.querySelector(`[data-r="${k}"]`);
      this.el = { root: r('root'), flip: r('flip'), head: r('head'), tail: r('tail'), frontLeg: r('front-leg'), rearLeg: r('rear-leg'), eyes: [...this.querySelectorAll('[data-r="eye"]')], shadow: r('shadow'), layers: [...this.querySelectorAll('[data-z]')] };
      this.root3d = this.el.root;
      this.run();
    }
    run() {
      const W = () => window.innerWidth, H = () => window.innerHeight;
      const size = () => this.opt('size', 200);
      const s0 = size();
      const route = document.getElementById('qlix-dino-route-path');
      let routeAnchorY = null;
      const configureRoute = () => {
        const videoBox = document.querySelector('.ql-hero-video')?.getBoundingClientRect();
        if (!route || !videoBox) return;
        routeAnchorY = videoBox.top;
        const startX = clamp(((videoBox.left + videoBox.width * 0.78) / W()) * 100, 58, 88);
        const routeY = clamp((videoBox.top / H()) * 100, 38, 72);
        const endY = clamp(routeY + 38, 78, 92);
        route.setAttribute('d', `M ${startX} ${routeY} L 8 ${endY}`);
      };
      configureRoute();
      let routeLength = route?.getTotalLength() || 0;
      const routePoint = (distance) => {
        if (!route || !routeLength) return null;
        const point = route.getPointAtLength(clamp(distance, 0, routeLength));
        const matrix = route.getScreenCTM();
        if (!matrix) return null;
        return {
          x: point.x * matrix.a + point.y * matrix.c + matrix.e,
          y: point.x * matrix.b + point.y * matrix.d + matrix.f,
        };
      };
      let routePixelLength = 0;
      if (route && routeLength) {
        let previous = routePoint(0);
        for (let i = 1; i <= 120; i += 1) {
          const current = routePoint((routeLength * i) / 120);
          if (previous && current) routePixelLength += Math.hypot(current.x - previous.x, current.y - previous.y);
          previous = current;
        }
      }
      const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
      const logoRect = rect('.ql-hero-brandmark img');
      const headlineRect = rect('.ql-hero-copy-minimal h1');
      const videoRect = rect('.ql-hero-video');
      const toplineRect = rect('.ql-hero-topline span:last-child');
      const toBaseline = (x, visualY) => ({ x, y: visualY + s0 * 0.4 });
      const intro = {
        start: toBaseline(
          clamp((toplineRect?.right || W() * 0.94) + s0 * 0.12, s0 * 0.55, W() - s0 * 0.5),
          (toplineRect?.bottom || H() * 0.2) + s0 * 0.42,
        ),
        logo: toBaseline(
          logoRect ? logoRect.left + logoRect.width / 2 : W() * 0.5,
          (logoRect?.bottom || H() * 0.2) + s0 * 0.48,
        ),
        headline: toBaseline(
          headlineRect ? headlineRect.left + headlineRect.width * 0.28 : W() * 0.28,
          headlineRect ? headlineRect.top + headlineRect.height * 0.48 : H() * 0.65,
        ),
        video: toBaseline(
          videoRect ? videoRect.left + videoRect.width * 0.22 : W() * 0.72,
          videoRect ? videoRect.top + videoRect.height * 0.28 : H() * 0.72,
        ),
      };
      const st = {
        x: routePoint(0)?.x || intro.start.x, y: routePoint(0)?.y || intro.start.y, face: 1, faceS: 1, mode: route ? 'route' : 'intro-pause', t: 0, dur: 0.7,
        target: intro.logo, phase: 0, gait: 0, jump: 0, sq: 1, rock: 0,
        head: 0, tail: 0, nextBlink: 1.5, blinkT: -1, routeDistance: 0, routeDirection: 1,
      };
      const mouse = { x: -1e4, y: -1e4, at: -1e4 };
      let clock = 0;
      let nextRouteSync = 0;
      const bounds = () => { const s = size(); return { x0: s * 0.55, x1: W() - s * 0.55, y0: Math.min(s * 0.95, H() * 0.6), y1: H() - s * 0.08 }; };
      const setMode = (m, dur = 0) => { st.mode = m; st.t = 0; st.dur = dur; };
      const travel = (m, target, dur) => {
        st.from = { x: st.x, y: st.y };
        st.target = target;
        setMode(m, dur);
      };
      const pickTarget = () => {
        const b = bounds();
        if (this.opt('follow', true) && clock - mouse.at < 2.5 && Math.random() < 0.4)
          return { x: clamp(mouse.x + (Math.random() < 0.5 ? -1 : 1) * size() * 0.7, b.x0, b.x1), y: clamp(mouse.y + size() * 0.4, b.y0, b.y1) };
        let p, n = 0;
        do { p = { x: rand(b.x0, b.x1), y: rand(b.y0, b.y1) }; } while (Math.hypot(p.x - st.x, p.y - st.y) < size() * 1.3 && ++n < 12);
        return p;
      };
      const nextAction = () => {
        const r = Math.random();
        if (r < 0.3) setMode('idle', rand(1.8, 3.5));
        else if (r < 0.45) { setMode('hop', 0.55); st.hops = Math.random() < 0.5 ? 2 : 3; }
        else if (r < 0.55) setMode('wiggle', 1.1);
        else if (r < 0.63) { st.side = st.x < W() / 2 ? -1 : 1; st.target = { x: st.side < 0 ? -size() * 0.7 : W() + size() * 0.7, y: st.y }; setMode('exit'); }
        else { st.target = pickTarget(); setMode('walk'); }
      };
      const center = () => ({ x: st.x, y: st.y - size() * 0.4 });

      this.onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.at = clock; };
      this.onDown = (e) => {
        const c = center();
        if (Math.hypot(e.clientX - c.x, e.clientY - c.y) < size() * 0.5 && st.mode !== 'away') { setMode('hop', 0.5); st.hops = 3; }
      };
      window.addEventListener('pointermove', this.onMove);
      window.addEventListener('pointerdown', this.onDown);

      const walkTo = (dt, spd, s) => {
        const dx = st.target.x - st.x, dy = st.target.y - st.y, d = Math.hypot(dx, dy);
        if (Math.abs(dx) > 4) st.face = dx < 0 ? 1 : -1; // native art faces left
        const v = Math.min(85 * spd * (s / 200), d * 3);
        if (d > 0.01) { st.x += (dx / d) * v * dt; st.y += (dy / d) * v * dt; }
        st.phase += dt * 11 * spd * clamp(v / 40, 0.3, 1);
        return { d, walking: clamp(v / 30, 0, 1) };
      };

      const step = (now) => {
        const dt = Math.min(0.05, Math.max(0, (now - (this.last ?? now)) / 1000)); this.last = now; clock += dt;
        const spd = this.opt('speed', 1), s = size();
        st.t += dt * spd;
        let walking = 0, jump = 0, sq = 1, rock = 0, head = Math.sin(clock * 1.7) * 3, tail = Math.sin(clock * 2.4) * 4;
        let hidden = false;

        if (st.mode === 'route') {
          if (clock >= nextRouteSync) {
            nextRouteSync = clock + 0.2;
            const currentVideoTop = document.querySelector('.ql-hero-video')?.getBoundingClientRect().top;
            if (currentVideoTop != null && (routeAnchorY == null || Math.abs(currentVideoTop - routeAnchorY) > 1)) {
              const progress = routeLength ? st.routeDistance / routeLength : 0;
              configureRoute();
              routeLength = route?.getTotalLength() || routeLength;
              st.routeDistance = progress * routeLength;
            }
          }
          const previousX = st.x;
          const routeRate = routePixelLength > 0 ? routeLength / routePixelLength : 0;
          st.routeDistance += dt * 46 * spd * routeRate * st.routeDirection;
          if (st.routeDistance >= routeLength) { st.routeDistance = routeLength; st.routeDirection = -1; }
          if (st.routeDistance <= 0) { st.routeDistance = 0; st.routeDirection = 1; }
          const point = routePoint(st.routeDistance);
          if (point) {
            st.x = point.x;
            st.y = point.y;
            if (Math.abs(st.x - previousX) > 0.05) st.face = st.x < previousX ? 1 : -1;
          }
          st.phase += dt * 7.5 * spd;
          walking = 1;
        } else if (st.mode === 'intro-pause') {
          head = -4 + Math.sin(st.t * 3) * 3;
          tail = Math.sin(st.t * 6) * 5;
          if (st.t >= st.dur) { st.target = intro.logo; setMode('intro-walk-logo'); }
        } else if (st.mode === 'intro-walk-logo') {
          const w = walkTo(dt, spd, s); walking = w.walking;
          if (w.d < 3) setMode('intro-hop', 0.62);
        } else if (st.mode === 'intro-hop') {
          const p = Math.min(1, st.t / st.dur);
          jump = Math.sin(p * Math.PI) * s * 0.22;
          sq = 1 + Math.sin(p * Math.PI) * 0.04;
          head = -6; tail = 8;
          if (p >= 1) { st.target = intro.headline; setMode('intro-walk-text'); }
        } else if (st.mode === 'intro-walk-text') {
          const w = walkTo(dt, spd, s); walking = w.walking;
          if (w.d < 3) setMode('intro-text-pause', 0.6);
        } else if (st.mode === 'intro-text-pause') {
          head = -3 + Math.sin(st.t * 3) * 3;
          tail = Math.sin(st.t * 5) * 5;
          if (st.t >= st.dur) { st.target = intro.video; setMode('intro-walk-video'); }
        } else if (st.mode === 'intro-walk-video') {
          const w = walkTo(dt, spd, s); walking = w.walking;
          if (w.d < 3) setMode('idle', 1.6);
        } else if (st.mode === 'walk') {
          const w = walkTo(dt, spd, s); walking = w.walking;
          if (w.d < 3) nextAction();
        } else if (st.mode === 'exit') {
          const w = walkTo(dt, spd, s); walking = w.walking;
          if (w.d < 3) setMode('away', rand(1.2, 2.2));
        } else if (st.mode === 'away') {
          hidden = true;
          if (st.t > st.dur) {
            st.y = rand(bounds().y0 + s * 0.3, bounds().y1);
            st.x = st.side < 0 ? -s * 0.12 : W() + s * 0.12; // just the head pokes in
            st.face = st.side < 0 ? -1 : 1; st.faceS = st.face;
            setMode('peek', 2.4);
          }
        } else if (st.mode === 'peek') {
          const p = st.t / st.dur;
          head = -10 + Math.sin(st.t * 3) * 6;
          if (p > 0.35 && p < 0.42) jump = 0;
          if (p >= 1) { st.target = pickTarget(); setMode('walk'); }
        } else if (st.mode === 'idle') {
          const c = center();
          if (this.opt('follow', true) && clock - mouse.at < 3 && Math.hypot(mouse.x - c.x, mouse.y - c.y) < s * 3) {
            if (Math.abs(mouse.x - st.x) > s * 0.15) st.face = mouse.x < st.x ? 1 : -1;
            head = clamp((c.y - mouse.y) / (s * 0.12), -12, 10) * -1;
          } else head = Math.sin(st.t * 1.6) * 8 - 2;
          sq = 1 + Math.sin(clock * 2.2) * 0.012;
          tail = Math.sin(clock * 5) * 7;
          if (st.t > st.dur) nextAction();
        } else if (st.mode === 'hop') {
          const p = Math.min(1, st.t / st.dur);
          if (p < 0.22) sq = 1 - 0.18 * Math.sin((p / 0.22) * Math.PI / 2);
          else if (p < 0.84) { const q = (p - 0.22) / 0.62; jump = Math.sin(q * Math.PI) * s * 0.28; sq = 1 + 0.12 * Math.sin(q * Math.PI); }
          else sq = 1 - 0.15 * Math.sin(((p - 0.84) / 0.16) * Math.PI);
          head = -6 + (p > 0.22 && p < 0.84 ? -8 : 4); tail = (p > 0.22 && p < 0.84 ? 12 : -4);
          if (p >= 1) { st.hops -= 1; if (st.hops > 0) setMode('hop', 0.55); else nextAction(); }
        } else if (st.mode === 'wiggle') {
          const p = Math.min(1, st.t / st.dur);
          rock = Math.sin(st.t * 22) * 6 * Math.sin(p * Math.PI);
          tail = Math.sin(st.t * 22) * 14; head = Math.sin(st.t * 22 + 1) * 6;
          sq = 1 + Math.sin(st.t * 22) * 0.03;
          if (p >= 1) nextAction();
        }

        const lerp = (k) => Math.min(1, dt * k);
        st.gait += (walking - st.gait) * lerp(8);
        st.jump += (jump - st.jump) * lerp(28);
        st.sq += (sq - st.sq) * lerp(28);
        st.faceS += (st.face - st.faceS) * lerp(5);
        // 3D yaw: 0 = native (facing left), 180 = turned around; lean toward/away when walking up or down
        const dyv = st.mode === 'walk' || st.mode === 'exit' ? clamp((st.target.y - st.y) / (Math.abs(st.target.x - st.x) + Math.abs(st.target.y - st.y) + 1), -1, 1) : 0;
        const extra = st.mode === 'idle' ? Math.sin(clock * 0.9) * 22 : st.mode === 'wiggle' ? Math.sin(st.t * 11) * 18 : dyv * -35 * st.face;
        st.yaw3 = (st.yaw3 ?? 0) + (extra - (st.yaw3 ?? 0)) * lerp(4);
        st.head += (head + st.gait * Math.sin(st.phase * 2) * 3 - st.head) * lerp(10);
        st.tail += (tail + st.gait * Math.sin(st.phase) * 6 - st.tail) * lerp(10);
        const g = st.gait;
        const bob = Math.abs(Math.sin(st.phase)) * s * 0.03 * g;
        const stepSq = 1 + (Math.abs(Math.sin(st.phase)) - 0.5) * 0.035 * g;
        const tilt = Math.sin(st.phase) * 2.2 * g + rock;
        const sy = st.sq * stepSq, sx = 1 / Math.sqrt(sy);

        if (clock > st.nextBlink) { st.blinkT = 0; st.nextBlink = clock + rand(2, 5); if (Math.random() < 0.3) st.nextBlink = clock + 0.3; }
        let eye = 1;
        if (st.blinkT >= 0) { st.blinkT += dt; const b = st.blinkT / 0.16; eye = b < 1 ? 1 - 0.9 * Math.sin(b * Math.PI) : 1; if (b >= 1) st.blinkT = -1; }

        const E = this.el, top = st.y - s * FEET - st.jump - bob;
        E.root.style.width = E.root.style.height = s + 'px';
        E.root.style.transformOrigin = `50% ${FEET * 100}%`;
        E.root.style.transform = `translate(${st.x - s / 2}px, ${top}px) rotate(${tilt}deg) scale(${sx}, ${sy})`;
        E.root.style.visibility = hidden ? 'hidden' : 'visible';
        // squash through zero when turning around, like a quick spin
        const turn = (1 - st.faceS) * 90; // 0..180 as faceS goes 1 → -1
        E.flip.style.transform = `perspective(${s * 6}px) rotateY(${turn + st.yaw3}deg)`;
        if (this._lastS !== s) {
          this._lastS = s; const T = s * 0.07;
          E.layers.forEach((l) => (l.style.transform = `translateZ(${+l.dataset.z * T}px)`));
        }
        E.head.style.transform = `rotate(${st.head}deg)`;
        E.tail.style.transform = `rotate(${st.tail}deg)`;
        const stride = Math.sin(st.phase) * s * 0.018 * g;
        const frontLift = Math.max(0, Math.sin(st.phase)) * s * 0.022 * g;
        const rearLift = Math.max(0, -Math.sin(st.phase)) * s * 0.022 * g;
        E.frontLeg.style.transform = `translate(${stride}px, ${-frontLift}px)`;
        E.rearLeg.style.transform = `translate(${-stride}px, ${-rearLift}px)`;
        E.eyes.forEach((e) => (e.style.transform = `translateZ(${+e.dataset.z * s * 0.07}px) scaleY(${eye})`));
        const showSh = this.opt('shadow', true) && !hidden;
        const shW = s * 0.8 * (1 - Math.min(0.4, st.jump / (s * 0.9)));
        E.shadow.style.display = showSh ? 'block' : 'none';
        E.shadow.style.width = shW + 'px'; E.shadow.style.height = s * 0.1 + 'px';
        E.shadow.style.opacity = String(1 - Math.min(0.55, st.jump / (s * 0.5)));
        E.shadow.style.transform = `translate(${st.x - shW / 2 + st.faceS * -s * 0.02}px, ${st.y - s * 0.05}px)`;
      };
      this._step = step;
      const tick = (now) => {
        if (this.dead) return;
        try { step(now); } catch (err) { console.error(err); }
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
  }
  customElements.define('qlix-dino', QlixDino);
})();
