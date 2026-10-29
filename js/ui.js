const $ = id => document.getElementById(id);
const btn = (label, fn, id) => { const b = document.createElement("button"); b.textContent = label; b.onclick = fn; if (id) b.dataset.id = id; return b; };

export class UI {
  hud(g) {
    $("hLevel").textContent = `${g.levelIdx + 1}/${g.cfg.levels.length}`;
    $("hGold").textContent = g.gold; $("hLife").textContent = g.life; $("hScore").textContent = g.score;
  }
  msg(t) { $("msg").textContent = t; }
  flash() { const s = $("stage"); s.classList.add("hit"); setTimeout(() => s.classList.remove("hit"), 150); }
  startBtn(show) { $("btnStart").hidden = !show; }
  panel(g) {
    const t = $("towers");
    for (const [id, c] of Object.entries(g.cfg.towers))
      t.append(btn(c.label, () => {
        g.selected = g.selected === id ? null : id;
        [...t.children].forEach(b => b.classList.toggle("on", b.dataset.id === g.selected));
      }, id));
    for (const [id, a] of Object.entries(g.cfg.abilities)) $("abilities").append(btn(a.label, () => g.useAbility(id)));
  }
  overlay({ title, text = "", input = false, buttons = [], rank = null }) {
    $("overlay").hidden = false; $("oTitle").textContent = title; $("oText").textContent = text; $("oName").hidden = !input;
    const bs = $("oBtns"); bs.innerHTML = ""; buttons.forEach(([l, f]) => bs.append(btn(l, f)));
    const ol = $("oRank"); ol.innerHTML = "";
    if (rank) rank().then(rows => rows.forEach(r => {
      const li = document.createElement("li"); li.textContent = `${r.nombre} — ${r.puntaje} pts (nivel ${r.nivel})`; ol.append(li);
    })).catch(() => { const li = document.createElement("li"); li.textContent = "No se pudo cargar el ranking."; ol.append(li); });
  }
  ranking(rows) {
    const ol = $("liveRank"); ol.innerHTML = "";
    const add = t => { const li = document.createElement("li"); li.textContent = t; ol.append(li); };
    if (!rows) add("No se pudo cargar el ranking.");
    else if (!rows.length) add("Aún no hay puntajes. ¡Sé el primero!");
    else rows.forEach(r => add(`${r.nombre} — ${r.puntaje} pts (nivel ${r.nivel})`));
  }
  // Pregunta SQL: se arma la oración ARRASTRANDO palabras a los huecos (o tocándolas)
  quiz(q, { glos = {}, keep = null }, onSubmit) {
    const t = q.tabla, sen = $("qSentence"), bk = $("qBank"), hb = $("qHintBtn");
    $("quizBox").hidden = false; $("qMsg").textContent = ""; $("qNext").hidden = true; hb.hidden = false;
    $("qTable").innerHTML = t ? `<b>${t.nombre}</b><table><tr>${t.cols.map(c => `<th>${c}</th>`).join("")}</tr>` +
      t.rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join("")}</tr>`).join("") + "</table>" : "";
    $("qText").textContent = q.pregunta;
    $("qHint").textContent = keep ? "Las palabras verdes ya están bien. ¡Completa las que faltan!" : "Arrastra cada palabra a su hueco 👆 ¡Tú puedes!";
    sen.className = "";
    // cada palabra muestra debajo qué significa (aprender jugando)
    const meaning = w => glos[w] || (t && w === t.nombre ? "la tabla" : t && t.cols.includes(w) ? "la columna"
      : /^'.*'$/.test(w) ? "un valor" : /^\d+$/.test(w) ? "un número" : "");
    const word = (cls, w) => {
      const e = document.createElement("div"), b = document.createElement("b"), s = document.createElement("small");
      e.className = cls; b.textContent = w; s.textContent = meaning(w); e.append(b, s); return e;
    };
    const nBlanks = q.plantilla.filter(w => w === "_").length;
    const filled = keep ? [...keep] : Array(nBlanks).fill(null), locked = filled.map(i => i !== null);
    const bank = q.banco.map((w, id) => ({ w, id })).sort(() => Math.random() - .5);
    let done = false, helped = false, hintLvl = 0, glow = null;
    const labels = ["💡 Pista", "💡 Otra pista", "🪄 Ayúdame con una palabra"];
    const check = () => {
      if (filled.includes(null)) return;
      done = true; hb.hidden = true; draw();
      setTimeout(() => onSubmit(filled.map(i => q.banco[i]), [...filled], helped), 450);
    };
    const place = (id, k) => {                   // k indefinido = primer hueco libre
      if (done) return;
      const j = filled.indexOf(id);
      if (j >= 0 && locked[j]) return;
      if (k === undefined) k = filled.indexOf(null);
      if (k < 0 || locked[k]) return;
      const prev = filled[k];
      if (j >= 0) filled[j] = prev;              // intercambio entre huecos
      filled[k] = id; glow = null; draw(); check();
    };
    const unplace = k => { if (done || locked[k]) return; filled[k] = null; draw(); };
    // Arrastrar con puntero (funciona con mouse y con el dedo); un toque simple también coloca/quita
    const drag = (el, id, from) => {
      el.style.touchAction = "none";
      el.onpointerdown = e => {
        e.preventDefault();
        const sx = e.clientX, sy = e.clientY; let ghost = null;
        const over = ev => { const x = document.elementFromPoint(ev.clientX, ev.clientY); return x && x.closest("[data-k]"); };
        const move = ev => {
          if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
          if (!ghost) { ghost = el.cloneNode(true); ghost.classList.add("ghost"); document.body.append(ghost); el.classList.add("lifted"); }
          ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px";
          sen.querySelectorAll(".over").forEach(x => x.classList.remove("over")); over(ev)?.classList.add("over");
        };
        const up = ev => {
          ["pointermove", "pointerup", "pointercancel"].forEach((n, i) => document.removeEventListener(n, [move, up, up][i]));
          const slot = over(ev); ghost?.remove();
          if (!ghost) from === null ? place(id) : unplace(from);
          else if (slot) place(id, +slot.dataset.k);
          else if (from !== null) unplace(from);
          draw();
        };
        document.addEventListener("pointermove", move); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
      };
    };
    const draw = () => {
      sen.innerHTML = ""; bk.innerHTML = ""; let b = 0;
      q.plantilla.forEach(w => {
        if (w !== "_") return sen.append(word("fixed", w));
        const k = b++, id = filled[k], e = id === null ? word("slot empty", "＿＿") : word("slot", q.banco[id]);
        e.dataset.k = k;
        if (locked[k]) e.classList.add("good");
        else if (done) e.classList.add(q.banco[id] === q.respuesta[k] ? "good" : "wrong");
        else if (id !== null) drag(e, id, k);
        sen.append(e);
      });
      bank.forEach(({ w, id }) => {
        const e = word("chip", w), used = filled.includes(id);
        e.classList.toggle("used", used); e.classList.toggle("glow", glow === id && !used);
        if (!used && !done) drag(e, id, null);
        bk.append(e);
      });
    };
    // Pistas progresivas: 1) explicación, 2) la palabra correcta brilla, 3) se coloca una palabra (vale la mitad de oro)
    hb.textContent = labels[0];
    hb.onclick = () => {
      const k = filled.indexOf(null); if (done || k < 0) return;
      hintLvl = Math.min(3, hintLvl + 1);
      const want = q.respuesta[k], pick = bank.find(x => x.w === want && !filled.includes(x.id));
      let msg;
      if (hintLvl === 1) msg = "💡 " + q.pista;
      else if (hintLvl === 2) { glow = pick ? pick.id : null; draw(); msg = "✨ Mira la palabra que brilla: va en el primer hueco vacío."; }
      else { helped = true; msg = "Te ayudé con una palabra. ¡Ahora sigue tú!"; if (pick) place(pick.id, k); }
      $("qHint").textContent = msg; hb.textContent = labels[Math.min(hintLvl, 2)]; this.say(msg.replace(/[💡✨]/gu, ""));
    };
    draw(); this.say(q.pregunta);
  }
  quizResult(msg, label, next, ok, tip) {
    $("qSentence").className = ok ? "ok" : "bad";
    $("qMsg").textContent = msg; if (tip) $("qHint").textContent = tip; this.say(msg);
    const n = $("qNext"); n.hidden = false; n.textContent = label; n.onclick = next;
  }
  quizHide() { $("quizBox").hidden = true; }
  say(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "es-ES"; u.rate = .85; speechSynthesis.speak(u); } catch {} }
  hide() { $("overlay").hidden = true; }
  name() { return $("oName").value.trim().slice(0, 20); }
  note(t) { $("oText").textContent = t; }
}
