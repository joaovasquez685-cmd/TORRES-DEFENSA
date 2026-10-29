// Renderer: solo dibuja (SRP). El juego no conoce los detalles gráficos.
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(42);
const rim = (c, col, r) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.strokeStyle = "#0007"; c.lineWidth = 2; c.stroke(); };
const eyes = (c, r) => { for (const s of [-1, 1]) { c.fillStyle = "#fff"; c.beginPath(); c.arc(s * r * .35, -r * .2, r * .24, 0, 7); c.fill(); c.fillStyle = "#111"; c.beginPath(); c.arc(s * r * .35, -r * .15, r * .11, 0, 7); c.fill(); } };

const TOWER_ART = {
  bow(c, t) { c.rotate(t.angle); c.fillStyle = t.cfg.color; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill();
    c.strokeStyle = "#fff"; c.lineWidth = 2; c.beginPath(); c.arc(4, 0, 9, -1.2, 1.2); c.stroke(); c.fillStyle = "#fff"; c.fillRect(0, -1, 16, 2); },
  cannon(c, t) { c.fillStyle = "#2d3748"; c.fillRect(-9, -9, 18, 18); c.rotate(t.angle); c.fillStyle = t.cfg.color; c.fillRect(0, -4, 18, 8);
    c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.fillStyle = "#1a202c"; c.fillRect(15, -3, 4, 6); },
  crystal(c, t, now) { c.translate(0, Math.sin(now * 2 + t.x) * 2); c.shadowColor = t.cfg.color; c.shadowBlur = 14; c.fillStyle = t.cfg.color;
    c.beginPath(); c.moveTo(0, -13); c.lineTo(8, 0); c.lineTo(0, 13); c.lineTo(-8, 0); c.closePath(); c.fill(); c.shadowBlur = 0;
    c.fillStyle = "#ffffff88"; c.beginPath(); c.moveTo(0, -13); c.lineTo(-8, 0); c.lineTo(0, 2); c.closePath(); c.fill(); }
};
const ENEMY_ART = {
  round(c, e, r) { rim(c, e.cfg.color, r); eyes(c, r); },
  tri(c, e, r, a) { c.rotate(a); c.fillStyle = e.cfg.color; c.strokeStyle = "#0007"; c.lineWidth = 2; c.beginPath(); c.moveTo(r + 3, 0); c.lineTo(-r, -r); c.lineTo(-r, r); c.closePath(); c.fill(); c.stroke(); },
  diamond(c, e, r, a, now) { c.rotate(Math.PI / 4 + Math.sin(now * 6) * .15); c.fillStyle = e.cfg.color; c.fillRect(-r * .8, -r * .8, r * 1.6, r * 1.6); c.strokeStyle = "#0007"; c.lineWidth = 2; c.strokeRect(-r * .8, -r * .8, r * 1.6, r * 1.6); },
  square(c, e, r) { c.fillStyle = e.cfg.color; c.fillRect(-r, -r, r * 2, r * 2); c.strokeStyle = "#e2e8f0"; c.lineWidth = 2; c.strokeRect(-r, -r, r * 2, r * 2);
    c.fillStyle = "#1a202c"; c.fillRect(-r * .6, -r * .25, r * 1.2, r * .35); c.fillStyle = "#e2e8f0";
    for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); c.arc(x * r * .7, y * r * .7, 1.5, 0, 7); c.fill(); } },
  cross(c, e, r) { rim(c, e.cfg.color, r); c.fillStyle = "#fff"; c.fillRect(-r * .2, -r * .6, r * .4, r * 1.2); c.fillRect(-r * .6, -r * .2, r * 1.2, r * .4); },
  boss(c, e, r, a, now) { c.fillStyle = "#fbbf24";
    for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4 + now * .5); c.beginPath(); c.moveTo(r - 2, -5); c.lineTo(r + 8, 0); c.lineTo(r - 2, 5); c.fill(); c.restore(); }
    rim(c, e.cfg.color, r); for (const s of [-1, 1]) { c.fillStyle = "#fff"; c.beginPath(); c.arc(s * r * .38, -r * .15, r * .26, 0, 7); c.fill(); c.fillStyle = "#c53030"; c.beginPath(); c.arc(s * r * .38, -r * .1, r * .13, 0, 7); c.fill(); } }
};

