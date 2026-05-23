

/* -------------------------------------------------------------
   1. DEFAULTS — Configuración base
------------------------------------------------------------- */
const DEFAULTS = {
  count:          60,    // número de partículas
  minRadius:      1,     // radio mínimo en px
  maxRadius:      3,     // radio máximo en px
  minSpeed:       0.2,   // velocidad mínima
  maxSpeed:       0.6,   // velocidad máxima
  opacity:        0.5,   // opacidad base
  connectRadius:  120,   // distancia para conectar partículas
  connectOpacity: 0.08,  // opacidad de las líneas de conexión
  interactive:    true,  // reaccionar al cursor
  mouseRadius:    120,   // radio de influencia del cursor
  colorLight:     '0, 194, 168',    // RGB acento modo claro
  colorDark:      '0, 212, 184',    // RGB acento modo oscuro
  color2Light:    '255, 107, 53',   // RGB acento-2 modo claro
  color2Dark:     '255, 122, 71',   // RGB acento-2 modo oscuro
};

/* -------------------------------------------------------------
   2. CLASE PARTICLE — Una partícula individual
------------------------------------------------------------- */
class Particle {

  /**
   * @param {number} canvasW  - ancho del canvas
   * @param {number} canvasH  - alto del canvas
   * @param {object} config   - configuración global
   */
  constructor(canvasW, canvasH, config) {
    this._config = config;
    this._reset(canvasW, canvasH);
  }

  /**
   * Inicializa o reinicia la posición y velocidad.
   * @param {number} w
   * @param {number} h
   */
  _reset(w, h) {
    const cfg       = this._config;
    this.x          = Math.random() * w;
    this.y          = Math.random() * h;
    this.radius     = cfg.minRadius + Math.random() * (cfg.maxRadius - cfg.minRadius);
    this.speed      = cfg.minSpeed  + Math.random() * (cfg.maxSpeed  - cfg.minSpeed);
    this.angle      = Math.random() * Math.PI * 2;
    this.vx         = Math.cos(this.angle) * this.speed;
    this.vy         = Math.sin(this.angle) * this.speed;
    this.opacity    = (0.3 + Math.random() * 0.7) * cfg.opacity;
    this.isAccent2  = Math.random() > 0.75; // 25% usan color acento-2
    this.pulse      = Math.random() * Math.PI * 2; // fase de pulso
    this.pulseSpeed = 0.02 + Math.random() * 0.02;
  }

  /**
   * Actualiza posición en cada frame.
   * @param {number} w - ancho del canvas
   * @param {number} h - alto del canvas
   * @param {{ x: number, y: number } | null} mouse
   */
  update(w, h, mouse) {
    // Movimiento base
    this.x += this.vx;
    this.y += this.vy;

    // Pulso de opacidad
    this.pulse += this.pulseSpeed;
    const pulsedOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
    this._currentOpacity = pulsedOpacity;

    // Rebote en bordes
    if (this.x < -this.radius)  this.x = w + this.radius;
    if (this.x > w + this.radius) this.x = -this.radius;
    if (this.y < -this.radius)  this.y = h + this.radius;
    if (this.y > h + this.radius) this.y = -this.radius;

    // Influencia del cursor
    if (mouse && this._config.interactive) {
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this._config.mouseRadius) {
        const force  = (this._config.mouseRadius - dist) / this._config.mouseRadius;
        const angle  = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 0.08;
        this.vy += Math.sin(angle) * force * 0.08;
      }
    }

