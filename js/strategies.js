// STRATEGY (comportamiento): movimiento de enemigos y selección de objetivo de las torres
const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const inRange = (t, es) => es.filter(e => d(t, e) <= t.stats.get("range"));

export class StraightMove { advance(e, dt) { e.dist += e.stats.get("speed") * dt; } }
export class ZigzagMove {
  advance(e, dt) { e.dist += e.stats.get("speed") * dt; e.off = Math.sin(e.dist / e.cfg.zig.wave) * e.cfg.zig.amp; }
}
export class Nearest { select(t, es) { return inRange(t, es).sort((a, b) => d(t, a) - d(t, b)).slice(0, 1); } }
export class Strongest { select(t, es) { return inRange(t, es).sort((a, b) => b.hp - a.hp).slice(0, 1); } }
export class Area { select(t, es) { return inRange(t, es); } }

// Abierto/Cerrado: una estrategia nueva = una clase + una entrada aquí
export const MOVES = { straight: new StraightMove(), zigzag: new ZigzagMove() };
export const TARGETING = { nearest: new Nearest(), strongest: new Strongest(), area: new Area() };
