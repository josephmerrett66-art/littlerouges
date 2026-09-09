# Tiny Uprising

An isometric pixel-art survival game. Move using WASD, arrow keys, or the touch joystick. Robots automatically shoot nearby humans. Collect XP chips and choose one of three upgrades. Grow from one robot to a swarm of up to 100; survive escalating waves until the core is destroyed, then restart immediately.

## Run locally

With Node 22.13+ and pnpm installed:

```sh
pnpm install
pnpm dev
```

Open the local URL printed by the server. `P` or Escape pauses; the toolbar controls sound, pause, and restart. Switching away automatically pauses the run.

## Validate

```sh
pnpm exec tsc --noEmit
node tests/game.test.mjs
pnpm build
```

The tests exercise automatic combat, XP, paused upgrades, all upgrade effects, death/reset, joystick direction, a simulated run, and a 100-robot stress test. The simulation is a simple XP-seeking bot, not a guarantee of human survival time.

## Implementation

`app/game.ts` owns the simulation, procedural pixel rendering, collision, and synthesized audio. `app/page.tsx` owns the responsive HUD, joystick, accessible upgrade dialogs, and optional WebMCP controls. Art is drawn by the canvas engine, with no downloaded assets or runtime API dependencies. There is one map and no permanent progression. Browser audio starts after the first user interaction.

## Expanded neighborhood and upgrades

Maplewood now has four distinct gardens (pool, basketball court, vegetables, and flowers), individually colored shingled homes, shutters, porches, mailboxes, lights, hydrants, benches, sidewalk joints, drainage grates, and road wear. Decorative objects preserve the open traversal routes; houses and parked cars remain solid.

The neighborhood is procedurally generated and endless. A deterministic street grid streams a bounded five-by-five window of blocks around the player, combining homes, pools, courts, gardens, parks, cars, and street furniture. Sector coordinates appear in the HUD, and revisiting a location during a run recreates the same block without retaining the whole explored world in memory.

There are 20 upgrades. New choices add a lead-robot spread shot, piercing rounds, slowing shots, chain lightning, EMP, a rechargeable hit shield, bonus XP, map-wide XP collection, longer targeting range, follower armor, and orbiting satellites. Limited upgrades disappear when maxed. All upgrades reset on a new run.
