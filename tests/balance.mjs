import fs from 'node:fs';
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
const code = process.argv.includes('--baseline')
  ? execFileSync('git', ['show', '766bef0:app/game.ts'], { encoding: 'utf8' })
  : fs.readFileSync(new URL('../app/game.ts', import.meta.url), 'utf8');
const source = ts.transpileModule(code, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { Game } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.window = { addEventListener() {}, removeEventListener() {} };
globalThis.document = { addEventListener() {}, removeEventListener() {} };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
for (const seed of [42, 824731]) for (const strategy of ['stationary', 'mobile']) {
  const g = new Game({ getContext: () => ({}), getBoundingClientRect: () => ({ width: 1000, height: 700 }) }, () => {});
  g.start(); g.seed = seed; g.mapSeed = seed; g.player.cd = 0; g.makeMap();
  for (let frame = 0; frame < 30 * 600 && g.mode !== 'dead'; frame++) {
    if (g.mode === 'upgrade') {
      const priority = [g.player.hp < 65 ? 'repair' : '', 'convert', 'trio', 'damage', 'fire', 'robot'];
      g.choose(priority.find(id => g.choices.includes(id)) || g.choices[0]);
    }
    if (strategy === 'mobile') {
      let target = g.xpDrops.reduce((best, p) => !best || Math.hypot(p.x-g.player.x,p.y-g.player.y) < Math.hypot(best.x-g.player.x,best.y-g.player.y) ? p : best, null);
      let dx = target ? target.x-g.player.x : Math.cos(g.time / 6) * 60;
      let dy = target ? target.y-g.player.y : Math.sin(g.time / 6) * 60;
      const n = Math.hypot(dx,dy)||1; dx = dx/n; dy = dy/n;
      for (const hazard of g.strikes || []) {
        const x = g.player.x-hazard.x, y = g.player.y-hazard.y, d = Math.hypot(x,y);
        if (d < hazard.radius + 30) { dx += (d ? x/d : 1)*8; dy += (d ? y/d : 0)*8; }
      }
      for (const e of g.enemies) {
        const x=g.player.x-e.x,y=g.player.y-e.y,d=Math.hypot(x,y);
        if(d<65) {dx+=x/(d||1)*(65-d)/12;dy+=y/(d||1)*(65-d)/12;}
      }
      const angle = Math.atan2(dy,dx);
      for(const turn of [0,0.8,-0.8,1.6,-1.6,Math.PI]) {
        const x=Math.cos(angle+turn), y=Math.sin(angle+turn);
        if(!g.blocked(g.player.x+x*20,g.player.y+y*20)) { g.setStick((x-y)/Math.SQRT2,(x+y)/Math.SQRT2);break; }
      }
    }
    g.update(1/30);
  }
  console.log(JSON.stringify({seed,strategy,seconds:Math.round(g.time),level:g.level,swarm:g.peak,kills:g.kills,hp:Math.round(g.player.hp)}));
}
