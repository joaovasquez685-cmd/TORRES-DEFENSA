export class Path {
  constructor(pts) {
    this.pts = pts; this.cum = [0];
    pts.slice(1).forEach((p, i) => this.cum.push(this.cum[i] + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])));
    this.length = this.cum.at(-1);
  }
  at(dist, off = 0) {
    let i = 1; while (i < this.pts.length - 1 && this.cum[i] < dist) i++;
    const [x0, y0] = this.pts[i - 1], [x1, y1] = this.pts[i], L = this.cum[i] - this.cum[i - 1];
    const k = Math.min(1, Math.max(0, (dist - this.cum[i - 1]) / L));
    return { x: x0 + (x1 - x0) * k - ((y1 - y0) / L) * off, y: y0 + (y1 - y0) * k + ((x1 - x0) / L) * off };
  }
  distanceTo(x, y) {
    let m = 1e9;
    for (let i = 1; i < this.pts.length; i++) {
      const [a, b] = this.pts[i - 1], [c, e] = this.pts[i], dx = c - a, dy = e - b;
      const k = Math.max(0, Math.min(1, ((x - a) * dx + (y - b) * dy) / (dx * dx + dy * dy)));
      m = Math.min(m, Math.hypot(x - a - k * dx, y - b - k * dy));
    }
    return m;
  }
}

export class Enemy {
  constructor(cfg, stats, move) { Object.assign(this, { cfg, stats, move, hp: cfg.hp, dist: 0, off: 0, x: -50, y: -50, phase: null }); }
  takeDamage(d) { this.hp -= Math.max(1, d - this.stats.get("armor")); }
  update(dt, g) {
    this.stats = this.stats.tick(dt);
    this.phase?.update(this);
    this.move.advance(this, dt);
    Object.assign(this, g.path.at(this.dist, this.off));
    const h = this.cfg.heal;                       // sanador: cura aliados cercanos
    if (h && (this.ht = (this.ht || 0) + dt) >= h.every) {
      this.ht = 0;
      g.enemies.forEach(o => { if (o !== this && Math.hypot(o.x - this.x, o.y - this.y) < h.radius) o.hp = Math.min(o.cfg.hp, o.hp + h.amount); });
    }
  }
}

export class Tower {
  constructor(cfg, stats, targeting, x, y) { Object.assign(this, { cfg, stats, targeting, x, y, cd: 0, angle: -Math.PI / 2 }); }
  update(dt, g) {
    this.stats = this.stats.tick(dt);
    this.cd -= dt;
    if (this.cd > 0) return;
    const targets = this.targeting.select(this, g.enemies);
    if (!targets.length) return;
    this.angle = Math.atan2(targets[0].y - this.y, targets[0].x - this.x);
    targets.forEach(e => {
      e.takeDamage(this.stats.get("damage"));
      g.fx.push({ x1: this.x, y1: this.y, x2: e.x, y2: e.y, t: 0.12, color: this.cfg.color });
    });
    this.cd = this.stats.get("rate");
  }
}