export class Renderer {
  constructor(g) { this.bg = this.#background(g); }

  #background(g) {
    const cv = Object.assign(document.createElement("canvas"), { width: g.cv.width, height: g.cv.height });
    const c = cv.getContext("2d"), W = cv.width, H = cv.height, gr = c.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#21402f"); gr.addColorStop(1, "#162b22"); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 700; i++) { c.strokeStyle = rnd() > .5 ? "#2c5240" : "#12241b"; const x = rnd() * W, y = rnd() * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x + rnd() * 4 - 2, y - 3 - rnd() * 4); c.stroke(); }
    c.lineJoin = c.lineCap = "round"; c.beginPath();
    g.path.pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    for (const [w, col] of [[50, "#3d3020"], [44, "#7a6540"], [36, "#c9b27c"]]) { c.lineWidth = w; c.strokeStyle = col; c.stroke(); }
    c.setLineDash([8, 14]); c.lineWidth = 2; c.strokeStyle = "#e0cd9f"; c.stroke(); c.setLineDash([]);
    for (let i = 0; i < 160; i++) { const p = g.path.at(rnd() * g.path.length, (rnd() - .5) * 30); c.fillStyle = rnd() > .5 ? "#a58f5c" : "#e6d5a8"; c.fillRect(p.x, p.y, 2, 2); }
    const put = [];
    for (let i = 0; i < 200 && put.length < 26; i++) {
      const x = rnd() * W, y = rnd() * H;
      if (g.path.distanceTo(x, y) < 52 || put.some(p => Math.hypot(p[0] - x, p[1] - y) < 36)) continue;
      put.push([x, y]); c.fillStyle = "#0008"; c.beginPath(); c.ellipse(x + 3, y + 10, 13, 5, 0, 0, 7); c.fill();
      if (rnd() > .3) { c.fillStyle = "#4a3624"; c.fillRect(x - 2, y, 4, 10);
        for (const [col, dx, dy, r] of [["#1e5a3a", 0, -4, 13], ["#2a7048", -4, -8, 10], ["#3a8a58", 3, -11, 8]]) { c.fillStyle = col; c.beginPath(); c.arc(x + dx, y + dy, r, 0, 7); c.fill(); } }
      else { c.fillStyle = "#6b7280"; c.beginPath(); c.ellipse(x, y, 10, 7, 0, 0, 7); c.fill(); c.fillStyle = "#9ca3af"; c.beginPath(); c.ellipse(x - 2, y - 2, 5, 3, 0, 0, 7); c.fill(); }
    }
    return cv;
  }

