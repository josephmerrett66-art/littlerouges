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
g.shieldCd = 12;
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

// New upgrades must alter combat, not merely appear in the choice pool.
const fresh = () => {
  const g = make();
  g.start();
  g.spawn = 999;
  g.player.cd = 999;
  return g;
};
const equip = (g, id) => {
  g.mode = 'upgrade';
  g.choices = [id];
  g.choose(id);
};
const roaming = fresh();
roaming.collisionGrid.clear();
roaming.addRobots(1, 'scout');
const scout = roaming.robots[0];
scout.x = 0; scout.y = 0;
roaming.enemies = [roaming.unit(12, 0, 1000, 0)];
roaming.steerRobot(scout, 0.1);
assert(scout.x < 0, 'Scout evades an approaching human');
roaming.enemies = [];
const previous = { x: scout.x, y: scout.y };
for (let i = 0; i < 300; i++) { roaming.time += 1 / 60; roaming.steerRobot(scout, 1 / 60); }
assert(Math.hypot(scout.x - previous.x, scout.y - previous.y) > 15);
assert(Math.hypot(scout.x, scout.y) < 180);
for (let i = 0; i < 600; i++) {
  roaming.player.x += 1; roaming.time += 1 / 60; roaming.steerRobot(scout, 1 / 60);
}
assert(Math.hypot(scout.x - roaming.player.x, scout.y) < 220, 'Bots regroup while travelling');
for (const id of ['scout', 'gunner', 'sniper', 'bomber', 'medic', 'frost']) {
  const squad = fresh();
  equip(squad, `class_${id}`);
  const bot = squad.robots[0];
  assert.equal(bot.robotClass, id);
  bot.x = 0; bot.y = 0; bot.cd = 0; bot.supportCd = 0;
  squad.player.hp = 70;
  squad.enemies = [squad.unit(80, 0, 1000, 0), squad.unit(82, 16, 1000, 0)];
  squad.update(1 / 60);
  const shot = squad.bullets[0];
  assert(shot, `${id} attacks automatically`);
  if (id === 'gunner') assert.equal(squad.bullets.length, 2);
  if (id === 'sniper') { assert.equal(shot.pierce, 2); assert.equal(shot.damage, squad.damage * 3); }
  if (id === 'frost') assert(shot.frost);
  if (id === 'medic') assert.equal(squad.player.hp, 74);
  if (id === 'bomber') {
    assert(shot.splash);
    for (let i = 0; i < 20; i++) squad.update(1 / 60);
    assert(squad.enemies[1].hp < 1000, 'Bomber splash damages nearby humans');
  }
  squad.start(); assert.equal(squad.robots.length, 0);
}
console.log('Six robot classes, autonomous roaming, evasion and regrouping passed.');
const shield = fresh();
equip(shield, 'shield');
shield.enemies = [shield.unit(0, 0, 100, 0)];
shield.update(0.016);
assert.equal(shield.player.hp, 100);
assert(shield.shieldCd > 11);
shield.invuln = 0;
shield.update(0.016);
assert(shield.player.hp < 100);
const piercing = fresh();
equip(piercing, 'pierce');
equip(piercing, 'frost');
piercing.player.cd = 0;
const e1 = piercing.unit(35, 0, 1000, 0),
  e2 = piercing.unit(55, 0, 1000, 0);
piercing.enemies = [e1, e2];
for (let i = 0; i < 15; i++) piercing.update(1 / 60);
assert(e1.hp < 1000 && e2.hp < 1000);
assert(e1.slow > 0 && e2.slow > 0);
const multi = fresh();
equip(multi, 'multishot');
multi.player.cd = 0;
multi.enemies = [multi.unit(100, 0, 1000, 0)];
multi.update(0.016);
assert.equal(multi.bullets.length, 3);
const emp = fresh();
equip(emp, 'emp');
emp.enemies = [emp.unit(40, 0, 1000, 0)];
emp.pulseCd = 0;
emp.update(0.016);
assert(emp.enemies[0].hp < 1000 && emp.enemies[0].slow > 0);
const chain = fresh();
equip(chain, 'chain');
chain.player.cd = 0;
chain.shot = 3;
chain.enemies = [chain.unit(30, 0, 1000, 0), chain.unit(30, 35, 1000, 0)];
for (let i = 0; i < 6; i++) chain.update(1 / 60);
assert(chain.enemies[1].hp < 1000);
assert(chain.arcs.length > 0);
const orbit = fresh();
equip(orbit, 'orbit');
orbit.enemies = [orbit.unit(43, 0, 1000, 0)];
orbit.update(0.016);
assert(orbit.enemies[0].hp < 1000);
assert.equal(orbit.orbitPositions().length, 2);
const armor = fresh();
armor.addRobots(1);
armor.robots[0].hp = 1;
equip(armor, 'armor');
assert.equal(armor.robots[0].hp, 70);
armor.addRobots(1);
assert.equal(armor.robots[1].hp, 70);
const vacuum = fresh();
vacuum.xpDrops = [{ x: 300, y: 300, value: 4 }];
equip(vacuum, 'magnet');
assert.equal(vacuum.xp, 4);
assert.equal(vacuum.xpDrops.length, 0);
assert.equal(vacuum.magnet, 99);
for (const id of [
  'multishot',
  'frost',
  'chain',
  'emp',
  'shield',
  'salvage',
  'explode',
])
  equip(vacuum, id);
