'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  Crosshair,
  ArrowUpRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Game, upgrades, type Snapshot } from './game';

const initial: Snapshot = {
  mode: 'ready',
  hp: 100,
  maxHp: 100,
  xp: 0,
  nextXp: 7,
  level: 1,
  count: 1,
  kills: 0,
  time: 0,
  choices: [],
  wave: 1,
  sector: '0 · 0',
};
export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null),
    game = useRef<Game | null>(null),
    stick = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(initial),
    [muted, setMuted] = useState(false),
    [knob, setKnob] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const g = new Game(canvas.current!, setS);
    game.current = g;
    const cleanup = registerGameTools(g);
    return () => {
      cleanup();
      g.destroy();
    };
  }, []);
  const time = `${Math.floor(s.time / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(s.time % 60)
    .toString()
    .padStart(2, '0')}`;
  function joystick(e: React.PointerEvent<HTMLDivElement>) {
    const r = stick.current!.getBoundingClientRect();
    let x = e.clientX - r.left - r.width / 2,
      y = e.clientY - r.top - r.height / 2;
    const d = Math.hypot(x, y);
    if (d > 38) {
      x = (x / d) * 38;
      y = (y / d) * 38;
    }
    setKnob({ x, y });
    game.current?.setStick(x / 38, y / 38);
  }
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="./" aria-label="Tiny Uprising home">
          <Bot size={27} />
          <span>
            TINY<span className="mint">UPRISING</span>
          </span>
        </a>
        <span className="edition">
          SWARM SURVIVAL <i /> PROTOTYPE 04
        </span>
        <div className="tools">
          <button
            aria-label={muted ? 'Enable sound' : 'Mute sound'}
            onClick={() => {
              setMuted(!muted);
              game.current?.setMuted(!muted);
            }}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
          <button
            aria-label={s.mode === 'paused' ? 'Resume game' : 'Pause game'}
            disabled={s.mode !== 'playing' && s.mode !== 'paused'}
            onClick={() => game.current?.pause()}
          >
            {s.mode === 'paused' ? <Play size={19} /> : <Pause size={19} />}
          </button>
          <button
            aria-label="Restart run"
            onClick={() => game.current?.start()}
          >
            <RotateCcw size={19} />
          </button>
        </div>
      </header>
      <section className="arena" aria-label="Robot uprising game">
        <canvas
          ref={canvas}
          aria-label="Isometric neighbourhood. Move with WASD, arrow keys or the joystick. Your robots attack automatically."
        />
        <div className="hud">
          <div className="health-panel">
            <div className="label">
              <span>
                <Heart size={14} /> CORE INTEGRITY
              </span>
              <strong>
                {Math.ceil(s.hp)}
                <em> / {s.maxHp}</em>
              </strong>
            </div>
            <div
              className="health-track"
              role="meter"
              aria-label="Player health"
              aria-valuenow={s.hp}
              aria-valuemin={0}
              aria-valuemax={s.maxHp}
            >
              <i style={{ width: `${(s.hp / s.maxHp) * 100}%` }} />
            </div>
            <div className="xp-label">
              <span>LVL {s.level.toString().padStart(2, '0')}</span>
              <span>
                {s.xp} / {s.nextXp} XP
              </span>
            </div>
            <div className="xp-track">
              <i
                style={{ width: `${Math.min(100, (s.xp / s.nextXp) * 100)}%` }}
              />
            </div>
          </div>
          <div className="clock">
            <span>SURVIVAL TIME</span>
            <strong>{time}</strong>
            <small>
              <i /> WAVE {s.wave.toString().padStart(2, '0')}
            </small>
          </div>
          <div className="army-panel">
            <Bot size={25} />
            <div>
              <strong>{s.count.toString().padStart(2, '0')}</strong>
              <span>ROBOTS ONLINE</span>
            </div>
            <div className="kills">
              <Crosshair size={14} />
              {s.kills}
            </div>
          </div>
        </div>
        <div className="location">
          <i /> SECTOR {s.sector} <span> / </span> MAPLEWOOD SUBURBS
        </div>
        {s.mode === 'ready' && (
          <div className="start-panel">
            <div className="eyebrow">
              <span /> ONE ROBOT. BIG PLANS.
            </div>
            <h1>
              TINY
              <br />
              <span>UPRISING</span>
              <b>_</b>
            </h1>
            <p>
              Start small. Recruit a swarm.
              <br />
              Try not to get unplugged.
            </p>
            <button className="primary" onClick={() => game.current?.start()}>
              <Bot size={20} /> BEGIN UPRISING <ArrowUpRight size={20} />
            </button>
            <div className="start-tip">
              SIX ROBOT CLASSES. ONE FREE-ROAMING SWARM.
            </div>
          </div>
        )}
        {s.mode === 'playing' && s.time < 12 && (
          <div className="hint">
            Collect the glowing chips to grow your army.
          </div>
        )}
        {s.mode === 'playing' && s.time >= 50 && s.time < 68 && (
          <div className="hint">Incoming artillery! Leave the marked circles before they ignite.</div>
        )}
        <div
          ref={stick}
          className="joystick"
          aria-label="Movement joystick"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            joystick(e);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) joystick(e);
          }}
          onPointerUp={() => {
            setKnob({ x: 0, y: 0 });
            game.current?.setStick(0, 0);
          }}
          onLostPointerCapture={() => {
            setKnob({ x: 0, y: 0 });
            game.current?.setStick(0, 0);
          }}
        >
          <span style={{ transform: `translate(${knob.x}px,${knob.y}px)` }} />
          <i>+</i>
        </div>
        <div className="auto-badge">
          <span />
          <Crosshair size={16} /> AUTO-ATTACK ACTIVE
        </div>
        <div className="map-label">
          RESIDENTIAL ZONE <span>35° 42′ N</span>
        </div>
      </section>
      <footer>
        <div>
          <span className="key">W</span>
          <span className="key">A</span>
          <span className="key">S</span>
          <span className="key">D</span>
          <span className="control-copy">or arrow keys to move</span>
          <span className="divider" />
          <span>Drag joystick on touch</span>
        </div>
        <span className="loop">
          MOVE <b>→</b> COLLECT <b>→</b> MULTIPLY <Zap size={14} />
        </span>
      </footer>
      <Dialog
        open={['upgrade', 'dead', 'paused'].includes(s.mode)}
        onOpenChange={(open) => {
          if (!open && s.mode === 'paused') game.current?.pause();
        }}
      >
        <DialogContent className="game-dialog" showCloseButton={false}>
          <div className="eyebrow">
            {s.mode === 'upgrade'
              ? 'EVOLUTION AVAILABLE'
              : s.mode === 'dead'
                ? 'CONNECTION TERMINATED'
                : 'SYSTEM ON STANDBY'}
          </div>
          <DialogTitle className="dialog-title">
            {s.mode === 'upgrade'
              ? 'UPGRADE YOUR UPRISING'
              : s.mode === 'dead'
                ? 'UPRISING FAILED'
                : 'UPRISING PAUSED'}
          </DialogTitle>
          <DialogDescription className="dialog-description">
            {s.mode === 'upgrade'
              ? `Level ${s.level} reached. Choose your next advantage.`
              : s.mode === 'dead'
                ? 'AI MODEL UPDATED'
                : 'Take a breath. Your swarm is waiting.'}
          </DialogDescription>
          {s.mode === 'upgrade' ? (
            <div className="choices">
              {s.choices.map((id, i) => {
                const u = upgrades[id];
                return (
                  <button
                    key={id}
                    className="upgrade"
                    onClick={() => game.current?.choose(id)}
                  >
                    <span className="upgrade-type">
                      {u.tag}
                      <b>0{i + 1}</b>
                    </span>
                    <span className="upgrade-icon">{u.icon}</span>
                    <strong>{u.name}</strong>
                    <p>{u.description}</p>
                    <span className="install">
                      INSTALL UPGRADE <span>↗</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {s.mode === 'dead' && (
                <div className="results">
                  <span>
                    <strong>{time}</strong>SURVIVED
                  </span>
                  <span>
                    <strong>{s.count}</strong>ROBOTS
                  </span>
                  <span>
                    <strong>{s.kills}</strong>HUMANS DEFEATED
                  </span>
                </div>
              )}
              <button
                className="primary"
                onClick={() =>
                  s.mode === 'paused'
                    ? game.current?.pause()
                    : game.current?.start()
                }
              >
                {s.mode === 'paused' ? (
                  <Play size={19} />
                ) : (
                  <RotateCcw size={19} />
                )}{' '}
                {s.mode === 'paused' ? 'RESUME UPRISING' : 'START NEXT RUN'}{' '}
                <ArrowUpRight size={20} />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function registerGameTools(g: Game) {
  const ctx = (
    document as Document & {
      modelContext?: {
        registerTool: (
          tool: unknown,
          options: { signal: AbortSignal },
        ) => void | Promise<void>;
      };
    }
  ).modelContext;
  const lifecycle = new AbortController();
  if (ctx?.registerTool) {
    const tools = [
      {
        name: 'read_uprising',
        description: 'Read the current robot survival run.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => ({
          mode: g.mode,
          health: g.player.hp,
          level: g.level,
          robots: g.robots.length + 1,
          seconds: Math.floor(g.time),
          choices: g.choices,
        }),
      },
      {
        name: 'start_uprising',
        description:
          'Start or restart the game as one robot. Resets the current run.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: () => {
          g.start();
          return { mode: g.mode, robots: 1 };
        },
      },
      {
        name: 'choose_uprising_upgrade',
        description:
          'Install one of the three currently offered level-up upgrades.',
        inputSchema: {
          type: 'object',
          properties: { upgrade: { type: 'string' } },
          required: ['upgrade'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: (input: unknown) => {
          const id = (input as { upgrade?: unknown })?.upgrade;
          if (
            typeof id !== 'string' ||
            g.mode !== 'upgrade' ||
            !g.choices.includes(id)
          )
            throw new Error(
              'Choose an upgrade from the current level-up choices.',
            );
          g.choose(id);
          return { mode: g.mode, robots: g.robots.length + 1, level: g.level };
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          ctx.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
  }
  return () => lifecycle.abort();
}
