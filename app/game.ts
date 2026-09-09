export type Mode = 'ready' | 'playing' | 'paused' | 'upgrade' | 'dead';
export type Snapshot = {
  mode: Mode;
  hp: number;
  maxHp: number;
  xp: number;
  nextXp: number;
  level: number;
  count: number;
  kills: number;
  time: number;
  choices: string[];
  wave: number;
};
type V = { x: number; y: number };
type Unit = V & {
  hp: number;
  max: number;
  cd: number;
  hit: number;
  type: number;
  id: number;
};
type Bullet = V & {
  vx: number;
  vy: number;
  life: number;
  damage: number;
  enemy: boolean;
};
type Particle = V & {
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};
type Prop = V & {
  w: number;
  d: number;
  h: number;
  type: string;
  color: string;
};
export const upgrades: Record<
  string,
  { name: string; tag: string; icon: string; description: string }
> = {
  robot: {
    name: '+1 Robot',
    tag: 'REINFORCEMENTS',
    icon: '+1',
    description:
      'A new little machine joins your swarm and fires automatically.',
  },
  trio: {
    name: '+3 Robots',
    tag: 'MASS PRODUCTION',
    icon: '+3',
    description: 'Three more robots. Three more reasons to fear the toaster.',
  },
  fire: {
    name: 'Overclock',
    tag: 'FIRE RATE',
    icon: '»',
    description: 'All robots shoot 22% faster. More bolts, less waiting.',
  },
  damage: {
    name: 'Hotter Lasers',
    tag: 'DAMAGE',
    icon: '↗',
    description: 'All projectiles deal 30% more damage.',
  },
  health: {
    name: 'Heavy Chassis',
    tag: 'CORE INTEGRITY',
    icon: '♥',
    description: '+30 maximum core health. Restore 30 health immediately.',
  },
  convert: {
    name: 'Rewrite Protocol',
    tag: 'CONVERSION',
    icon: '⌘',
    description: '+6% chance to turn a defeated human into a robot, up to 30%.',
  },
  repair: {
    name: 'Repair Robot',
    tag: 'RECOVERY',
    icon: '✚',
    description:
      'Repair 40 core health. Add a repair bot that heals 1 HP every 3 seconds.',
  },
  explode: {
    name: 'Exploding Robots',
    tag: 'CHAIN REACTION',
    icon: '✳',
    description:
      'Destroyed followers explode. Every 8th shot also deals blast damage.',
  },
  speed: {
    name: 'Little Fast Feet',
    tag: 'MOVEMENT',
    icon: '⇢',
    description: 'Move 15% faster. Increase XP pickup range by 20%.',
  },
};
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const dist = (a: V, b: V) => Math.hypot(a.x - b.x, a.y - b.y);
export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  emit: (s: Snapshot) => void;
  mode: Mode = 'ready';
  player: Unit;
  robots: Unit[] = [];
  enemies: Unit[] = [];
  bullets: Bullet[] = [];
  xpDrops: (V & { value: number })[] = [];
  particles: Particle[] = [];
  props: Prop[] = [];
  keys = new Set<string>();
  stick = { x: 0, y: 0 };
  time = 0;
  xp = 0;
  nextXp = 7;
  level = 1;
  kills = 0;
  wave = 1;
  choices: string[] = [];
  damage = 16;
  fire = 0.65;
  speed = 79;
  magnet = 66;
  convert = 0;
  explosive = false;
  repairs = 0;
  shot = 0;
  peak = 1;
  spawn = 0;
  uid = 0;
  invuln = 0;
  raf = 0;
  last = 0;
  ui = 0;
  w = 800;
  h = 500;
  zoom = 1;
  camera = { x: 0, y: 0 };
  muted = false;
  audio: AudioContext | null = null;
  lastSound = 0;
  seed = 27;
  observer: ResizeObserver;
  destroyed = false;
  constructor(canvas: HTMLCanvasElement, emit: (s: Snapshot) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.emit = emit;
    this.player = this.unit(0, 0, 100, 0);
    this.makeMap();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
    window.addEventListener('blur', this.blur);
    document.addEventListener('visibilitychange', this.visibility);
    this.resize();
    this.publish();
    this.raf = requestAnimationFrame(this.frame);
  }
  random() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
  unit(x: number, y: number, hp: number, type: number): Unit {
    return {
      x,
      y,
      hp,
      max: hp,
      type,
      cd: this.random() * 0.5,
      hit: 0,
      id: this.uid++,
    };
  }
  keydown = (e: KeyboardEvent) => {
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
    )
      e.preventDefault();
    this.keys.add(e.key.toLowerCase());
    if ((e.key === 'Escape' || e.key === 'p') && !e.repeat) this.pause();
  };
  keyup = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };
  blur = () => {
    this.keys.clear();
    this.setStick(0, 0);
    if (this.mode === 'playing') {
      this.mode = 'paused';
      this.publish();
    }
  };
  visibility = () => {
    if (document.hidden) this.blur();
  };
  setStick(x: number, y: number) {
    this.stick = { x, y };
  }
  setMuted(m: boolean) {
    this.muted = m;
  }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.floor(r.width / 2));
    this.h = Math.max(1, Math.floor(r.height / 2));
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.ctx.imageSmoothingEnabled = false;
    this.zoom = this.w < 300 ? 0.78 : 1;
  }
  start() {
    if (!this.audio) {
      try {
        this.audio = new AudioContext();
      } catch {}
    }
    this.audio?.resume().catch(() => {});
    this.seed = Date.now() >>> 0;
    this.uid = 0;
    this.player = this.unit(0, 0, 100, 0);
    this.robots = [];
    this.enemies = [];
    this.bullets = [];
    this.xpDrops = [];
    this.particles = [];
    this.time = 0;
    this.xp = 0;
    this.nextXp = 7;
    this.level = 1;
    this.kills = 0;
    this.wave = 1;
    this.damage = 16;
    this.fire = 0.65;
    this.speed = 79;
    this.magnet = 66;
    this.convert = 0;
    this.repairs = 0;
    this.explosive = false;
    this.shot = 0;
    this.peak = 1;
    this.invuln = 0;
    this.spawn = 0.2;
    this.choices = [];
    this.camera = { x: 0, y: 0 };
    this.keys.clear();
    this.stick = { x: 0, y: 0 };
    this.mode = 'playing';
    this.publish();
    this.sound(220, 0.13, 'sine');
  }
  pause() {
    if (this.mode === 'playing') this.mode = 'paused';
    else if (this.mode === 'paused') this.mode = 'playing';
    this.keys.clear();
    this.stick = { x: 0, y: 0 };
    this.publish();
  }
  publish() {
    this.emit({
      mode: this.mode,
      hp: Math.max(0, this.player.hp),
      maxHp: this.player.max,
      xp: this.xp,
      nextXp: this.nextXp,
      level: this.level,
      count: this.mode === 'dead' ? this.peak : this.robots.length + 1,
      kills: this.kills,
      time: this.time,
      wave: this.wave,
      choices: [...this.choices],
    });
  }
  addRobots(n: number) {
    for (let i = 0; i < n && this.robots.length < 99; i++) {
      const a = this.random() * Math.PI * 2;
      this.robots.push(
        this.unit(
          this.player.x + Math.cos(a) * 18,
          this.player.y + Math.sin(a) * 18,
          45,
          0,
        ),
      );
    }
    this.peak = Math.max(this.peak, this.robots.length + 1);
  }
  choose(id: string) {
    if (this.mode !== 'upgrade' || !this.choices.includes(id)) return;
    switch (id) {
      case 'robot':
        this.addRobots(1);
        break;
      case 'trio':
        this.addRobots(3);
        break;
      case 'fire':
        this.fire = Math.max(0.12, this.fire * 0.78);
        break;
      case 'damage':
        this.damage *= 1.3;
        break;
      case 'health':
        this.player.max += 30;
        this.player.hp = Math.min(this.player.max, this.player.hp + 30);
        break;
      case 'convert':
        this.convert = Math.min(0.3, this.convert + 0.06);
        break;
      case 'repair':
        this.player.hp = Math.min(this.player.max, this.player.hp + 40);
        this.repairs++;
        this.addRobots(1);
        break;
      case 'explode':
        this.explosive = true;
        break;
      case 'speed':
        this.speed = Math.min(150, this.speed * 1.15);
        this.magnet *= 1.2;
        break;
    }
    this.choices = [];
    this.mode = 'playing';
    this.sound(660, 0.12, 'sine');
    this.checkLevel();
    this.publish();
  }
  checkLevel() {
    if (this.xp < this.nextXp) return;
    this.xp -= this.nextXp;
    this.level++;
    this.nextXp = Math.floor(7 + this.level * 3.7);
    let pool = Object.keys(upgrades).filter(
      (k) =>
        !(k === 'explode' && this.explosive) &&
        !(k === 'convert' && this.convert >= 0.3),
    );
    this.choices = [this.level < 4 ? 'robot' : 'trio'];
    pool = pool.filter((k) => !this.choices.includes(k));
    for (let i = 0; i < 2; i++) {
      const j = Math.floor(this.random() * pool.length);
      this.choices.push(pool.splice(j, 1)[0]);
    }
    this.keys.clear();
    this.stick = { x: 0, y: 0 };
    this.mode = 'upgrade';
    this.publish();
    this.sound(880, 0.18, 'sine');
  }
  makeMap() {
    this.props = [];
    for (const x of [-310, 190])
      for (const y of [-310, 190]) {
        this.props.push({
          x,
          y,
          w: 122,
          d: 95,
          h: 46,
          type: 'house',
          color: x === y ? '#dcba85' : '#c8d7c0',
        });
        for (let i = 0; i < 7; i++) {
          this.props.push({
            x: x - 30 + i * 25,
            y: y + 132,
            w: 20,
            d: 3,
            h: 12,
            type: 'fence',
            color: '#e0ddad',
          });
        }
        this.props.push({
          x: x + 146,
          y: y - 20,
          w: 19,
          d: 19,
          h: 45,
          type: 'tree',
          color: '#41795b',
        });
        this.props.push({
          x: x - 40,
          y: y + 40,
          w: 19,
          d: 19,
          h: 40,
          type: 'tree',
          color: '#477f58',
        });
        this.props.push({
          x: x + 12,
          y: y + 112,
          w: 9,
          d: 9,
          h: 13,
          type: 'bin',
          color: '#548679',
        });
      }
    for (const [x, y, c] of [
      [-42, -230, '#d39371'],
      [35, 210, '#9fc2c4'],
      [225, -45, '#e8c876'],
      [-205, 36, '#d5debe'],
    ] as [number, number, string][])
      this.props.push({ x, y, w: 21, d: 39, h: 15, type: 'car', color: c });
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      this.props.push({
        x: Math.cos(a) * 435,
        y: Math.sin(a) * 435,
        w: 18,
        d: 18,
        h: 35 + (i % 3) * 7,
        type: 'tree',
        color: i % 2 ? '#3a7052' : '#54865c',
      });
    }
  }
  blocked(x: number, y: number) {
    return this.props.some(
      (p) =>
        (p.type === 'house' || p.type === 'car') &&
        x > p.x - 7 &&
        x < p.x + p.w + 7 &&
        y > p.y - 7 &&
        y < p.y + p.d + 7,
    );
  }
  move(u: V, dx: number, dy: number) {
    const x = clamp(u.x + dx, -465, 465),
      y = clamp(u.y + dy, -465, 465);
    if (!this.blocked(x, u.y)) u.x = x;
    if (!this.blocked(u.x, y)) u.y = y;
  }
  sound(freq: number, duration: number, type: OscillatorType = 'square') {
    if (this.muted || !this.audio || this.audio.state !== 'running') return;
    const now = this.audio.currentTime;
    if (now - this.lastSound < 0.045) return;
    this.lastSound = now;
    const o = this.audio.createOscillator(),
      g = this.audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    o.frequency.exponentialRampToValueAtTime(freq * 0.55, now + duration);
    g.gain.setValueAtTime(0.025, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    o.connect(g);
    g.connect(this.audio.destination);
    o.start();
    o.stop(now + duration);
  }
  burst(x: number, y: number, color: string, n = 7) {
    for (let i = 0; i < n; i++) {
      const a = this.random() * 6.28,
        v = 10 + this.random() * 45,
        life = 0.2 + this.random() * 0.3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life,
        max: life,
        color,
        size: 1 + this.random() * 2,
      });
    }
    if (this.particles.length > 700)
      this.particles.splice(0, this.particles.length - 700);
  }
  spawnEnemy() {
    if (this.enemies.length >= 190) return;
    let x = 0,
      y = 0;
    for (let i = 0; i < 25; i++) {
      const a = this.random() * 6.28,
        r = 210 + this.random() * 85;
      x = clamp(this.player.x + Math.cos(a) * r, -450, 450);
      y = clamp(this.player.y + Math.sin(a) * r, -450, 450);
      if (!this.blocked(x, y) && dist(this.player, { x, y }) > 150) break;
    }
    if (this.blocked(x, y)) return;
    const r = this.random(),
      type =
        this.time > 110 && r < 0.15 ? 2 : this.time > 45 && r < 0.38 ? 1 : 0;
    const hp =
      (type === 2 ? 100 : type === 1 ? 18 : 26) * (1 + this.time / 260);
    this.enemies.push(this.unit(x, y, hp, type));
  }
  kill(e: Unit) {
    if (e.hp === -999) return;
    e.hp = -999;
    this.kills++;
    this.xpDrops.push({ x: e.x, y: e.y, value: e.type === 2 ? 5 : 1 });
    this.burst(e.x, e.y, '#edc785');
    if (this.random() < this.convert) {
      this.addRobots(1);
      this.burst(e.x, e.y, '#bbff9a', 12);
    }
    if (this.xpDrops.length > 450) {
      const p = this.xpDrops.shift()!;
      const q = this.xpDrops[0];
      q.value += p.value;
    }
  }
  blast(x: number, y: number, damage: number) {
    this.burst(x, y, '#ffe3a0', 22);
    for (const e of this.enemies)
      if (e.hp > 0 && dist(e, { x, y }) < 45) {
        e.hp -= damage;
        e.hit = 0.12;
        if (e.hp <= 0) this.kill(e);
      }
  }
  update(dt: number) {
    if (this.mode !== 'playing') return;
    this.time += dt;
    this.wave = 1 + Math.floor(this.time / 30);
    this.invuln = Math.max(0, this.invuln - dt);
    let sx =
        this.stick.x +
        (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) -
        (this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0),
      sy =
        this.stick.y +
        (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0) -
        (this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0);
    const len = Math.hypot(sx, sy);
    if (len > 1) {
      sx /= len;
      sy /= len;
    }
    this.move(
      this.player,
      (sx + sy) * this.speed * dt,
      (sy - sx) * this.speed * dt,
    );
    this.player.hp = Math.min(
      this.player.max,
      this.player.hp + (this.repairs * dt) / 3,
    );
    this.spawn -= dt;
    while (this.spawn <= 0) {
      const rate = Math.max(0.085, 1.45 / (1 + this.time / 45));
      this.spawn += rate;
      const count = 1 + Math.floor(this.time / 120);
      for (let i = 0; i < count; i++) this.spawnEnemy();
    }
    const army = [this.player, ...this.robots];
    for (let i = 0; i < army.length; i++) {
      const r = army[i];
      r.hit = Math.max(0, r.hit - dt);
      r.cd -= dt;
      if (i > 0) {
        const a = i * 2.39996 + Math.sin(this.time * 0.5 + i) * 0.15,
          rad = 17 + Math.sqrt(i) * 8;
        const target = {
            x: this.player.x + Math.cos(a) * rad,
            y: this.player.y + Math.sin(a) * rad,
          },
          d = dist(r, target);
        if (d > 4) {
          this.move(
            r,
            ((target.x - r.x) / d) * Math.min(d * 3, this.speed * 1.7) * dt,
            ((target.y - r.y) / d) * Math.min(d * 3, this.speed * 1.7) * dt,
          );
        }
        if (dist(r, this.player) > 240) {
          r.x = this.player.x;
          r.y = this.player.y;
        }
        if (d > 45 && this.blocked(target.x, target.y)) {
          this.move(
            r,
            (this.player.x - r.x) * dt * 2,
            (this.player.y - r.y) * dt * 2,
          );
        }
      }
      if (r.cd <= 0) {
        let target: Unit | undefined,
          best = 155;
        for (const e of this.enemies) {
          const d = dist(r, e);
          if (e.hp > 0 && d < best) {
            best = d;
            target = e;
          }
        }
        if (target) {
          const d = Math.max(1, dist(r, target));
          this.bullets.push({
            x: r.x,
            y: r.y,
            vx: ((target.x - r.x) / d) * 290,
            vy: ((target.y - r.y) / d) * 290,
            life: 0.65,
            damage: this.damage,
            enemy: false,
          });
          r.cd = this.fire * (i === 0 ? 1 : 1.1);
          this.sound(320, 0.045);
        } else r.cd = 0.1;
      }
    }
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      e.hit = Math.max(0, e.hit - dt);
      e.cd -= dt;
      const d = Math.max(1, dist(e, this.player));
      const speed =
        (e.type === 1 ? 55 : e.type === 2 ? 23 : 27) *
        (1 + Math.min(0.7, this.time / 600));
      this.move(
        e,
        ((this.player.x - e.x) / d) * speed * dt,
        ((this.player.y - e.y) / d) * speed * dt,
      );
      if (d < 15 && this.invuln <= 0) {
        this.player.hp -= e.type === 2 ? 16 : 7;
        this.player.hit = 0.2;
        this.invuln = 0.65;
        this.burst(this.player.x, this.player.y, '#fc9b87');
        this.sound(90, 0.1, 'sawtooth');
      }
      if (e.cd <= 0) {
        const r = this.robots.find((r) => dist(r, e) < 13);
        if (r) {
          r.hp -= e.type === 2 ? 20 : 9;
          r.hit = 0.2;
          e.cd = 0.8;
        }
      }
    }
    for (const r of this.robots)
      if (r.hp <= 0) {
        this.burst(r.x, r.y, '#91d9c2');
        if (this.explosive) this.blast(r.x, r.y, this.damage * 4);
      }
    this.robots = this.robots.filter((r) => r.hp > 0);
    for (const b of this.bullets) {
      const old = { x: b.x, y: b.y };
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      for (const e of this.enemies) {
        if (e.hp <= 0) continue;
        const dx = b.x - old.x,
          dy = b.y - old.y,
          t = clamp(
            ((e.x - old.x) * dx + (e.y - old.y) * dy) /
              (dx * dx + dy * dy || 1),
            0,
            1,
          );
        if (
          Math.hypot(e.x - old.x - dx * t, e.y - old.y - dy * t) <
          (e.type === 2 ? 12 : 8)
        ) {
          e.hp -= b.damage;
          e.hit = 0.12;
          b.life = 0;
          this.burst(e.x, e.y, '#c8ffb2', 3);
          if (e.hp <= 0) this.kill(e);
          this.shot++;
          if (this.explosive && this.shot % 8 === 0)
            this.blast(e.x, e.y, this.damage * 1.5);
          break;
        }
      }
    }
    this.bullets = this.bullets.filter((b) => b.life > 0);
    this.enemies = this.enemies.filter((e) => e.hp > 0);
    for (const p of this.xpDrops) {
      const d = dist(p, this.player);
      if (d < this.magnet) {
        const n = Math.max(d, 1);
        p.x += ((this.player.x - p.x) / n) * 180 * dt;
        p.y += ((this.player.y - p.y) / n) * 180 * dt;
      }
      if (d < 12) {
        this.xp += p.value;
        p.value = 0;
        this.sound(1000, 0.035, 'sine');
      }
    }
    this.xpDrops = this.xpDrops.filter((p) => p.value > 0);
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.mode = 'dead';
      this.publish();
      this.sound(65, 0.4, 'sawtooth');
      return;
    }
    this.checkLevel();
  }
  project(x: number, y: number, z = 0) {
    return {
      x: Math.round(
        this.w / 2 + (x - y - this.camera.x + this.camera.y) * 0.68 * this.zoom,
      ),
      y: Math.round(
        this.h / 2 +
          28 +
          (x + y - this.camera.x - this.camera.y) * 0.36 * this.zoom -
          z * this.zoom,
      ),
    };
  }
  poly(points: number[][], color: string) {
    const c = this.ctx;
    c.fillStyle = color;
    c.beginPath();
    points.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.closePath();
    c.fill();
  }
  ground(x: number, y: number, w: number, d: number, color: string, z = 0) {
    const a = this.project(x, y, z),
      b = this.project(x + w, y, z),
      c = this.project(x + w, y + d, z),
      e = this.project(x, y + d, z);
    this.poly(
      [
        [a.x, a.y],
        [b.x, b.y],
        [c.x, c.y],
        [e.x, e.y],
      ],
      color,
    );
  }
  box(
    x: number,
    y: number,
    w: number,
    d: number,
    h: number,
    top: string,
    left: string,
    right: string,
    z = 0,
  ) {
    const a = this.project(x, y, z),
      b = this.project(x + w, y, z),
      c = this.project(x + w, y + d, z),
      e = this.project(x, y + d, z),
      t = h * this.zoom;
    this.poly(
      [
        [e.x, e.y],
        [c.x, c.y],
        [c.x, c.y - t],
        [e.x, e.y - t],
      ],
      left,
    );
    this.poly(
      [
        [b.x, b.y],
        [c.x, c.y],
        [c.x, c.y - t],
        [b.x, b.y - t],
      ],
      right,
    );
    this.poly(
      [
        [a.x, a.y - t],
        [b.x, b.y - t],
        [c.x, c.y - t],
        [e.x, e.y - t],
      ],
      top,
    );
  }
  drawProp(p: Prop) {
    const c = this.ctx;
    this.ground(p.x + 9, p.y + 9, p.w + 8, p.d + 8, '#355e4a40');
    if (p.type === 'house') {
      this.box(p.x, p.y, p.w, p.d, p.h, p.color, p.color, '#a19e80');
      this.box(
        p.x - 7,
        p.y - 7,
        p.w + 14,
        p.d + 14,
        7,
        '#506e72',
        '#39565e',
        '#344c56',
        p.h,
      );
      this.box(
        p.x + 6,
        p.y + 6,
        p.w - 12,
        p.d - 12,
        7,
        '#648185',
        '#486c72',
        '#38565f',
        p.h + 7,
      );
      this.box(
        p.x + 15,
        p.y + 12,
        13,
        15,
        19,
        '#c2b097',
        '#aa9680',
        '#8c7a6e',
        p.h + 13,
      );
      for (let k = 0; k < 3; k++) {
        this.box(
          p.x + 14 + k * 32,
          p.y + p.d + 1,
          14,
          1,
          14,
          '#b5e1d8',
          '#628d95',
          '#456770',
          16,
        );
      }
      this.box(
        p.x + p.w,
        p.y + 26,
        1,
        22,
        25,
        '#aab99e',
        '#537177',
        '#54777b',
        0,
      );
      this.ground(p.x + p.w, p.y + 24, 45, 28, '#b9bd9d');
    } else if (p.type === 'tree') {
      this.box(p.x + 7, p.y + 7, 5, 5, 20, '#887b51', '#756b49', '#5e5b41');
      this.box(p.x - 3, p.y - 3, 24, 24, 18, p.color, '#356847', '#2e6149', 18);
      this.box(
        p.x + 1,
        p.y + 1,
        17,
        17,
        12,
        '#69965c',
        '#4e8250',
        '#3f744e',
        33,
      );
      this.box(p.x + 5, p.y + 5, 9, 9, 6, '#87a96b', '#668f55', '#588050', 45);
    } else if (p.type === 'fence') {
      this.box(p.x, p.y, p.w, 2, 3, '#e4dfb0', '#b6bd96', '#98a783', 6);
      for (const dx of [0, 12])
        this.box(p.x + dx, p.y, 3, 3, 13, '#eee7b6', '#c7cba1', '#a8b891');
    } else if (p.type === 'car') {
      this.box(p.x, p.y, p.w, p.d, 8, p.color, '#a8b2a0', '#748980', 4);
      this.box(
        p.x + 2,
        p.y + 9,
        p.w - 4,
        20,
        7,
        '#bdd8cf',
        '#537784',
        '#426574',
        12,
      );
      this.box(
        p.x + 2,
        p.y + 14,
        p.w - 4,
        9,
        2,
        p.color,
        p.color,
        '#7b9288',
        19,
      );
      for (const dy of [6, 30])
        this.box(p.x - 2, p.y + dy, 4, 7, 5, '#32464a', '#253b40', '#21373c');
      this.box(p.x + 2, p.y - 1, 5, 2, 3, '#ffeeac', '#ffeb9c', '#d7cb87', 7);
    } else {
      this.box(p.x, p.y, 9, 9, 13, '#7da48d', '#4b7d73', '#3d695e');
      this.box(
        p.x - 1,
        p.y - 1,
        11,
        11,
        2,
        '#a1ba9a',
        '#628e78',
        '#558573',
        13,
      );
    }
  }
  sprite(u: Unit, robot: boolean, leader = false) {
    const p = this.project(u.x, u.y),
      c = this.ctx,
      z = this.zoom;
    const rect = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
    ) => {
      c.fillStyle = color;
      c.fillRect(
        Math.round(p.x + x * z),
        Math.round(p.y + y * z),
        Math.max(1, Math.round(w * z)),
        Math.max(1, Math.round(h * z)),
      );
    };
    const walk = Math.sin(this.time * 12 + u.id) * 1.5;
    c.fillStyle = '#203b4260';
    c.beginPath();
    c.ellipse(p.x, p.y + 1, 7 * z, 3 * z, 0, 0, Math.PI * 2);
    c.fill();
    if (robot) {
      if (leader) {
        c.strokeStyle = '#d4ff96';
        c.lineWidth = 1;
        c.beginPath();
        c.ellipse(p.x, p.y + 1, 12 * z, 6 * z, 0, 0, Math.PI * 2);
        c.stroke();
      }
      rect(-5, -4 + walk, 3, 5, '#263d48');
      rect(2, -4 - walk, 3, 5, '#263d48');
      rect(-7, -15, 14, 12, '#233f48');
      rect(
        -6,
        -15,
        11,
        10,
        u.hit > 0 ? '#fff5c4' : leader ? '#d9edb3' : '#a3d9c1',
      );
      rect(5, -13, 2, 8, '#67a69b');
      rect(-4, -12, 8, 4, '#204b57');
      rect(-3, -11, 2, 2, '#a5f5e6');
      rect(1, -11, 2, 2, '#a5f5e6');
      rect(-1, -19, 1, 4, '#234954');
      rect(-2, -20, 3, 2, leader ? '#f8dd87' : '#b4e9b9');
      rect(-9, -9, 3, 5, '#72b4a6');
      rect(6, -8, 5, 3, '#244452');
      rect(9, -8, 2, 2, '#c7fff0');
      if (leader) {
        rect(-2, -28, 5, 2, '#e9ffa8');
        rect(-1, -26, 3, 2, '#e9ffa8');
      }
    } else {
      const big = u.type === 2 ? 2 : 0;
      rect(-4, -4 + walk, 3, 5, '#354755');
      rect(2, -4 - walk, 3, 5, '#354755');
      rect(
        -5 - big,
        -12,
        10 + big * 2,
        9,
        u.hit > 0
          ? '#fff4c4'
          : u.type === 2
            ? '#454d68'
            : u.type === 1
              ? '#e5b975'
              : ['#d38772', '#9da3c0', '#caac79'][u.id % 3],
      );
      rect(-4, -19, 8, 8, '#e6c29a');
      rect(-4, -20, 8, 3, u.type === 2 ? '#384455' : '#6d6250');
      rect(2, -16, 1, 1, '#37424a');
      rect(-7 - big, -11, 2, 7, '#d9b391');
      rect(5 + big, -11, 2, 7, '#d9b391');
    }
    if (u.hp < u.max) {
      rect(-7, -24, 14, 2, '#243e42');
      rect(
        -7,
        -24,
        14 * Math.max(0, u.hp / u.max),
        2,
        robot ? '#bef690' : '#f3a18b',
      );
    }
  }
  render() {
    const c = this.ctx;
    c.fillStyle = '#567e64';
    c.fillRect(0, 0, this.w, this.h);
    this.camera.x += (this.player.x - this.camera.x) * 0.1;
    this.camera.y += (this.player.y - this.camera.y) * 0.1;
    this.ground(-500, -500, 1000, 1000, '#75966b');
    for (let x = -480; x < 500; x += 40)
      for (let y = -480; y < 500; y += 40) {
        const n = Math.abs((x * 17 + y * 37) % 11);
        this.ground(
          x,
          y,
          40,
          40,
          n < 4 ? '#7e9e6d' : n < 7 ? '#789a68' : '#739567',
        );
        if (n % 3 === 0) this.ground(x + 12, y + 8, 2, 5, '#9fb47b');
      }
    this.ground(-65, -500, 130, 1000, '#c0c3a2');
    this.ground(-500, -65, 1000, 130, '#c0c3a2');
    this.ground(-50, -500, 100, 1000, '#75868a');
    this.ground(-500, -50, 1000, 100, '#75868a');
    this.ground(-48, -500, 3, 1000, '#88999a');
    this.ground(-500, -48, 1000, 3, '#88999a');
    for (let i = -470; i < 500; i += 44) {
      if (Math.abs(i) > 75) {
        this.ground(-1, i, 2, 20, '#c5c9ae');
        this.ground(i, -1, 20, 2, '#c5c9ae');
      }
    }
    for (let i = 0; i < 5; i++) {
      this.ground(-43 + i * 18, -77, 10, 20, '#e3dec0');
      this.ground(60, -43 + i * 18, 20, 10, '#e3dec0');
    }
    for (const p of this.xpDrops) {
      const v = this.project(p.x, p.y, 3 + Math.sin(this.time * 4 + p.x) * 1.5);
      c.fillStyle = '#437e7844';
      c.fillRect(v.x - 5, v.y - 3, 10, 6);
      this.poly(
        [
          [v.x, v.y - 3],
          [v.x + 4, v.y],
          [v.x, v.y + 3],
          [v.x - 4, v.y],
        ],
        '#bbffcf',
      );
      c.fillStyle = '#f0ffbb';
      c.fillRect(v.x - 1, v.y - 1, 2, 2);
    }
    const items = [
      ...this.props.map((p) => ({
        depth: p.x + p.y + p.w / 2 + p.d / 2,
        draw: () => {
          const a = this.project(p.x + p.w / 2, p.y + p.d / 2);
          c.globalAlpha =
            dist(p, this.player) < 150 &&
            a.y > this.project(this.player.x, this.player.y).y
              ? 0.63
              : 1;
          this.drawProp(p);
          c.globalAlpha = 1;
        },
      })),
      ...this.enemies.map((u) => ({
        depth: u.x + u.y,
        draw: () => this.sprite(u, false),
      })),
      ...this.robots.map((u) => ({
        depth: u.x + u.y,
        draw: () => this.sprite(u, true),
      })),
      {
        depth: this.player.x + this.player.y,
        draw: () => this.sprite(this.player, true, true),
      },
    ];
    items.sort((a, b) => a.depth - b.depth);
    items.forEach((o) => o.draw());
    for (const b of this.bullets) {
      const p = this.project(b.x, b.y, 8),
        q = this.project(b.x - b.vx * 0.025, b.y - b.vy * 0.025, 8);
      c.strokeStyle = '#edffc1';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(q.x, q.y);
      c.lineTo(p.x, p.y);
      c.stroke();
      c.fillStyle = '#fff9dc';
      c.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    for (const v of this.particles) {
      const p = this.project(v.x, v.y, 8);
      c.globalAlpha = v.life / v.max;
      c.fillStyle = v.color;
      c.fillRect(p.x, p.y, v.size, v.size);
    }
    c.globalAlpha = 1;
    if (this.player.hit > 0) {
      c.fillStyle = '#ff797c18';
      c.fillRect(0, 0, this.w, this.h);
    }
    const vignette = c.createRadialGradient(
      this.w / 2,
      this.h / 2,
      this.h * 0.2,
      this.w / 2,
      this.h / 2,
      this.w * 0.7,
    );
    vignette.addColorStop(0, '#17352c00');
    vignette.addColorStop(1, '#163b3544');
    c.fillStyle = vignette;
    c.fillRect(0, 0, this.w, this.h);
  }
  frame = (now: number) => {
    if (this.destroyed) return;
    const dt = Math.min(0.033, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.update(dt);
    this.render();
    this.ui += dt;
    if (this.ui > 0.1) {
      this.publish();
      this.ui = 0;
    }
    this.raf = requestAnimationFrame(this.frame);
  };
  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
    window.removeEventListener('blur', this.blur);
    document.removeEventListener('visibilitychange', this.visibility);
    this.audio?.close();
  }
}