  #base(c, g) {
    const [bx, by] = g.path.pts.at(-1), x = bx - 34, k = g.life / g.cfg.start.life;
    c.fillStyle = "#0007"; c.fillRect(x + 5, by - 30, 34, 68); c.fillStyle = "#718096"; c.fillRect(x, by - 34, 34, 68);
    c.fillStyle = "#a0aec0"; for (let i = 0; i < 4; i++) c.fillRect(x + i * 9, by - 42, 6, 8);
    c.fillStyle = "#2d3748"; c.fillRect(x + 10, by - 8, 14, 22); c.fillStyle = "#4a5568"; c.fillRect(x + 16, by - 62, 2, 20);
    c.fillStyle = k > .5 ? "#63b3ed" : k > .25 ? "#f6e05e" : "#fc8181"; c.beginPath(); c.moveTo(x + 18, by - 62); c.lineTo(x + 30, by - 57); c.lineTo(x + 18, by - 52); c.fill();
  }

  #tower(c, t, now) {
    c.save(); c.translate(t.x, t.y); c.fillStyle = "#0007"; c.beginPath(); c.ellipse(2, 8, 15, 7, 0, 0, 7); c.fill();
    c.fillStyle = "#4a5568"; c.strokeStyle = "#1a202c"; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 14, 0, 7); c.fill(); c.stroke();
    (TOWER_ART[t.cfg.shape] || TOWER_ART.bow)(c, t, now); c.restore();
    if (t.stats.get("damage") > t.cfg.damage) { c.strokeStyle = `rgba(255,211,77,${.6 + .4 * Math.sin(now * 8)})`; c.lineWidth = 3; c.beginPath(); c.arc(t.x, t.y, 18, 0, 7); c.stroke(); }
  }

  #enemy(c, g, e, now) {
    const r = e.cfg.size || 8, p = g.path.at(e.dist + 4, e.off), ang = Math.atan2(p.y - e.y, p.x - e.x);
    const sp = e.stats.get("speed"), rage = sp > e.cfg.speed * 1.5, slow = sp < e.cfg.speed * .6, shield = e.stats.get("armor") > e.cfg.armor;
    c.fillStyle = "#0007"; c.beginPath(); c.ellipse(e.x, e.y + r * .8, r, r * .4, 0, 0, 7); c.fill();
    if (e.cfg.heal) { c.strokeStyle = `rgba(79,209,197,${.2 + .1 * Math.sin(now * 4)})`; c.lineWidth = 2; c.beginPath(); c.arc(e.x, e.y, 70, 0, 7); c.stroke(); }
    c.save(); c.translate(e.x, e.y + Math.sin(now * 10 + e.dist * .1) * 1.5);
    if (rage) { c.shadowColor = "#f56565"; c.shadowBlur = 18; }
    (ENEMY_ART[e.cfg.shape] || ENEMY_ART.round)(c, e, r, ang, now); c.shadowBlur = 0;
    if (slow) { c.fillStyle = "#63b3ed99"; c.beginPath(); c.arc(0, 0, r + 2, 0, 7); c.fill(); }
    if (shield) { c.strokeStyle = "#e2e8f0"; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r + 4, 0, 7); c.stroke(); }
    c.restore();
    const w = Math.max(18, r * 2), k = Math.max(0, e.hp / e.cfg.hp), x = e.x - w / 2, y = e.y - r - 10;
    c.fillStyle = "#000b"; c.fillRect(x - 1, y - 1, w + 2, 5); c.fillStyle = k > .5 ? "#68d391" : k > .25 ? "#f6e05e" : "#fc8181"; c.fillRect(x, y, w * k, 3);
  }

  draw(g) {
    const c = g.c, now = performance.now() / 1000;
    c.drawImage(this.bg, 0, 0); this.#base(c, g);
    g.towers.forEach(t => this.#tower(c, t, now));
    [...g.enemies].sort((a, b) => a.y - b.y).forEach(e => this.#enemy(c, g, e, now));
    for (const f of g.fx) {
      c.globalAlpha = Math.min(1, f.t * 6);
      if (f.text) { c.fillStyle = f.color; c.font = "bold 13px system-ui"; c.textAlign = "center"; c.fillText(f.text, f.x, f.y); }
      else if (f.vx !== undefined) { c.fillStyle = f.color; c.fillRect(f.x - 2, f.y - 2, 4, 4); }
      else { c.strokeStyle = f.color; c.lineWidth = 2.5; c.shadowColor = f.color; c.shadowBlur = 8; c.beginPath(); c.moveTo(f.x1, f.y1); c.lineTo(f.x2, f.y2); c.stroke();
        c.shadowBlur = 0; c.beginPath(); c.arc(f.x2, f.y2, (0.12 - f.t) * 90, 0, 7); c.stroke(); }
    }
    c.globalAlpha = 1;
    if (g.selected && g.mouse && g.state.playing) {
      const { x, y } = g.mouse, ok = g.canPlace(x, y), d = g.cfg.towers[g.selected];
      c.fillStyle = ok ? "#48bb7830" : "#f5656530"; c.strokeStyle = ok ? "#48bb78" : "#f56565"; c.lineWidth = 1.5;
      c.beginPath(); c.arc(x, y, d.range, 0, 7); c.fill(); c.stroke();
      c.globalAlpha = .7; c.fillStyle = d.color; c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill(); c.globalAlpha = 1;
    }
  }
}
