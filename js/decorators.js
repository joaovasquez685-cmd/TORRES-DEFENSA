// DECORATOR (estructural): potenciadores temporales apilables sobre las estadísticas.
// El valor de cada efecto (×2, ×0.4, +3...) viene de levels.json, no del código.
export class BaseStats {
  constructor(cfg) { this.cfg = cfg; }
  get(k) { return this.cfg[k] ?? 0; }
  tick() { return this; }
}
class Decorator {
  constructor(inner, secs, value) { this.inner = inner; this.left = secs; this.value = value; }
  get(k) { return this.mod(k, this.inner.get(k)); }
  mod(k, v) { return v; }
  tick(dt) {                       // al expirar se devuelve la capa interna
    this.inner = this.inner.tick(dt); this.left -= dt;
    return this.left > 0 ? this : this.inner;
  }
}
export class DamageBoost extends Decorator { mod(k, v) { return k === "damage" ? v * this.value : v; } }
export class Slow extends Decorator { mod(k, v) { return k === "speed" ? v * this.value : v; } }
export class Shield extends Decorator { mod(k, v) { return k === "armor" ? v + this.value : v; } }
export class Rage extends Decorator { mod(k, v) { return k === "speed" ? v * this.value : v; } }
export const DECORATORS = { DamageBoost, Slow, Shield, Rage };
