// Implementación concreta del ranking sobre Firestore (campos exactos que exigen las reglas)
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { RankingRepository } from "./ranking.js";

export class FirebaseRankingRepository extends RankingRepository {
  #col = collection(db, "ranking");
  async save({ nombre, puntaje, nivel }) {
    await addDoc(this.#col, {
      nombre: String(nombre).slice(0, 20), puntaje: Math.max(0, Math.floor(puntaje)),
      nivel: Math.floor(nivel), fecha: serverTimestamp()
    });
  }
  // Tiempo real: cuando cualquier jugador guarda, todos los navegadores abiertos se actualizan
  subscribe(n, onRows, onError) {
    return onSnapshot(query(this.#col, orderBy("puntaje", "desc"), limit(n)),
      s => onRows(s.docs.map(d => d.data())), onError);
  }
}