    // Limitar velocidad máxima
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this._config.maxSpeed * 2) {
      this.vx = (this.vx / speed) * this._config.maxSpeed * 2;
      this.vy = (this.vy / speed) * this._config.maxSpeed * 2;
    }

    // Fricción suave para volver a velocidad normal
    this.vx *= 0.99;
    this.vy *= 0.99;
  }

  /**
   * Dibuja la partícula en el canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} color  - RGB string: '0, 194, 168'
   * @param {string} color2 - RGB string para acento-2
   */
  draw(ctx, color, color2) {
    const rgb = this.isAccent2 ? color2 : color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb}, ${this._currentOpacity})`;
    ctx.fill();
  }
}

/* -------------------------------------------------------------
   3. CLASE PARTICLES ENGINE — Orquesta todo
------------------------------------------------------------- */
export class ParticlesEngine {

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} options
   */
  constructor(canvas, options = {}) {
    if (!canvas) {
      console.warn('[Particles] Canvas no encontrado.');
      return;
    }

    this._canvas    = canvas;
    this._ctx       = canvas.getContext('2d');
    this._config    = { ...DEFAULTS, ...options };
    this._particles = [];
    this._mouse     = null;
    this._raf       = null;
    this._running   = false;
    this._dark      = false;
    this._resizeObs = null;
  }

  /* -----------------------------------------------------------
     4. API PÚBLICA
  ----------------------------------------------------------- */

  /**
   * Inicializa y arranca el motor de partículas.
   * @returns {ParticlesEngine} this
   */
  start() {
    if (this._running) return this;
    this._running = true;
    this._resize();
    this._createParticles();
    this._bindEvents();
    this._loop();
    return this;
  }

  /**
   * Pausa el loop de animación.
   * @returns {ParticlesEngine} this
   */
  pause() {
    cancelAnimationFrame(this._raf);
    this._running = false;
    return this;
  }

  /**
   * Reanuda el loop.
   * @returns {ParticlesEngine} this
   */
  resume() {
    if (this._running) return this;
    this._running = true;
    this._loop();
    return this;
  }

  /**
   * Destruye el engine y limpia todos los listeners.
   */
  destroy() {
    cancelAnimationFrame(this._raf);
    this._running = false;
    this._resizeObs?.disconnect();
    this._canvas.removeEventListener('mousemove', this._onMouseMove);
    this._canvas.removeEventListener('mouseleave', this._onMouseLeave);
    this._particles = [];
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  /**
   * Actualiza el modo oscuro/claro.
   * @param {boolean} isDark
   * @returns {ParticlesEngine} this
   */
  setDark(isDark) {
    this._dark = isDark;
    return this;
  }

  /**
   * Actualiza el número de partículas en caliente.
   * @param {number} count
   * @returns {ParticlesEngine} this
   */
  setCount(count) {
    this._config.count = count;
    this._createParticles();
    return this;
  }

  /* -----------------------------------------------------------
     5. LOOP DE ANIMACIÓN
  ----------------------------------------------------------- */

  /**
   * Loop principal usando requestAnimationFrame.
   */
  _loop() {
    if (!this._running) return;
    this._update();
    this._draw();
    this._raf = requestAnimationFrame(() => this._loop());
  }

  /**
   * Actualiza todas las partículas.
   */
  _update() {
    const { width: w, height: h } = this._canvas;
    this._particles.forEach((p) => p.update(w, h, this._mouse));
  }

  /**
   * Dibuja un frame completo.
   */
  _draw() {
    const { width: w, height: h } = this._canvas;
    const cfg   = this._config;
    const color  = this._dark ? cfg.colorDark  : cfg.colorLight;
    const color2 = this._dark ? cfg.color2Dark : cfg.color2Light;

    // Limpiar canvas
    this._ctx.clearRect(0, 0, w, h);

    // Dibujar conexiones entre partículas cercanas
    this._drawConnections(color);

    // Dibujar cada partícula
    this._particles.forEach((p) => p.draw(this._ctx, color, color2));

    // Dibujar efecto de cursor
    if (this._mouse && cfg.interactive) {
      this._drawMouseEffect(color);
    }
  }

  /* -----------------------------------------------------------
     6. CONEXIONES — Líneas entre partículas cercanas
  ----------------------------------------------------------- */

  /**
   * Dibuja líneas entre partículas dentro del radio de conexión.
   * @param {string} color - RGB string
   */
  _drawConnections(color) {
    const particles = this._particles;
    const radius    = this._config.connectRadius;
    const maxOp     = this._config.connectOpacity;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const opacity = maxOp * (1 - dist / radius);
          this._ctx.beginPath();
          this._ctx.moveTo(particles[i].x, particles[i].y);
          this._ctx.lineTo(particles[j].x, particles[j].y);
          this._ctx.strokeStyle = `rgba(${color}, ${opacity})`;
          this._ctx.lineWidth   = 0.8;
          this._ctx.stroke();
        }
      }
    }
  }

  /**
   * Dibuja un efecto de destello alrededor del cursor.
   * @param {string} color
   */
  _drawMouseEffect(color) {
    const { x, y }  = this._mouse;
    const radius     = this._config.mouseRadius;
    const gradient   = this._ctx.createRadialGradient(
      x, y, 0,
      x, y, radius
    );
    gradient.addColorStop(0,   `rgba(${color}, 0.06)`);
    gradient.addColorStop(1,   `rgba(${color}, 0)`);
    this._ctx.beginPath();
    this._ctx.arc(x, y, radius, 0, Math.PI * 2);
    this._ctx.fillStyle = gradient;
    this._ctx.fill();
  }

  /* -----------------------------------------------------------
     7. SETUP — Crear partículas y ajustar canvas
  ----------------------------------------------------------- */

  /**
   * Crea el array de partículas.
   */
  _createParticles() {
    const { width: w, height: h } = this._canvas;
    this._particles = Array.from(
      { length: this._config.count },
      () => new Particle(w, h, this._config)
    );
  }

  /**
   * Ajusta el tamaño del canvas al contenedor.
   */
  _resize() {
    const parent = this._canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = parent.offsetWidth;
    const h   = parent.offsetHeight;

    this._canvas.width  = w * dpr;
    this._canvas.height = h * dpr;
    this._canvas.style.width  = `${w}px`;
    this._canvas.style.height = `${h}px`;
    this._ctx.scale(dpr, dpr);
  }

  /* -----------------------------------------------------------
     8. EVENTOS — Mouse y resize
  ----------------------------------------------------------- */
  _bindEvents() {
    // Mouse move — coordenadas relativas al canvas
    this._onMouseMove = (e) => {
      const rect = this._canvas.getBoundingClientRect();
      this._mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    this._onMouseLeave = () => {
      this._mouse = null;
    };

    // Usar el hero como área de detección, no solo el canvas
    const hero = this._canvas.closest('.hero') || this._canvas;
    hero.addEventListener('mousemove',  this._onMouseMove);
    hero.addEventListener('mouseleave', this._onMouseLeave);

    // Resize con ResizeObserver para mayor precisión
    if ('ResizeObserver' in window) {
      this._resizeObs = new ResizeObserver(() => {
        this._resize();
        this._createParticles();
      });
      this._resizeObs.observe(this._canvas.parentElement);
    } else {
      window.addEventListener('resize', () => {
        this._resize();
        this._createParticles();
      });
    }
  }
}

/* -------------------------------------------------------------
   9. FACTORY — Función de conveniencia
------------------------------------------------------------- */

/**
 * Crea e inicia un motor de partículas.
 * @param {string} canvasId  - id del canvas en el DOM
 * @param {object} options   - opciones de configuración
 * @returns {ParticlesEngine | null}
 */
export const createParticles = (canvasId, options = {}) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.warn(`[Particles] No se encontró canvas #${canvasId}`);
    return null;
  }
  return new ParticlesEngine(canvas, options).start();
};

/* -------------------------------------------------------------
   10. PRESETS — Configuraciones listas para usar
------------------------------------------------------------- */
export const PARTICLE_PRESETS = {

  /** Sutil — pocos puntos, sin conexiones */
  subtle: {
    count:          30,
    minRadius:      1,
    maxRadius:      2,
    opacity:        0.35,
    connectRadius:  0,
    interactive:    false,
  },

  /** Default — balance entre visual y performance */
  default: {
    count:          60,
    connectRadius:  120,
    interactive:    true,
  },

  /** Rico — muchas partículas con conexiones */
  rich: {
    count:          100,
    minRadius:      1,
    maxRadius:      3,
    opacity:        0.5,
    connectRadius:  150,
    connectOpacity: 0.1,
    interactive:    true,
    mouseRadius:    150,
  },

  /** Mobile — optimizado para pantallas pequeñas */
  mobile: {
    count:          25,
    minRadius:      1,
    maxRadius:      2,
    opacity:        0.4,
    connectRadius:  80,
    connectOpacity: 0.06,
    interactive:    false,
  },
};