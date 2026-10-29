// Contexto del juego: coordina fábricas, estados, observadores y repositorio (inyectado)
import { EventBus, ScoreObserver, EconomyObserver, HudObserver, AlertObserver } from "./observers.js";
import { EnemyFactory, TowerFactory } from "./factories.js";
import { DECORATORS } from "./decorators.js";
import { Path } from "./entities.js";
import { Renderer } from "./render.js";
import { Quiz } from "./quiz.js";
import { MenuState, PreparationState, WaveState, BossState, EndState } from "./states.js";

export class Game {
  constructor(cfg, repo, ui, aviso = "") {
    Object.assign(this, { cfg, repo, ui, aviso, selected: null, mouse: null });
    this.cv = document.getElementById("cv"); this.c = this.cv.getContext("2d");
    this.path = new Path(cfg.path); this.bus = new EventBus();
    this.quiz = new Quiz(this, cfg.quiz);
    this.enemyF = new EnemyFactory(cfg.enemies); this.towerF = new TowerFactory(cfg.towers);
    [ScoreObserver, EconomyObserver, HudObserver, AlertObserver].forEach(O => new O(this));
    ui.panel(this); this.renderer = new Renderer(this);
    this.cv.onclick = e => { const p = this.pos(e); this.state.click(this, p.x, p.y); };
    this.cv.onmousemove = e => this.mouse = this.pos(e);
    this.cv.onmouseleave = () => this.mouse = null;
    document.getElementById("btnStart").onclick = () => this.startWave();
  }
  get level() { return this.cfg.levels[this.levelIdx]; }
  pos(e) { const r = this.cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * this.cv.width / r.width, y: (e.clientY - r.top) * this.cv.height / r.height }; }
  resetData() { Object.assign(this, { gold: this.cfg.start.gold, life: this.cfg.start.life, score: 0, levelIdx: 0, enemies: [], towers: [], fx: [], paused: false }); this.quiz?.reset(); }
  reset() { this.resetData(); this.ui.hide(); this.setState(new PreparationState()); }
  setState(s) { this.state?.exit(this); this.state = s; s.enter(this); this.bus.emit("stats"); }
  start() {
    this.repo.subscribe(10, rows => this.ui.ranking(rows), () => this.ui.ranking(null));
    this.resetData(); this.setState(new MenuState());
    let last = performance.now();
    const frame = t => { const dt = Math.min((t - last) / 1000, 0.05); last = t; if (!this.paused) { this.state.update(this, dt); this.quiz.tick(dt); } this.draw(); requestAnimationFrame(frame); };
    requestAnimationFrame(frame);
  }
  startWave() {
    if (this.paused || !this.state.canStart) return;
    const boss = this.level.waves.some(w => this.cfg.enemies[w[0]].boss);
    this.setState(boss ? new BossState() : new WaveState());
  }
  buildSpawnQueue() {
    const q = []; let t = 0;
    for (const [type, n, gap] of this.level.waves) { for (let i = 0; i < n; i++) { q.push({ t, type }); t += gap; } t += 2; }
    return q;
  }
  spawn(type) { this.enemies.push(this.enemyF.create(type, this.level)); }
  canPlace(x, y) {
    const p = this.cfg.placement, m = p.margin;
    return this.path.distanceTo(x, y) > p.pathGap && this.towers.every(t => Math.hypot(t.x - x, t.y - y) > p.towerGap)
      && x > m && y > m && x < this.cv.width - m && y < this.cv.height - m;
  }
  placeTower(x, y) {
    const id = this.selected;
    if (!id) return this.ui.msg("Elige primero una torre.");
    const c = this.cfg.towers[id];
    if (this.gold < c.cost) return this.ui.msg("Oro insuficiente.");
    if (!this.canPlace(x, y)) return this.ui.msg("No puedes construir ahí.");
    this.gold -= c.cost; this.towers.push(this.towerF.create(id, { x, y })); this.bus.emit("stats");
  }
  useAbility(id) {
    const a = this.cfg.abilities[id];
    if (!this.state.playing || this.paused) return;
    if (this.gold < a.cost) return this.ui.msg("Oro insuficiente.");
    this.gold -= a.cost; const D = DECORATORS[a.decorator];
    (a.target === "towers" ? this.towers : this.enemies).forEach(x => x.stats = new D(x.stats, a.secs, a.value));
    this.bus.emit("stats");
  }
  updateWorld(dt) {
    this.towers.forEach(t => t.update(dt, this));
    this.enemies.forEach(e => e.update(dt, this));
    for (const e of this.enemies) {
      if (e.hp <= 0) { e.dead = true; this.burst(e); this.bus.emit("enemyKilled", e); }
      else if (e.dist >= this.path.length) { e.dead = true; this.life -= e.cfg.damage || 1; this.bus.emit("baseDamaged", e); }
    }
    this.enemies = this.enemies.filter(e => !e.dead);
    this.fx.forEach(f => { f.t -= dt; if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; } }); this.fx = this.fx.filter(f => f.t > 0);
    if (this.life <= 0) this.setState(new EndState(false));
  }
  levelCleared() {
    this.bus.emit("levelCleared");
    if (this.levelIdx + 1 < this.cfg.levels.length) { this.levelIdx++; this.setState(new PreparationState()); }
    else { this.bus.emit("victory"); this.setState(new EndState(true)); }
  }
  burst(e) {
    for (let i = 0; i < 10; i++) { const a = Math.random() * 6.28, v = 30 + Math.random() * 70; this.fx.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.5, color: e.cfg.color }); }
    this.fx.push({ x: e.x, y: e.y - 10, vx: 0, vy: -30, t: 0.8, color: "#ffd34d", text: "+" + e.cfg.reward });
  }
  draw() { this.renderer.draw(this); }
}
