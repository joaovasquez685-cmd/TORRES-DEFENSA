// STATE (comportamiento): fases del juego y fases del jefe
import { Rage } from "./decorators.js";

class State { enter() {} update() {} click() {} exit() {} }

export class MenuState extends State {
  enter(g) {
    g.ui.startBtn(false);
    g.ui.overlay({ title: "Tower Defense", text: g.aviso || "Escribe tu nombre y defiende la base. Cada nivel es más difícil.", input: true,
      buttons: [["Jugar", () => {
        const n = g.ui.name();
        if (!n) return g.ui.note("Escribe tu nombre para poder registrarte en el ranking.");
        g.player = n; g.reset();
      }]] });
  }
}
class PlayingState extends State {
  playing = true;
  click(g, x, y) { g.placeTower(x, y); }
  update(g, dt) { g.updateWorld(dt); }
}
export class PreparationState extends PlayingState {
  canStart = true;
  enter(g) {
    g.ui.msg(`Nivel ${g.levelIdx + 1} de ${g.cfg.levels.length}: te saldrán preguntas SQL: ¡acierta para ganar oro! Construye guerreros y pulsa "Iniciar oleada".`);
    g.ui.startBtn(true);
  }
}
export class WaveState extends PlayingState {
  enter(g) { this.queue = g.buildSpawnQueue(); this.t = 0; g.ui.startBtn(false); g.ui.msg("¡Oleada en curso!"); }
  update(g, dt) {
    this.t += dt;
    while (this.queue.length && this.queue[0].t <= this.t) g.spawn(this.queue.shift().type);
    super.update(g, dt);
    if (g.state === this && !this.queue.length && !g.enemies.length) g.levelCleared();
  }
}
export class BossState extends WaveState {
  enter(g) { super.enter(g); g.ui.msg("¡Llega el jefe! Se enfurece al bajar al 50% de vida."); }
}
export class EndState extends State {
  constructor(win) { super(); this.win = win; }
  enter(g) {                                   // el puntaje se guarda solo, sin pulsar nada
    g.ui.startBtn(false);
    const score = g.score, nivel = g.levelIdx + 1, resumen = `${g.player}, tu puntaje: ${score} · Nivel ${nivel}.`;
    const base = { title: this.win ? "¡Victoria!" : "Derrota",
      buttons: [["Jugar de nuevo", () => g.reset()], ["Cambiar jugador", () => g.setState(new MenuState())]] };
    g.ui.overlay({ ...base, text: `${resumen} Guardando en el ranking...` });
    g.repo.save({ nombre: g.player, puntaje: score, nivel })
      .then(() => "Puntaje guardado en el ranking.", e => { console.error(e); return "No se pudo guardar el puntaje. Revisa tu conexión y las reglas de Firestore."; })
      .then(msg => { if (g.state === this) g.ui.overlay({ ...base, text: `${resumen} ${msg}` }); });
  }
}

// Fases del jefe (State aplicado a un enemigo)
export class BossNormal {
  update(e) {
    if (e.hp < e.cfg.hp * e.cfg.enrage.at) { e.phase = new BossEnraged(); e.phase.enter(e); }
  }
}
export class BossEnraged {
  enter(e) { e.stats = new Rage(e.stats, Infinity, e.cfg.enrage.value); }
  update() {}
}
