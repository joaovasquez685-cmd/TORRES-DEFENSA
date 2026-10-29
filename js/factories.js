// FACTORY METHOD (creacional): create() es la plantilla, make() lo implementa cada fábrica
import { BaseStats, Shield } from "./decorators.js";
import { MOVES, TARGETING } from "./strategies.js";
import { Enemy, Tower } from "./entities.js";
import { BossNormal } from "./states.js";

class EntityFactory {
  constructor(defs) { this.defs = defs; }
  create(type, ctx) {
    const def = this.defs[type];
    if (!def) throw new Error("Tipo desconocido: " + type);
    return this.make(def, ctx);
  }
  make() { throw new Error("Factory Method abstracto"); }
}
export class EnemyFactory extends EntityFactory {
  make(d, level) {                       // la dificultad sale de la configuración del nivel
    const cfg = { ...d, hp: d.hp * level.hp, speed: d.speed * level.speed, heal: d.heal && { ...d.heal, amount: d.heal.amount * level.hp } };
    const e = new Enemy(cfg, new BaseStats(cfg), MOVES[d.move]);
    if (level.shield) e.stats = new Shield(e.stats, Infinity, level.shield);
    if (d.boss) e.phase = new BossNormal();
    return e;
  }
}
export class TowerFactory extends EntityFactory {
  make(d, { x, y }) { return new Tower(d, new BaseStats(d), TARGETING[d.strategy], x, y); }
}
