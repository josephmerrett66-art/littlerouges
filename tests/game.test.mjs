import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = ts.transpileModule(
  fs.readFileSync(new URL('../app/game.ts', import.meta.url), 'utf8'),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  },
).outputText;
const { Game, upgrades } = await import(
  'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
);
globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
globalThis.window = { addEventListener() {}, removeEventListener() {} };
globalThis.document = { addEventListener() {}, removeEventListener() {} };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
const make = () =>
  new Game(
    {
      getContext: () => ({}),
      getBoundingClientRect: () => ({ width: 1000, height: 700 }),
    },
    () => {},
  );
const g = make();
g.start();
assert.equal(g.robots.length, 0);
g.spawn = 999;
g.enemies = [g.unit(30, 0, 24, 0)];
for (let i = 0; i < 150; i++) g.update(1 / 60);
assert.equal(g.kills, 1);
assert(g.xp > 0, 'XP should be collected');
g.xp = g.nextXp;
g.checkLevel();
assert.equal(g.mode, 'upgrade');
assert.equal(new Set(g.choices).size, 3);
const paused = g.time;
g.update(1);
assert.equal(g.time, paused);
g.choose('invalid');
assert.equal(g.mode, 'upgrade');
g.choose('robot');
assert.equal(g.robots.length, 1);
assert.equal(g.mode, 'playing');
for (const id of Object.keys(upgrades)) {
  g.mode = 'upgrade';
  g.choices = [id];
  g.choose(id);
}
assert(g.robots.length >= 5);
assert(g.player.max > 100);
assert(g.damage > 16);
assert(g.convert > 0);
assert(g.explosive);
assert(g.speed > 79);
g.pause();
const t = g.time;
g.update(1);
assert.equal(g.time, t);
g.pause();
g.player.hp = 1;
g.enemies = [g.unit(g.player.x, g.player.y, 100, 0)];
g.invuln = 0;
g.update(0.016);
assert.equal(g.mode, 'dead');
g.start();
assert.equal(g.time, 0);
assert.equal(g.robots.length, 0);
assert.equal(g.player.hp, 100);
assert.equal(g.convert, 0);
assert.equal(g.explosive, false);
assert.equal(g.xp, 0);
g.spawn = 999;
g.setStick(1, 0);
g.update(1 / 60);
assert(
  g.player.x > 0 && g.player.y < 0,
  'Screen-right joystick must move screen-right',
);
g.setStick(0, 0);
const sim = make();
sim.start();
sim.seed = 42;
let firstLevel = 0;
const start = performance.now();
for (let frame = 0; frame < 60 * 600; frame++) {
  if (sim.mode === 'dead') break;
  if (sim.mode === 'upgrade') {
    firstLevel ||= sim.time;
    const choice =
      sim.choices.find((x) => x === 'convert') ||
      sim.choices.find((x) => x === 'repair' && sim.player.hp < 70) ||
      sim.choices.find((x) => x === 'trio') ||
      sim.choices[0];
    sim.choose(choice);
  }
  let target = sim.xpDrops.reduce(
    (a, p) =>
      !a ||
      Math.hypot(p.x - sim.player.x, p.y - sim.player.y) <
        Math.hypot(a.x - sim.player.x, a.y - sim.player.y)
        ? p
        : a,
    null,
  );
  if (target) {
    const dx = target.x - sim.player.x,
      dy = target.y - sim.player.y,
      len = Math.hypot(dx - dy, dx + dy) || 1;
    sim.setStick((dx - dy) / len, (dx + dy) / len);
  } else sim.setStick(0, 0);
  sim.update(1 / 60);
}
console.log(
  'All core checks passed. Autoplay:',
  JSON.stringify({
    seconds: Math.round(sim.time),
    firstLevel: Math.round(firstLevel),
    level: sim.level,
    peakSwarm: sim.peak,
    kills: sim.kills,
    mode: sim.mode,
    simulationMs: Math.round(performance.now() - start),
  }),
);
const stress = make();
stress.start();
stress.addRobots(99);
stress.time = 420;
stress.player.hp = 10000;
stress.player.max = 10000;
for (let i = 0; i < 190; i++) stress.spawnEnemy();
const before = performance.now();
for (let i = 0; i < 600; i++) {
  if (stress.mode === 'upgrade') stress.choose(stress.choices[0]);
  stress.update(1 / 60);
}
console.log(
  '100-robot stress test:',
  Math.round(performance.now() - before) + 'ms for 600 steps',
);
assert(stress.robots.length <= 99);
assert(stress.enemies.length <= 190);
assert(stress.particles.length <= 700);
