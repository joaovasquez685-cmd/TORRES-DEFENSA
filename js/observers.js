// OBSERVER (comportamiento): el juego emite eventos y los observadores reaccionan
export class EventBus {
  #l = {};
  on(e, f) { (this.#l[e] ||= []).push(f); }
  emit(e, data) { [...(this.#l[e] || []), ...(this.#l["*"] || [])].forEach(f => f(data, e)); }
}
export class ScoreObserver {
  constructor(g) {
    g.bus.on("enemyKilled", e => g.score += e.cfg.reward * g.cfg.score.kill);
    g.bus.on("levelCleared", () => g.score += g.cfg.score.level * (g.levelIdx + 1));
    g.bus.on("victory", () => g.score += g.life * g.cfg.score.life);
  }
}
export class EconomyObserver {
  constructor(g) {
    g.bus.on("enemyKilled", e => g.gold += e.cfg.reward);
    g.bus.on("levelCleared", () => g.gold += g.level.bonus);
    g.bus.on("quizCorrect", gold => g.gold += gold);
  }
}
export class HudObserver { constructor(g) { g.bus.on("*", () => g.ui.hud(g)); } }
export class AlertObserver { constructor(g) { g.bus.on("baseDamaged", () => g.ui.flash()); } }
