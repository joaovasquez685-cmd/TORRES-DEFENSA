// Abstracción del ranking (DIP): el juego depende de esta interfaz, no de Firebase
export class RankingRepository {
  async save(entry) { throw new Error("No implementado"); }
  // Avisa en vivo cada vez que cambia el Top N; devuelve la función para dejar de escuchar
  subscribe(n, onRows, onError) { throw new Error("No implementado"); }
}
// Respaldo en memoria si Firebase no está disponible
export class LocalRankingRepository extends RankingRepository {
  #rows = []; #subs = [];
  #top(n) { return [...this.#rows].sort((a, b) => b.puntaje - a.puntaje).slice(0, n); }
  async save(e) { this.#rows.push(e); this.#subs.forEach(f => f()); }
  subscribe(n, onRows) {
    const f = () => onRows(this.#top(n)); this.#subs.push(f); f();
    return () => this.#subs = this.#subs.filter(x => x !== f);
  }
}