vacuum.xp = vacuum.nextXp;
vacuum.checkLevel();
assert(
  vacuum.choices.every(
    (id) =>
      ![
        'multishot',
        'frost',
        'chain',
        'emp',
        'shield',
        'salvage',
        'explode',
      ].includes(id),
  ),
);
vacuum.start();
assert.deepEqual(vacuum.ranks, {});
assert.equal(vacuum.range, 155);
assert.equal(vacuum.botHealth, 45);
assert(Object.keys(upgrades).length === 26);
assert(g.props.length > 100);
assert(g.props.some((p) => p.type === 'pool'));
assert(g.props.some((p) => p.type === 'court'));
const firstHouse = g.props.find((p) => p.type === 'house');
assert(firstHouse);
assert(
  g.blocked(firstHouse.x + firstHouse.w / 2, firstHouse.y + firstHouse.d / 2),
);
assert(!g.blocked(0, 0));
console.log(
  'All 11 new upgrade effects, caps, reset, and map collision checks passed.',
);

const longRange = fresh();
equip(longRange, 'range');
assert.equal(longRange.range, 193.75);
longRange.player.cd = 0;
longRange.enemies = [longRange.unit(180, 0, 1000, 0)];
longRange.update(0.016);
assert(longRange.bullets.length > 0);
assert(longRange.bullets[0].life > 0.7);
const salvage = fresh();
equip(salvage, 'salvage');
salvage.seed = 42;
for (let i = 0; i < 100; i++) salvage.kill(salvage.unit(200, i, 1, 0));
const chips = salvage.xpDrops.reduce((a, p) => a + p.value, 0);
assert(chips > 100 && chips < 200);
console.log('Bonus-XP and extended targeting behavior passed.');

const world = fresh();
// Check many block variants: amenities have room beyond homes and their fences.
for (let cx = -15; cx <= 15; cx++) for (let cy = -15; cy <= 15; cy++) {
  const block = world.generateChunk(cx, cy);
  for (const amenity of block.filter((p) => ['pool', 'court', 'garden'].includes(p.type))) {
    for (const home of block.filter((p) => ['house', 'porch', 'fence'].includes(p.type))) {
      assert(!(amenity.x - 8 < home.x + home.w + 8 && amenity.x + amenity.w + 8 > home.x - 8 &&
        amenity.y - 8 < home.y + home.d + 8 && amenity.y + amenity.d + 8 > home.y - 8),
        `Amenity overlaps ${home.type} in block ${cx},${cy}`);
    }
  }
}
// Both road orientations must rotate the entire car, including wheels and lights.
const renderCar = (w, d) => {
  const boxes = [];
  const renderer = { ctx: {}, ground() {}, box(...args) { boxes.push(args); } };
  Game.prototype.drawProp.call(renderer, { x: 0, y: 0, w, d, h: 15, type: 'car', color: '#abc' });
  return boxes;
};
const verticalCar = renderCar(21, 39), horizontalCar = renderCar(39, 21);
assert.equal(verticalCar.length, horizontalCar.length);
verticalCar.forEach((part, i) => {
  assert.deepEqual(horizontalCar[i], [part[1], part[0], part[3], part[2], ...part.slice(4)]);
  assert(part[0] >= -1 && part[0] + part[2] <= 22 && part[1] >= 0 && part[1] + part[3] <= 39);
});
console.log('961 landscape blocks have clear amenities; both car orientations remain intact.');
world.mapSeed = 123456789;
world.makeMap();
const distantBlock = JSON.stringify(world.generateChunk(37, -24));
assert.equal(JSON.stringify(world.generateChunk(37, -24)), distantBlock);
assert.notEqual(JSON.stringify(world.generateChunk(38, -24)), distantBlock);
world.player.x = 250_000;
world.player.y = -180_000;
world.ensureChunks();
assert.equal(world.chunks.size, 25);
assert.equal(world.loadedChunkX, 625);
assert.equal(world.loadedChunkY, -450);
assert(world.props.some((p) => Math.abs(p.x - world.player.x) < 1_000));
assert(world.props.some((p) => p.type === 'house'));
assert(world.props.some((p) => ['pool', 'court', 'garden'].includes(p.type)));
for (let step = 0; step < 30; step++) {
  world.player.x += 10_000;
  world.player.y -= 7_000;
  world.ensureChunks();
  assert.equal(world.chunks.size, 25);
}
const travel = fresh();
travel.move(travel.player, 123_456, -50);
assert(travel.player.x > 100_000);
travel.ensureChunks();
travel.spawnEnemy();
assert(
  Math.hypot(
    travel.enemies[0].x - travel.player.x,
    travel.enemies[0].y - travel.player.y,
  ) < 400,
);
console.log(
  'Deterministic endless chunks, bounded streaming, long travel, and distant spawning passed.',
);
