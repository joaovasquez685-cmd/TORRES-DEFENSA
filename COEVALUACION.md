# Coevaluación entre pares

## 1. Guion de caja negra (mínimo dos partidas completas)
**Partida 1 (derrota a propósito):** escribe un nombre, no construyas nada y deja pasar la oleada.
**Partida 2 (juego real):** construye, usa habilidades y avanza lo más lejos posible (idealmente hasta el jefe del nivel 6).

| Qué hacer | Qué observar | Patrón que debe evidenciar |
|---|---|---|
| Menú → Jugar → Iniciar oleada → terminar | El juego pasa por Menú, Preparación, Oleada (y Jefe) con mensajes distintos | State |
| Matar enemigos | Oro, puntaje y HUD cambian solos; la base parpadea al recibir daño | Observer |
| Construir arquero, cañón y mago | Cada torre elige objetivo distinto (cercano, más fuerte, todos en rango) | Strategy |
| Comparar corredor y zigzag | Se mueven distinto (recto vs. ondulado) | Strategy |
| Usar Furia y Congelar | Anillo dorado en torres / enemigos azulados, y el efecto termina solo; se pueden combinar | Decorator |
| Esperar unos segundos jugando y arrastrar las palabras para armar la oración SQL que aparece sola (probar el botón Pista) | El juego se pausa, se lee la pregunta y al acertar sube el oro (racha = más oro) | Observer (quizCorrect) |
| Subir de nivel | Más enemigos, más vida y velocidad; aparecen blindados, sanadores y escudos | Factory Method + configuración |
| Llegar al jefe (nivel 6) | Al bajar al 50% de vida se enfurece (brillo rojo y más rápido) | State + Decorator |
| Perder o ganar | El puntaje se guarda solo y aparece en el ranking en vivo (probar con dos pestañas) | Observer + Repository |

## 2. Checklist de caja blanca
- [ ] `new Enemy` y `new Tower` solo aparecen en `factories.js` (`grep -rn "new Enemy\|new Tower" js`).
- [ ] No hay `if`/`switch` por tipo de torre o enemigo en la lógica (`grep -rn "arquero\|soldado\|canon" js` no devuelve nada).
- [ ] Los potenciadores se aplican envolviendo `stats`, sin modificar `Tower` ni `Enemy` (`decorators.js`).
- [ ] Movimiento y objetivo se resuelven con clases intercambiables (`strategies.js`), registradas en `MOVES` y `TARGETING`.
- [ ] Las fases son clases con `enter/update` (`states.js`), no banderas booleanas.
- [ ] Puntaje, oro, HUD y alertas se suscriben a `EventBus` (`observers.js`); `Game` no los llama directamente.
- [ ] `Game` depende de `RankingRepository` y recibe la implementación desde `main.js`.
- [ ] Cifras de juego en `levels.json`, sin números mágicos de balance en el código.
- [ ] El UML del README coincide con las clases reales.
- [ ] El repositorio tiene README con patrones, instrucciones y UML.

## 3. Plantilla de coevaluación
**Grupo evaluado:** ______  **Evaluadores:** ______  **Fecha:** ______
**Partida 1:** nivel alcanzado ___  puntaje ___  **Partida 2:** nivel alcanzado ___  puntaje ___

Califica cada criterio de 0 a 5. **Nota final = Σ (nota × peso) ÷ 5**, en escala de 0 a 100.

| Criterio | Peso | Nota (0-5) | Evidencia (archivo o momento del juego) | Retroalimentación |
|---|---|---|---|---|
| Patrones de comportamiento (Strategy, State, Observer) | 35% | | | |
| Patrones creacionales / estructurales | 20% | | | |
| Calidad de código y OOP (SOLID, encapsulamiento, polimorfismo, legibilidad) | 20% | | | |
| Mecánicas y lógica del juego (funcional, desafiante, coherente) | 15% | | | |
| Rigurosidad de la coevaluación (se completa al calificar al evaluador) | 10% | | | |

**Cómo escribir la retroalimentación:** una frase por hallazgo con el formato *Observación → evidencia → sugerencia*. Ejemplo: "El cálculo de puntaje está fijo en `observers.js` línea 9 → impide balancear sin tocar código → moverlo a configuración".

**Fortalezas (mínimo 2):** ______
**Mejoras (mínimo 2):** ______
**Conclusión técnica (3 líneas máximo):** ______
