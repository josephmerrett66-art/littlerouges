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
  sector: string;
};
type V = { x: number; y: number };
export const robotClasses = {
  scout: { name: 'Scout', color: '#f7d875', speed: 1.35, damage: 0.7, rate: 0.7, range: 0.9, health: 0, space: 65, icon: '»', description: 'Fast skirmisher. Darts around humans with rapid light bolts.' },
  gunner: { name: 'Gunner', color: '#96ddbd', speed: 1, damage: 1, rate: 1.1, range: 1, health: 0, space: 75, icon: 'Ⅱ', description: 'Twin-barrel fighter. Fires two bolts per volley.' },
  sniper: { name: 'Sniper', color: '#cea5fa', speed: 0.9, damage: 3, rate: 2.3, range: 1.65, health: 0, space: 125, icon: '↠', description: 'Keeps its distance. Heavy long-range shots pierce two humans.' },
  bomber: { name: 'Bomber', color: '#ffad78', speed: 0.9, damage: 1.3, rate: 2, range: 1, health: 20, space: 85, icon: '✳', description: 'Armoured artillery. Every shell explodes in a small area.' },
  medic: { name: 'Medic', color: '#ff9fbb', speed: 1.1, damage: 0.45, rate: 1.4, range: 0.9, health: 0, space: 100, icon: '✚', description: 'Heals a wounded ally within 115 units for 4 HP every 3 seconds.' },
  frost: { name: 'Frost', color: '#8edfff', speed: 1, damage: 0.65, rate: 1.2, range: 1.1, health: 0, space: 90, icon: '❄', description: 'Crowd control. Chilling bolts slow humans for 2 seconds.' },
} as const;
export type RobotClass = keyof typeof robotClasses;
type Unit = V & {
  hp: number;
  max: number;
  cd: number;
  hit: number;
  type: number;
  id: number;
  slow?: number;
  robotClass?: RobotClass;
  supportCd?: number;
};
type Bullet = V & {
  vx: number;
  vy: number;
  life: number;
  damage: number;
  enemy: boolean;
  hits: number[];
  pierce: number;
  frost: boolean;
  splash?: boolean;
  color?: string;
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
  variant?: number;
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
      'Repair 40 core health. Add a Medic that heals wounded nearby allies.',
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
  multishot: {
    name: 'Forked Process',
    tag: 'CORE WEAPON',
    icon: '⋔',
    description:
      'Your lead robot fires two extra bolts in a spread. Side bolts deal 65% damage.',
  },
  pierce: {
    name: 'Railgun Rounds',
    tag: 'PROJECTILES',
    icon: '↠',
    description:
      'Every robot’s bolts pierce one additional human. Stack up to 3 times.',
  },
  frost: {
    name: 'Cold Boot',
    tag: 'CROWD CONTROL',
    icon: '❄',
    description:
      'All bolts slow humans by 45% for 2 seconds. Keep the crowd at arm’s length.',
  },
  chain: {
    name: 'Static Discharge',
    tag: 'CHAIN LIGHTNING',
    icon: 'ϟ',
    description:
      'Every fourth hit arcs to up to 3 nearby humans for 60% laser damage.',
  },
  emp: {
    name: 'Please Reboot',
    tag: 'EMP PULSE',
    icon: '◎',
    description:
      'Every 7 seconds, emit a pulse that damages and slows nearby humans.',
  },
  shield: {
    name: 'Firewall',
    tag: 'DEFENSE',
    icon: '◇',
    description:
      'Block one hit, then recharge after 12 seconds. A blue ring shows when it’s ready.',
  },
  salvage: {
    name: 'Data Hoarder',
    tag: 'EXPERIENCE',
    icon: '▣',
    description: 'Defeated humans have a 35% chance to drop double XP.',
  },
  magnet: {
    name: 'Vacuum Cleaner',
    tag: 'COLLECTION',
    icon: '⊕',
    description:
      'Increase XP attraction range by 50%. Collect all chips already on the map.',
  },
  range: {
    name: 'Long-Distance Wi-Fi',
    tag: 'TARGETING',
    icon: '⌁',
    description:
      'Every robot targets 25% farther away. Bolts travel farther too. Stack twice.',
  },
  armor: {
    name: 'Bubble-Wrap Bots',
    tag: 'SWARM DEFENSE',
    icon: '▤',
    description:
      'All current and future followers gain 25 health. Repair the entire swarm.',
  },
  orbit: {
    name: 'Satellite Friends',
    tag: 'ORBITAL WEAPON',
    icon: '◉',
    description:
      'Two tiny satellites circle your core, damaging humans they touch. Stack 3 times.',
  },
};
for (const [id, role] of Object.entries(robotClasses)) {
  upgrades[`class_${id}`] = { name: `+1 ${role.name}`, tag: 'ROBOT CLASS', icon: role.icon, description: role.description };
}
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
  chunks = new Map<string, Prop[]>();
  mapSeed = 824731;
  readonly chunkSize = 400;
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
  ranks: Record<string, number> = {};
  range = 155;
  botHealth = 45;
  shieldCd = 0;
  pulseCd = 7;
  orbitCd = 0;
  pulseVisual = 0;
  arcs: { a: V; b: V; life: number }[] = [];
  colliders: Prop[] = [];
  collisionGrid = new Map<string, Prop[]>();
  loadedChunkX = Number.NaN;
  loadedChunkY = Number.NaN;
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
    this.mapSeed = this.seed;
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
    this.ranks = {};
    this.range = 155;
    this.botHealth = 45;
    this.shieldCd = 0;
    this.pulseCd = 7;
    this.orbitCd = 0;
    this.pulseVisual = 0;
    this.arcs = [];
    this.explosive = false;
    this.shot = 0;
    this.peak = 1;
    this.invuln = 0;
    this.spawn = 0.2;
    this.choices = [];
    this.camera = { x: 0, y: 0 };
    this.makeMap();
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
      sector: `${Math.floor(this.player.x / this.chunkSize)} · ${Math.floor(this.player.y / this.chunkSize)}`,
      choices: [...this.choices],
    });
  }
  addRobots(n: number, robotClass: RobotClass = 'gunner') {
    for (let i = 0; i < n && this.robots.length < 99; i++) {
      const a = this.random() * Math.PI * 2;
      this.robots.push(
        this.unit(
          this.player.x + Math.cos(a) * 18,
          this.player.y + Math.sin(a) * 18,
          this.botHealth + robotClasses[robotClass].health,
          0,
        ),
      );
      this.robots[this.robots.length - 1].robotClass = robotClass;
      this.robots[this.robots.length - 1].supportCd = 3;
    }
    this.peak = Math.max(this.peak, this.robots.length + 1);
  }
  choose(id: string) {
    if (this.mode !== 'upgrade' || !this.choices.includes(id)) return;
    this.ranks[id] = (this.ranks[id] || 0) + 1;
    if (id.startsWith('class_')) this.addRobots(1, id.slice(6) as RobotClass);
    switch (id) {
      case 'magnet':
        this.magnet *= 1.5;
        this.xp += this.xpDrops.reduce((n, p) => n + p.value, 0);
        this.xpDrops = [];
        break;
      case 'range':
        this.range *= 1.25;
        break;
      case 'armor':
        this.botHealth += 25;
        for (const r of this.robots) {
          r.max += 25;
          r.hp = r.max;
        }
        break;
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
        this.addRobots(1, 'medic');
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
    const caps: Record<string, number> = {
      multishot: 1,
      pierce: 3,
      frost: 1,
      chain: 1,
      emp: 1,
      shield: 1,
      salvage: 1,
      range: 2,
      orbit: 3,
      explode: 1,
    };
    let pool = Object.keys(upgrades).filter(
      (k) =>
        !(caps[k] && (this.ranks[k] || 0) >= caps[k]) &&
        !(k === 'convert' && this.convert >= 0.3) &&
        !((['robot', 'trio'].includes(k) || k.startsWith('class_')) && this.robots.length >= 99) &&
        !(k === 'fire' && this.fire <= 0.12),
    );
    this.choices = [];
    if (this.robots.length < 99)
      this.choices.push(this.level < 4 ? 'robot' : 'trio');
    if (this.robots.length < 99) {
      const classes = Object.keys(robotClasses);
      this.choices.push(`class_${classes[Math.floor(this.random() * classes.length)]}`);
    }
    pool = pool.filter((k) => !this.choices.includes(k));
    while (this.choices.length < 3) {
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
    this.colliders = [];
    this.collisionGrid.clear();
    this.loadedChunkX = Number.NaN;
    this.loadedChunkY = Number.NaN;
    this.chunks.clear();
    this.ensureChunks(true);
  }
  mapHash(x: number, y: number, salt = 0) {
    let n =
      Math.imul(x, 1597334677) ^ Math.imul(y, 3812015801) ^ this.mapSeed ^ salt;
    n = Math.imul(n ^ (n >>> 16), 2246822507);
    n = Math.imul(n ^ (n >>> 13), 3266489909);
    return (n ^ (n >>> 16)) >>> 0;
  }
  generateChunk(cx: number, cy: number) {
    const list: Prop[] = [];
    let state = this.mapHash(cx, cy);
    const rand = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
    const add = (
      type: string,
      x: number,
      y: number,
      w = 10,
      d = 10,
      h = 10,
      color = '#729569',
      variant = 0,
    ) => list.push({ type, x, y, w, d, h, color, variant });
    const ox = cx * this.chunkSize;
    const oy = cy * this.chunkSize;
    const archetype = this.mapHash(cx, cy, 91) % 7;
    const colors = [
      '#e4c499',
      '#c4d5ce',
      '#dcb6a2',
      '#e6d69f',
      '#b9c9ad',
      '#d9c1a7',
    ];
    const makeHome = (x: number, y: number, variant: number) => {
      const w = 100 + Math.floor(rand() * 22);
      const d = 82 + Math.floor(rand() * 17);
      const h = 43 + Math.floor(rand() * 11);
      const color = colors[variant % colors.length];
      add('house', x, y, w, d, h, color, variant);
      for (let j = 0; j < 8; j++) {
        if (j === 4) continue;
        add('fence', x - 25 + j * 22, y + 134, 19, 3, 12, '#e8dfb6');
      }
      add('mailbox', x + w + 26, y + 38, 9, 9, 22, '#839f9a', variant);
      add('bin', x + w + 12, y + 76, 9, 9, 13, '#4d826d');
      add('bin', x + w + 25, y + 79, 9, 9, 13, '#6e92b6');
      add('tree', x - 28, y + 10, 20, 20, 40, '#4e855b', variant);
      add('tree', x + w + 45, y - 8, 20, 20, 44, '#5e8f58', variant + 1);
      add('planter', x + 8, y + d + 5, 24, 9, 5, '#b47d63', variant);
      add('planter', x + 75, y + d + 5, 24, 9, 5, '#b47d63', variant + 1);
      add('porch', x + w, y + 24, 24, 32, 4, '#d5c4a1');
      add('hedge', x - 13, y + 85, 10, 35, 13, '#557e51');
      add('hose', x + w + 6, y + 108, 18, 18, 2, '#548a6d');
    };
    if (archetype !== 3)
      makeHome(
        ox + 82 + rand() * 18,
        oy + 74 + rand() * 18,
        this.mapHash(cx, cy, 7) % 6,
      );
    if (archetype === 0) {
      add('pool', ox + 220, oy + 86, 62, 112, 2, '#68b9bd');
      add('chair', ox + 217, oy + 218, 13, 25, 9, '#eee0b5');
      add('umbrella', ox + 254, oy + 225, 26, 26, 36, '#e5b976');
    } else if (archetype === 1) {
      add('court', ox + 174, oy + 188, 128, 100, 0, '#b17f6d');
      add('hoop', ox + 236, oy + 188, 4, 4, 40, '#e5e0c5');
    } else if (archetype === 2) {
      add('garden', ox + 205, oy + 188, 78, 108, 0, '#785c46');
      add('shed', ox + 235, oy + 302, 43, 32, 26, '#8e9b79');
      add('wheelbarrow', ox + 188, oy + 306, 20, 15, 12, '#b48c63');
    } else if (archetype === 3) {
      add('flowers', ox + 105, oy + 112, 72, 88, 0, '#c98e9e');
      add('birdbath', ox + 202, oy + 155, 15, 15, 21, '#b9c6b7');
      add('bench', ox + 184, oy + 220, 34, 11, 15, '#b5a47b');
      add('pool', ox + 235, oy + 105, 55, 75, 1, '#729fa8');
      for (let i = 0; i < 7; i++)
        add(
          'tree',
          ox + 85 + ((i * 37) % 220),
          oy + 78 + ((i * 71) % 235),
          18,
          18,
          38 + (i % 3) * 6,
          i % 2 ? '#498162' : '#678d57',
          i,
        );
    } else if (archetype === 4) {
      add('flowers', ox + 198, oy + 185, 70, 92, 0, '#e0a2b0');
      add('birdbath', ox + 280, oy + 215, 15, 15, 21, '#b9c6b7');
      add('bench', ox + 190, oy + 296, 34, 11, 15, '#b5a47b');
    } else if (archetype === 5) {
      add('court', ox + 205, oy + 208, 92, 78, 0, '#a98470');
      add('hoop', ox + 248, oy + 208, 4, 4, 40, '#e5e0c5');
    } else {
      add('garden', ox + 212, oy + 205, 66, 87, 0, '#785c46');
      add('bench', ox + 182, oy + 302, 34, 11, 15, '#b5a47b');
    }
    const carColors = ['#d39371', '#9fc2c4', '#e8c876', '#d5debe', '#a4adb9'];
    if (rand() < 0.72)
      add(
        'car',
        ox - 38 + rand() * 16,
        oy + 120 + rand() * 150,
        21,
        39,
        15,
        carColors[Math.floor(rand() * carColors.length)],
      );
    if (rand() < 0.48)
      add(
        'car',
        ox + 120 + rand() * 145,
        oy - 38 + rand() * 16,
        39,
        21,
        15,
        carColors[Math.floor(rand() * carColors.length)],
      );
    add('lamp', ox + 69, oy + 72, 4, 4, 50, '#4a6467');
    add('flowers', ox + 78, oy + 74, 17, 13, 0, '#e5c181');
    add('hydrant', ox + 326, oy + 70, 7, 7, 12, '#c98563');
    add(
      'sign',
      ox + 74,
      oy + 65,
      26,
      3,
      32,
      '#638f83',
      Math.abs(cx + cy * 3) % 6,
    );
    if ((cx + cy) % 3 === 0)
      add('sign', ox - 76, oy - 82, 22, 3, 25, '#bb6a5c', -1);
    for (let i = 0; i < 5; i++)
      add(
        'rock',
        ox + 75 + rand() * 245,
        oy + 72 + rand() * 250,
        7 + rand() * 5,
        6 + rand() * 4,
        5,
        '#9ba68a',
      );
    return list;
  }
  ensureChunks(force = false) {
    const cx = Math.floor(this.player.x / this.chunkSize);
    const cy = Math.floor(this.player.y / this.chunkSize);
    if (!force && cx === this.loadedChunkX && cy === this.loadedChunkY) return;
    this.loadedChunkX = cx;
    this.loadedChunkY = cy;
    let changed = force;
    for (let x = cx - 2; x <= cx + 2; x++)
      for (let y = cy - 2; y <= cy + 2; y++) {
        const key = `${x},${y}`;
        if (!this.chunks.has(key)) {
          this.chunks.set(key, this.generateChunk(x, y));
          changed = true;
        }
      }
    for (const key of [...this.chunks.keys()]) {
      const [x, y] = key.split(',').map(Number);
      if (Math.abs(x - cx) > 2 || Math.abs(y - cy) > 2) {
        this.chunks.delete(key);
        changed = true;
      }
    }
    if (changed) {
      this.props = [...this.chunks.values()].flat();
      this.colliders = this.props.filter(
        (p) => p.type === 'house' || p.type === 'car',
      );
      this.collisionGrid.clear();
      for (const p of this.colliders) {
        const left = Math.floor((p.x - 7) / 100);
        const right = Math.floor((p.x + p.w + 7) / 100);
        const top = Math.floor((p.y - 7) / 100);
        const bottom = Math.floor((p.y + p.d + 7) / 100);
        for (let gx = left; gx <= right; gx++)
          for (let gy = top; gy <= bottom; gy++) {
            const key = `${gx},${gy}`;
            const cell = this.collisionGrid.get(key);
            if (cell) cell.push(p);
            else this.collisionGrid.set(key, [p]);
          }
      }
    }
  }
  blocked(x: number, y: number) {
    const nearby =
      this.collisionGrid.get(`${Math.floor(x / 100)},${Math.floor(y / 100)}`) ||
      [];
    return nearby.some(
      (p) =>
        (p.type === 'house' || p.type === 'car') &&
        x > p.x - 7 &&
        x < p.x + p.w + 7 &&
        y > p.y - 7 &&
        y < p.y + p.d + 7,
    );
  }
  move(u: V, dx: number, dy: number) {
    const x = u.x + dx,
      y = u.y + dy;
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
      x = this.player.x + Math.cos(a) * r;
      y = this.player.y + Math.sin(a) * r;
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
    this.xpDrops.push({
      x: e.x,
      y: e.y,
      value:
        (e.type === 2 ? 5 : 1) *
        (this.ranks.salvage && this.random() < 0.35 ? 2 : 1),
    });
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
  steerRobot(r: Unit, dt: number) {
    const role = robotClasses[r.robotClass || 'gunner'];
    const phase = r.id * 2.39996;
    const angle = phase + this.time * (r.id % 2 ? 0.42 : -0.37);
    const radius = 40 + (r.id % 7) * 10;
    let vx = (this.player.x + Math.cos(angle) * radius - r.x) * 0.65;
    let vy = (this.player.y + Math.sin(angle) * radius - r.y) * 0.65;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const dx = r.x - e.x, dy = r.y - e.y, d = Math.hypot(dx, dy);
      if (d < role.space) {
        const push = (1 - d / role.space) * 210;
        vx += (d > 0.01 ? dx / d : Math.cos(phase)) * push;
        vy += (d > 0.01 ? dy / d : Math.sin(phase)) * push;
      }
    }
    for (const other of this.robots) {
      if (other === r) continue;
      const dx = r.x - other.x, dy = r.y - other.y, d = Math.hypot(dx, dy);
      if (d < 19) {
        vx += (d > 0.01 ? dx / d : Math.cos(phase)) * (19 - d) * 3;
        vy += (d > 0.01 ? dy / d : Math.sin(phase)) * (19 - d) * 3;
      }
    }
    const home = dist(r, this.player);
    if (home > 140) {
      vx += (this.player.x - r.x) * 2;
      vy += (this.player.y - r.y) * 2;
    }
    const length = Math.hypot(vx, vy) || 1;
    const speed = Math.min(length, this.speed * (home > 140 ? 2.3 : 1.25) * role.speed);
    const heading = Math.atan2(vy, vx);
    // Look ahead and try both sides of scenery instead of pressing into walls.
    for (const turn of [0, 0.65, -0.65, 1.3, -1.3, 2, -2, Math.PI]) {
      const a = heading + turn * (r.id % 2 ? 1 : -1);
      const dx = Math.cos(a), dy = Math.sin(a);
      if (!this.blocked(r.x + dx * 15, r.y + dy * 15)) {
        this.move(r, dx * speed * dt, dy * speed * dt);
        break;
      }
    }
    // Recover only followers left far outside the visible play area.
    if (home > 360) {
      r.x = this.player.x;
      r.y = this.player.y;
    }
  }
  update(dt: number) {
    if (this.mode !== 'playing') return;
    this.time += dt;
    this.ensureChunks();
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
    this.shieldCd = Math.max(0, this.shieldCd - dt);
    this.pulseVisual = Math.max(0, this.pulseVisual - dt);
    this.arcs = this.arcs.filter((a) => (a.life -= dt) > 0);
    if (this.ranks.emp && (this.pulseCd -= dt) <= 0) {
      this.pulseCd = 7;
      this.pulseVisual = 0.65;
      this.sound(120, 0.2, 'sine');
      for (const e of this.enemies)
        if (e.hp > 0 && dist(e, this.player) < 110) {
          e.hp -= this.damage * 2;
          e.slow = 3;
          e.hit = 0.2;
          if (e.hp <= 0) this.kill(e);
        }
    }
    if (this.ranks.orbit && (this.orbitCd -= dt) <= 0) {
      this.orbitCd = 0.3;
      for (const p of this.orbitPositions())
        for (const e of this.enemies)
          if (e.hp > 0 && dist(e, p) < 17) {
            e.hp -= this.damage * 0.7;
            e.hit = 0.12;
            this.burst(e.x, e.y, '#d7b2ff', 3);
            if (e.hp <= 0) this.kill(e);
          }
    }
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
      const role = i > 0 ? robotClasses[r.robotClass || 'gunner'] : undefined;
      if (i > 0) {
        this.steerRobot(r, dt);
        if (r.robotClass === 'medic') {
          r.supportCd = (r.supportCd ?? 3) - dt;
          if (r.supportCd <= 0) {
            let patient: Unit | undefined;
            for (const ally of army)
              if (ally.hp > 0 && ally.hp < ally.max && dist(r, ally) < 115 &&
                (!patient || ally.hp / ally.max < patient.hp / patient.max)) patient = ally;
            if (patient) {
              patient.hp = Math.min(patient.max, patient.hp + 4);
              this.burst(patient.x, patient.y, '#ff9fbb', 4);
              r.supportCd = 3;
            } else r.supportCd = 0.2;
          }
        }
      }
      if (r.cd <= 0) {
        let target: Unit | undefined,
          best = this.range * (role?.range ?? 1);
        for (const e of this.enemies) {
          const d = dist(r, e);
          if (e.hp > 0 && d < best) {
            best = d;
            target = e;
          }
        }
        if (target) {
          const angle = Math.atan2(target.y - r.y, target.x - r.x);
          const angles = i === 0 && this.ranks.multishot ? [-0.2, 0, 0.2] : r.robotClass === 'gunner' ? [-0.035, 0.035] : [0];
          for (const offset of angles)
            this.bullets.push({
              x: r.x,
              y: r.y,
              vx: Math.cos(angle + offset) * 290,
              vy: Math.sin(angle + offset) * 290,
              life: (this.range * (role?.range ?? 1) + 35) / 290,
              damage: this.damage * (role?.damage ?? 1) * (offset ? 0.65 : 1),
              enemy: false,
              hits: [],
              pierce: (this.ranks.pierce || 0) + (r.robotClass === 'sniper' ? 2 : 0),
              frost: !!this.ranks.frost || r.robotClass === 'frost',
              splash: r.robotClass === 'bomber',
              color: role?.color,
            });
          r.cd = this.fire * (role?.rate ?? 1);
          this.sound(320, 0.045);
        } else r.cd = 0.1;
      }
    }
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      e.hit = Math.max(0, e.hit - dt);
      e.cd -= dt;
      e.slow = Math.max(0, (e.slow || 0) - dt);
      const d = Math.max(1, dist(e, this.player));
      const speed =
        (e.type === 1 ? 55 : e.type === 2 ? 23 : 27) *
        (1 + Math.min(0.7, this.time / 600)) *
        (e.slow ? 0.55 : 1);
      this.move(
        e,
        ((this.player.x - e.x) / d) * speed * dt,
        ((this.player.y - e.y) / d) * speed * dt,
      );
      if (d < 15 && this.invuln <= 0) {
        if (this.ranks.shield && this.shieldCd <= 0) {
          this.shieldCd = 12;
          this.burst(this.player.x, this.player.y, '#94dfff', 18);
        } else this.player.hp -= e.type === 2 ? 16 : 7;
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
    // Spatial buckets keep piercing volleys affordable with large swarms.
    const grid = new Map<string, Unit[]>();
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const key = `${Math.floor(e.x / 40)},${Math.floor(e.y / 40)}`;
      const cell = grid.get(key);
      if (cell) cell.push(e);
      else grid.set(key, [e]);
    }
    for (const b of this.bullets) {
      const old = { x: b.x, y: b.y };
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      const nearby: Unit[] = [];
      for (
        let gx = Math.floor((Math.min(old.x, b.x) - 12) / 40);
        gx <= Math.floor((Math.max(old.x, b.x) + 12) / 40);
        gx++
      )
        for (
          let gy = Math.floor((Math.min(old.y, b.y) - 12) / 40);
          gy <= Math.floor((Math.max(old.y, b.y) + 12) / 40);
          gy++
        )
          nearby.push(...(grid.get(`${gx},${gy}`) || []));
      for (const e of nearby) {
        if (e.hp <= 0 || b.hits.includes(e.id)) continue;
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
          b.hits.push(e.id);
          if (b.frost) e.slow = 2;
          if (b.pierce <= 0) b.life = 0;
          else b.pierce--;

          this.burst(e.x, e.y, '#c8ffb2', 3);
          if (e.hp <= 0) this.kill(e);
          if (b.splash) this.blast(e.x, e.y, b.damage * 0.8);
          this.shot++;
          if (this.ranks.chain && this.shot % 4 === 0) {
            let from: V = e;
            const visited = new Set([e.id]);
            for (let jump = 0; jump < 3; jump++) {
              const next = this.enemies
                .filter(
                  (n) => n.hp > 0 && !visited.has(n.id) && dist(n, from) < 60,
                )
                .sort((a, b) => dist(a, from) - dist(b, from))[0];
              if (!next) break;
              visited.add(next.id);
              this.arcs.push({
                a: { x: from.x, y: from.y },
                b: { x: next.x, y: next.y },
                life: 0.16,
              });
              next.hp -= this.damage * 0.6;
              next.hit = 0.15;
              if (next.hp <= 0) this.kill(next);
              from = next;
            }
          }
          if (this.explosive && this.shot % 8 === 0)
            this.blast(e.x, e.y, this.damage * 1.5);
          if (b.life <= 0) break;
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
  orbitPositions() {
    const count = (this.ranks.orbit || 0) * 2;
    return Array.from({ length: count }, (_, i) => ({
      x:
        this.player.x +
        Math.cos(this.time * 2.2 + (i / count) * Math.PI * 2) * 43,
      y:
        this.player.y +
        Math.sin(this.time * 2.2 + (i / count) * Math.PI * 2) * 43,
    }));
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
      const v = p.variant || 0;
      const roofs = [
        ['#a2705e', '#875b50'],
        ['#647e8a', '#486373'],
        ['#879268', '#697953'],
        ['#ad8460', '#8b624d'],
      ];
      const roof = roofs[v % 4];
      const a = this.project(p.x - 7, p.y - 7, p.h),
        b = this.project(p.x + p.w + 7, p.y - 7, p.h),
        d = this.project(p.x - 7, p.y + p.d + 7, p.h),
        e = this.project(p.x + p.w + 7, p.y + p.d + 7, p.h),
        r1 = this.project(p.x - 7, p.y + p.d / 2, p.h + 25),
        r2 = this.project(p.x + p.w + 7, p.y + p.d / 2, p.h + 25);
      this.poly(
        [
          [a.x, a.y],
          [b.x, b.y],
          [r2.x, r2.y],
          [r1.x, r1.y],
        ],
        roof[1],
      );
      this.poly(
        [
          [r1.x, r1.y],
          [r2.x, r2.y],
          [e.x, e.y],
          [d.x, d.y],
        ],
        roof[0],
      );
      this.poly(
        [
          [b.x, b.y],
          [e.x, e.y],
          [r2.x, r2.y],
        ],
        p.color,
      );
      // Individual shingle rows and staggered joints on the roof slope.
      for (let row = 1; row < 7; row++) {
        const yy = p.y + p.d / 2 + ((p.d / 2 + 7) * row) / 7,
          zz = p.h + 25 * (1 - row / 7);
        this.worldLine(
          [
            { x: p.x - 6, y: yy, z: zz },
            { x: p.x + p.w + 6, y: yy, z: zz },
          ],
          roof[1],
        );
        for (let col = 0; col < 8; col++) {
          const xx = p.x + col * 17 + (row % 2) * 8;
          this.worldLine(
            [
              { x: xx, y: yy, z: zz },
              { x: xx, y: yy + 5, z: zz - 2 },
            ],
            roof[1],
          );
        }
      }
      this.box(
        p.x + 16,
        p.y + 15,
        12,
        14,
        27,
        '#c9b395',
        '#ab8d76',
        '#8b705f',
        p.h + 8,
      );
      for (let j = 0; j < 3; j++)
        this.ground(p.x + 17, p.y + 16, 10, 2, '#8b705f', p.h + 13 + j * 7);
      // Clapboard siding, foundations, window shutters and a numbered front door.
      for (let j = 6; j < p.h - 4; j += 6)
        this.box(
          p.x,
          p.y + p.d,
          p.w,
          0.8,
          1,
          p.color,
          '#aa9f873b',
          '#aa9f873b',
          j,
        );
      this.box(p.x, p.y + p.d, p.w, 2, 4, '#c4b79c', '#a69e87', '#8b937e');
      for (let k = 0; k < 3; k++) {
        this.box(
          p.x + 10 + k * 32,
          p.y + p.d + 2,
          4,
          1,
          18,
          '#6a8e81',
          '#6a8e81',
          '#567467',
          14,
        );
        this.box(
          p.x + 28 + k * 32,
          p.y + p.d + 2,
          4,
          1,
          18,
          '#6a8e81',
          '#6a8e81',
          '#567467',
          14,
        );
      }
      if (v === 1) {
        for (let k = 0; k < 3; k++)
          this.ground(p.x + 50 + k * 16, p.y + 55, 13, 23, '#3c6279', p.h + 13);
      }
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
      for (let k = 0; k < 3; k++) {
        this.box(
          p.x + 20 + k * 32,
          p.y + p.d + 3,
          2,
          1,
          14,
          '#e1dfbe',
          '#e1dfbe',
          '#e1dfbe',
          16,
        );
        this.box(
          p.x + 14 + k * 32,
          p.y + p.d + 3,
          14,
          1,
          1,
          '#e1dfbe',
          '#e1dfbe',
          '#e1dfbe',
          23,
        );
      }
      this.labelWorld(
        String(12 + (p.variant || 0) * 6),
        p.x + p.w + 2,
        p.y + 35,
        30,
        '#f3e7c5',
        6,
      );
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
      for (let j = 0; j < 7; j++) {
        const xx = p.x - 3 + ((j * 7) % 25),
          yy = p.y - 3 + ((j * 11) % 24);
        this.box(
          xx,
          yy,
          5,
          5,
          4,
          j % 2 ? '#739857' : p.color,
          '#52804d',
          '#427348',
          26 + (j % 3) * 6,
        );
      }
      if ((p.variant || 0) % 4 === 2)
        for (let j = 0; j < 5; j++)
          this.box(
            p.x + ((j * 7) % 19),
            p.y + ((j * 11) % 20),
            3,
            3,
            3,
            '#e4a07e',
            '#c88161',
            '#a96954',
            29,
          );
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
    } else if (p.type !== 'bin') {
      this.drawDetail(p);
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
  worldLine(
    points: { x: number; y: number; z?: number }[],
    color: string,
    width = 1,
  ) {
    const c = this.ctx;
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    points.forEach((p, i) => {
      const v = this.project(p.x, p.y, p.z || 0);
      if (i) c.lineTo(v.x, v.y);
      else c.moveTo(v.x, v.y);
    });
    c.stroke();
  }
  labelWorld(
    text: string,
    x: number,
    y: number,
    z = 0,
    color = '#e3dfc2',
    size = 7,
  ) {
    const p = this.project(x, y, z);
    this.ctx.fillStyle = color;
    this.ctx.font = `bold ${size}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, p.x, p.y);
  }
  drawDetail(p: Prop) {
    const { x, y, w, d, color } = p;
    const box = (
      dx: number,
      dy: number,
      bw: number,
      bd: number,
      h: number,
      t: string = color,
      z = 0,
    ) => this.box(x + dx, y + dy, bw, bd, h, t, t, '#536557', z);
    switch (p.type) {
      case 'pool':
        this.ground(x - 7, y - 7, w + 14, d + 14, '#ddd2ab');
        this.ground(x, y, w, d, '#488c9c');
        this.ground(x + 3, y + 3, w - 6, d - 6, '#73c1c4');
        for (let i = 0; i < 8; i++)
          this.ground(
            x + 8 + (i % 2) * 7,
            y + 8 + i * 10,
            w - 26,
            1,
            '#b1ded2',
          );
        this.worldLine(
          [
            { x: x + w - 9, y: y + d - 10, z: 3 },
            { x: x + w - 9, y: y + d + 6, z: 3 },
            { x: x + w - 9, y: y + d + 6, z: 9 },
          ],
          '#e5e7ce',
        );
        this.worldLine(
          [
            { x: x + w - 17, y: y + d - 10, z: 3 },
            { x: x + w - 17, y: y + d + 6, z: 3 },
            { x: x + w - 17, y: y + d + 6, z: 9 },
          ],
          '#e5e7ce',
        );
        break;
      case 'court':
        this.ground(x - 4, y - 4, w + 8, d + 8, '#d3c39f');
        this.ground(x, y, w, d, '#b47f6a');
        this.ground(x + 6, y + 6, w - 12, d - 12, '#6d9c91');
        this.worldLine(
          [
            { x: x + 8, y: y + 8 },
            { x: x + w - 8, y: y + 8 },
            { x: x + w - 8, y: y + d - 8 },
            { x: x + 8, y: y + d - 8 },
            { x: x + 8, y: y + 8 },
          ],
          '#e2d7b9',
        );
        this.worldLine(
          [
            { x: x + 8, y: y + d / 2 },
            { x: x + w - 8, y: y + d / 2 },
          ],
          '#e2d7b9',
        );
        this.worldLine(
          [
            { x: x + w / 2 - 22, y: y + 8 },
            { x: x + w / 2 - 22, y: y + 33 },
            { x: x + w / 2 + 22, y: y + 33 },
            { x: x + w / 2 + 22, y: y + 8 },
          ],
          '#e2d7b9',
        );
        {
          const q = this.project(x + w / 2, y + d / 2);
          this.ctx.strokeStyle = '#e2d7b9';
          this.ctx.beginPath();
          this.ctx.ellipse(
            q.x,
            q.y,
            13 * this.zoom,
            7 * this.zoom,
            0,
            0,
            Math.PI * 2,
          );
          this.ctx.stroke();
        }
        break;
      case 'hoop':
        box(0, 0, 3, 3, 39, '#536970');
        box(-12, 0, 27, 2, 15, '#e4dfc6', 32);
        box(-4, 2, 10, 2, 7, '#a57968', 35);
        this.worldLine(
          [
            { x: x - 2, y: y + 3, z: 33 },
            { x: x + 9, y: y + 10, z: 33 },
            { x: x + 14, y: y + 4, z: 33 },
          ],
          '#dd9c71',
        );
        break;
      case 'garden':
        this.ground(x - 4, y - 4, w + 8, d + 8, '#c5b792');
        this.ground(x, y, w, d, '#775f48');
        for (let row = 0; row < 5; row++) {
          this.ground(x + 4, y + 5 + row * 18, w - 8, 11, '#655342');
          for (let j = 0; j < 7; j++) {
            box(
              6 + j * 9,
              7 + row * 18,
              5,
              5,
              4,
              row % 2 ? '#a8b269' : '#70965e',
            );
            if (row % 2 === 0)
              box(7 + j * 9, 7 + row * 18, 2, 2, 2, '#d78a63', 4);
          }
        }
        break;
      case 'flowers':
      case 'planter':
        if (p.type === 'planter') box(0, 0, w, d, 5, color);
        for (let j = 0; j < Math.floor((w * d) / 24); j++) {
          const xx = 2 + ((j * 13) % (w - 3)),
            yy = 2 + ((j * 17) % (d - 3));
          box(xx, yy, 2, 2, 5, '#60855c', p.type === 'planter' ? 5 : 0);
          box(
            xx - 1,
            yy - 1,
            4,
            4,
            2,
            ['#efd88d', '#d99bb0', '#e5b9d0', '#f1ddd0'][j % 4],
            p.type === 'planter' ? 10 : 5,
          );
        }
        break;
      case 'mailbox':
        box(3, 3, 3, 3, 18, '#aa9673');
        box(-2, 0, 13, 9, 7, color, 18);
        box(9, 2, 1, 2, 7, '#df9776', 22);
        break;
      case 'lamp':
        box(0, 0, 4, 4, 43, '#4a6467');
        box(-2, -2, 8, 8, 8, '#e9d8a7', 40);
        box(-4, -4, 12, 12, 3, '#405a5a', 48);
        break;
      case 'hydrant':
        box(1, 1, 5, 5, 11, color);
        box(-3, 1, 13, 4, 4, color, 6);
        box(0, 0, 7, 7, 2, '#dfad7a', 12);
        break;
      case 'bench':
        box(2, 2, 3, 7, 9, '#536557');
        box(w - 5, 2, 3, 7, 9, '#536557');
        for (let j = 0; j < 3; j++) box(0, j * 4, w, 3, 2, color, 10);
        box(0, 0, w, 2, 9, color, 12);
        break;
      case 'chair':
        box(0, 0, w, d, 3, color, 4);
        box(0, 0, w, 4, 10, color, 7);
        for (let i = 3; i < d; i += 5) box(1, i, w - 2, 1, 1, '#9aa584', 7);
        break;
      case 'umbrella':
        box(w / 2, d / 2, 2, 2, 29, '#a99675');
        for (let j = 0; j < 4; j++)
          box((j * w) / 4, 0, w / 4, d, 2, j % 2 ? '#ede0b4' : color, 30);
        box(w / 4, d / 4, w / 2, d / 2, 3, '#eee2b9', 32);
        break;
      case 'birdbath':
        box(5, 5, 5, 5, 15, '#adb6a3');
        box(0, 0, 15, 15, 4, '#c6ceb4', 15);
        box(3, 3, 9, 9, 1, '#87bab9', 19);
        break;
      case 'hedge':
        box(0, 0, w, d, 13, color);
        for (let j = 0; j < d; j += 9) box(0, j, w, 6, 3, '#78955b', 13);
        break;
      case 'porch':
        box(0, 0, w, d, 4, color);
        box(w - 4, 0, 8, d, 2, '#bcb496');
        break;
      case 'shed':
        box(0, 0, w, d, 26, color);
        box(-3, -3, w + 6, d + 6, 4, '#768270', 26);
        box(15, d, 15, 1, 20, '#b5af89');
        break;
      case 'wheelbarrow':
        box(3, 1, 16, 12, 5, color, 6);
        box(0, 4, 4, 5, 5, '#3e5152');
        box(17, 1, 10, 2, 2, '#72806a', 7);
        box(17, 11, 10, 2, 2, '#72806a', 7);
        break;
      case 'hose': {
        const q = this.project(x + 9, y + 9);
        this.ctx.strokeStyle = '#487e69';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(
          q.x,
          q.y,
          9 * this.zoom,
          5 * this.zoom,
          0,
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
        break;
      }
      case 'sign': {
        const streetNames = [
          'MAPLE AVE',
          'CIRCUIT ST',
          'PIXEL PL',
          'ROBOT RD',
          'BINARY BLVD',
          'JACARANDA',
        ];
        const stop = p.variant === -1;
        box(11, 0, 3, 3, p.h, '#59726b');
        box(0, -1, w, 2, 10, color, p.h - 3);
        this.labelWorld(
          stop
            ? 'STOP'
            : streetNames[Math.abs(p.variant || 0) % streetNames.length],
          x + w / 2,
          y,
          p.h + 2,
          '#f2e7c9',
          stop ? 5 : 6,
        );
        if (!stop) {
          box(9, -9, 2, 23, 7, '#638f83', p.h - 12);
        }
        break;
      }
      case 'rock':
        box(0, 0, w, d, 4, color);
        box(2, 1, w - 3, d - 2, 2, '#b1b49a', 4);
        break;
    }
  }
  drawGroundDetails(minX: number, minY: number, maxX: number, maxY: number) {
    const firstRoadX = Math.floor(minX / this.chunkSize) * this.chunkSize;
    const firstRoadY = Math.floor(minY / this.chunkSize) * this.chunkSize;
    // Sidewalk seams continue across chunk boundaries so generated blocks join cleanly.
    for (let road = firstRoadX; road <= maxX; road += this.chunkSize) {
      for (let y = Math.floor(minY / 24) * 24; y < maxY; y += 24) {
        this.worldLine(
          [
            { x: road - 65, y },
            { x: road - 51, y },
          ],
          '#a1ad93',
        );
        this.worldLine(
          [
            { x: road + 51, y },
            { x: road + 65, y },
          ],
          '#a1ad93',
        );
      }
      for (let y = Math.floor(minY / 44) * 44; y < maxY; y += 44) {
        const fromIntersection = Math.abs(
          ((y % this.chunkSize) + this.chunkSize) % this.chunkSize,
        );
        if (fromIntersection > 75 && fromIntersection < this.chunkSize - 75)
          this.ground(road - 1, y, 2, 20, '#c5c9ae');
      }
    }
    for (let road = firstRoadY; road <= maxY; road += this.chunkSize) {
      for (let x = Math.floor(minX / 24) * 24; x < maxX; x += 24) {
        this.worldLine(
          [
            { x, y: road - 65 },
            { x, y: road - 51 },
          ],
          '#a1ad93',
        );
        this.worldLine(
          [
            { x, y: road + 51 },
            { x, y: road + 65 },
          ],
          '#a1ad93',
        );
      }
      for (let x = Math.floor(minX / 44) * 44; x < maxX; x += 44) {
        const fromIntersection = Math.abs(
          ((x % this.chunkSize) + this.chunkSize) % this.chunkSize,
        );
        if (fromIntersection > 75 && fromIntersection < this.chunkSize - 75)
          this.ground(x, road - 1, 20, 2, '#c5c9ae');
      }
    }
    // Crosswalks, drains and road wear are derived from intersection coordinates.
    for (let gx = firstRoadX; gx <= maxX; gx += this.chunkSize)
      for (let gy = firstRoadY; gy <= maxY; gy += this.chunkSize) {
        for (let i = 0; i < 5; i++) {
          this.ground(gx - 43 + i * 18, gy - 77, 10, 20, '#e3dec0');
          this.ground(gx + 60, gy - 43 + i * 18, 20, 10, '#e3dec0');
        }
        const flip =
          this.mapHash(gx / this.chunkSize, gy / this.chunkSize, 55) % 2;
        const dx = gx + (flip ? 35 : -45);
        const dy = gy + (flip ? 115 : -125);
        this.ground(dx, dy, 9, 14, '#576f71');
        for (let j = 0; j < 4; j++)
          this.ground(dx + 1, dy + 2 + j * 3, 7, 1, '#a4aaa0');
        if ((gx / this.chunkSize + gy / this.chunkSize) % 2 === 0)
          this.labelWorld('SLOW', gx - 8, gy - 110, 0, '#d9d3b5', 8);
      }
    for (const h of this.props.filter((p) => p.type === 'house')) {
      const pathX = h.x + h.w + 27;
      this.ground(h.x + h.w, h.y + 24, 41, 29, '#c1bea0');
      for (let j = 0; j < 5; j++)
        this.ground(pathX, h.y + 57 + j * 14, 12, 10, '#c4c4a2');
      // Mown lawn stripes remain subtle beneath enemies and XP.
      for (let j = 0; j < 5; j++)
        this.ground(h.x + 7 + j * 24, h.y + h.d + 22, 11, 40, '#88a16c');
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
        u.hit > 0 ? '#fff5c4' : leader ? '#d9edb3' : robotClasses[u.robotClass || 'gunner'].color,
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
      if (!leader) {
        const color = robotClasses[u.robotClass || 'gunner'].color;
        if (u.robotClass === 'medic') {
          rect(-1, -9, 2, 5, '#fff7f6'); rect(-3, -7, 6, 2, '#fff7f6');
        } else if (u.robotClass === 'sniper') {
          rect(7, -9, 10, 2, '#243b4b'); rect(13, -10, 4, 2, color);
        } else if (u.robotClass === 'bomber') {
          rect(-9, -15, 4, 9, color); rect(6, -12, 6, 6, '#38434d');
          rect(7, -11, 4, 3, color);
        } else if (u.robotClass === 'frost') {
          rect(-3, -22, 6, 4, color); rect(-1, -24, 2, 8, '#e5fbff');
        } else if (u.robotClass === 'scout') {
          rect(-8, -4, 5, 3, color); rect(3, -4, 5, 3, color);
          rect(-6, -18, 3, 2, color);
        } else { rect(6, -12, 7, 2, '#243b4b'); }
      }
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
      if (u.slow) rect(-6, -22, 12, 2, '#91deff');
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
    this.ensureChunks();
    const viewRange = 720 / this.zoom;
    const minX = Math.floor((this.camera.x - viewRange) / 40) * 40;
    const minY = Math.floor((this.camera.y - viewRange) / 40) * 40;
    const maxX = this.camera.x + viewRange;
    const maxY = this.camera.y + viewRange;
    this.ground(minX, minY, maxX - minX + 40, maxY - minY + 40, '#75966b');
    for (let x = minX; x < maxX; x += 40)
      for (let y = minY; y < maxY; y += 40) {
        const n = this.mapHash(Math.floor(x / 40), Math.floor(y / 40), 19) % 11;
        this.ground(
          x,
          y,
          40,
          40,
          n < 4 ? '#7e9e6d' : n < 7 ? '#789a68' : '#739567',
        );
        if (n % 3 === 0) this.ground(x + 12, y + 8, 2, 5, '#9fb47b');
      }
    const firstRoadX = Math.floor(minX / this.chunkSize) * this.chunkSize;
    const firstRoadY = Math.floor(minY / this.chunkSize) * this.chunkSize;
    for (let x = firstRoadX; x <= maxX; x += this.chunkSize) {
      this.ground(x - 65, minY, 130, maxY - minY, '#c0c3a2');
      this.ground(x - 50, minY, 100, maxY - minY, '#75868a');
      this.ground(x - 48, minY, 3, maxY - minY, '#88999a');
    }
    for (let y = firstRoadY; y <= maxY; y += this.chunkSize) {
      this.ground(minX, y - 65, maxX - minX, 130, '#c0c3a2');
      this.ground(minX, y - 50, maxX - minX, 100, '#75868a');
      this.ground(minX, y - 48, maxX - minX, 3, '#88999a');
    }
    this.drawGroundDetails(minX, minY, maxX, maxY);
    for (const p of this.props)
      if (['pool', 'court', 'garden', 'flowers'].includes(p.type))
        this.drawDetail(p);
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
      ...this.props
        .filter((p) => !['pool', 'court', 'garden', 'flowers'].includes(p.type))
        .map((p) => ({
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
      c.strokeStyle = b.color || (b.frost ? '#9ae6ff' : b.pierce ? '#efb0fa' : '#edffc1');
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(q.x, q.y);
      c.lineTo(p.x, p.y);
      c.stroke();
      c.fillStyle = '#fff9dc';
      c.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    for (const a of this.arcs) {
      const p = this.project(a.a.x, a.a.y, 10),
        q = this.project(a.b.x, a.b.y, 10);
      c.strokeStyle = '#b5c4ff';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo((p.x + q.x) / 2 + 4, (p.y + q.y) / 2 - 4);
      c.lineTo(q.x, q.y);
      c.stroke();
    }
    if (this.ranks.shield && this.shieldCd <= 0) {
      const p = this.project(this.player.x, this.player.y, 8);
      c.strokeStyle = '#99dfff';
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(p.x, p.y, 14 * this.zoom, 18 * this.zoom, 0, 0, Math.PI * 2);
      c.stroke();
    }
    if (this.pulseVisual > 0) {
      const p = this.project(this.player.x, this.player.y),
        r = (1 - this.pulseVisual / 0.65) * 110;
      c.globalAlpha = this.pulseVisual / 0.65;
      c.strokeStyle = '#9eeeff';
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(
        p.x,
        p.y,
        r * this.zoom,
        r * 0.53 * this.zoom,
        0,
        0,
        Math.PI * 2,
      );
      c.stroke();
      c.globalAlpha = 1;
    }
    for (const o of this.orbitPositions()) {
      const p = this.project(o.x, o.y, 9);
      c.fillStyle = '#334052';
      c.fillRect(p.x - 5, p.y - 3, 10, 6);
      c.fillStyle = '#d7b2ff';
      c.fillRect(p.x - 3, p.y - 4, 6, 6);
      c.fillStyle = '#eff9ff';
      c.fillRect(p.x - 1, p.y - 3, 2, 2);
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
