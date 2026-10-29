// Punto de entrada: aquí se inyecta el repositorio (Firebase o respaldo local)
import { Game } from "./game.js";
import { UI } from "./ui.js";
import { LocalRankingRepository } from "./ranking.js";

const cfg = await (await fetch("levels.json")).json();
cfg.quiz = await (await fetch("preguntas.json")).json();
let repo, aviso = "";
try {
  const m = await import("./firebaseRanking.js");
  repo = new m.FirebaseRankingRepository();
} catch (e) {
  console.warn("Firebase no disponible:", e);
  repo = new LocalRankingRepository();
  aviso = "Sin conexión a Firebase: el ranking será temporal.";
}
new Game(cfg, repo, new UI(), aviso).start();
