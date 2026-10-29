// Preguntas SQL automáticas: un temporizador las lanza solas y el niño arma/completa la oración arrastrando palabras
export class Quiz {
  constructor(g, cfg) { Object.assign(this, { g, cfg, seen: new Set() }); this.reset(); }
  reset() { this.t = 0; this.streak = 0; this.first = true; }
  tick(dt) {                                   // se llama cada frame con el juego en marcha
    if (!this.g.state.playing) return;
    this.t += dt;
    if (this.t >= (this.first ? this.cfg.auto.firstAfter : this.cfg.auto.every)) { this.t = 0; this.first = false; this.ask(); }
  }
  pick() {
    const nivel = Math.min(3, 1 + Math.floor(this.g.levelIdx / 3));
    let pool = this.cfg.questions.filter(q => q.nivel <= nivel && !this.seen.has(q));
    if (!pool.length) { this.seen.clear(); pool = this.cfg.questions.filter(q => q.nivel <= nivel); }
    const q = pool[Math.floor(Math.random() * pool.length)];
    this.seen.add(q); return q;
  }
  ask(q = this.pick(), fails = 0, keep = null) {
    this.g.paused = true;
    this.g.ui.quiz(q, { glos: this.cfg.glosario, keep }, (words, ids, helped) => this.answer(q, words, ids, fails, helped));
  }
  answer(q, words, ids, fails, helped) {
    const { g, cfg: { reward: r } } = this;
    const good = words.map((w, i) => w === q.respuesta[i]);
    if (good.every(Boolean)) {
      let gold = r.correct + Math.min(this.streak, r.maxStreak) * r.streakBonus;
      if (fails || helped) gold = Math.round(gold * r.retryFactor); else this.streak++;
      g.bus.emit("quizCorrect", gold);
      g.ui.quizResult(`¡Muy bien! +${gold} de oro`, "Seguir jugando", () => this.close(), true, "¡Lo lograste! 🎉");
    } else {
      this.streak = 0;                         // las palabras correctas se quedan en su sitio al reintentar
      const keep = ids.map((id, i) => good[i] ? id : null);
      const msg = good.some(Boolean) ? "Casi... las palabras verdes están bien. ¡Cambia las rojas!" : "Casi... ¡mira la pista y prueba otra vez!";
      g.ui.quizResult(msg, "Intentar otra vez", () => this.ask(q, fails + 1, keep), false, "💡 " + q.pista);
    }
  }
  close() { this.g.paused = false; this.g.ui.quizHide(); }
}
