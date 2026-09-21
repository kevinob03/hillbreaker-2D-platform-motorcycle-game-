# Hillbreaker

Hillbreaker es un videojuego web arcade 2D de motocross/plataformas construido con React, Vite y el motor físico **Planck.js**. Conduces una motocicleta lateralmente por colinas, pendientes, bajadas y saltos recogiendo monedas y combustible mientras aguantas sin volcar ni quedarte sin gasolina.

## Características

- Moto de motocross con físicas arcade (gravedad, aceleración, frenado, inclinación, ruedas, suspensión y colisiones).
- Terreno determinista y variado por nivel: Green Hills (fácil), Rocky Canyon (medio) y Death Mountain (difícil).
- Monedas (+100 puntos) distribuidas por el recorrido y en arcos sobre los saltos.
- Combustible real: se consume según `fuelConsumption` del nivel; los bidones recargan +30 %.
- Distancia y velocidad en pantalla según la posición real de la moto.
- Puntuación por distancia, monedas y pequeño bonus de aire (airtime).
- Detección de accidentes razonable: podrás saltar, hacer wheelies, caer inclinado y recuperarte; solo termina en Game Over un impacto realmente peligroso o quedarse sin combustible.
- Game Over con guardado del resultado (máximo una vez por partida) y botones de reintento, puntajes y menú.
- Leaderboard ordenado por puntuación con filtros por pista.
- Pausa con ESC, reinicio con R.
- Escenario en parallax por capas (cielo, montañas lejanas, montañas medias, vegetación y terreno).
- Partículas ligeras de polvo al acelerar y textos flotantes discretos al recoger objetos.
- HUD arcade minimalista: combustible, distancia, monedas, puntuación, velocidad y botón de pausa.

## Tecnologías

- React + Vite
- React Router (rutas y ruta dinámica `/game/:levelId`)
- **Planck.js** (motor físico; la moto, ruedas y terreno son cuerpos rígidos reales)
- HTML Canvas 2D (renderizado del juego, parallax y HUD por frame sin renders de React)
- JSON Server (API de niveles y puntajes)
- Lucide React (iconos de interfaz)
- Fonts: Anton (números/títulos), Chivo (etiquetas) y Space Grotesk (texto)

## Arquitectura general

```text
src/
  components/
    game/       GameCanvas, HUD, FuelBar, PauseMenu, GameOverModal, ControlsHelp, GameErrorBoundary
    layout/     GameHeader
    ui/         ArcadeButton, LevelCard, ScoreCard, LeaderboardRow
  game/         constants, createTerrain, createBike, physicsEngine, pickups, collisionUtils, gameRenderer
  hooks/        useGameLoop, useKeyboard
  pages/        Home, LevelSelect, Game, Scores, HowToPlay, NotFound
  services/     gameService, n8nService
  styles/       variables, global, components, pages
db.json         datos de JSON Server (niveles y puntajes)
```

Renderizado, física, estado React, servicios y datos viven en módulos separados. El bucle usa `requestAnimationFrame`; la simulación y la cámara se guardan en refs, de modo que React solo se actualiza unas 10 veces por segundo para el HUD.

## Rutas

- `/` — Home.
- `/game` — selección de pista.
- `/game/:levelId` — partida dinámica (carga el nivel por id desde la API).
- `/scores` — leaderboard.
- `/how-to-play` — instrucciones.
- `*` — 404.

## Controles

- `W` o `↑`: acelerar.
- `S` o `↓`: frenar y activar reversa a baja velocidad.
- `A` o `←`: inclinar hacia atrás (el frente se eleva).
- `D` o `→`: inclinar hacia delante.
- `R`: reiniciar la partida.
- `Escape`: pausar o continuar.

## Instalación y ejecución

```bash
npm install
```

Luego abre dos terminales:

**Terminal 1 — API (JSON Server):**
```bash
npm run server
```

**Terminal 2 — Frontend (Vite):**
```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

También disponibles: `npm run lint`, `npm run build` y `npm run preview`.

## JSON Server

`db.json` expone dos colecciones:

- **GET /levels** — devuelve los niveles con `id`, `name`, `difficulty`, `description`, `theme`, `fuelConsumption`, etc. La página LevelSelect los consume para mostrar tarjetas y `/game/:levelId` carga el nivel correspondiente.
- **GET /scores** — devuelve los puntajes guardados.
- **POST /scores** — guarda un resultado nuevo. Al terminar una partida se envía: `player`, `levelId`, `level`, `distance`, `score`, `coins` y `date`. Cada partida se guarda como máximo una vez. Si la API no está activa, el Game Over no se rompe: solo se muestra “No se pudo guardar el resultado”.

Si no tienes la API corriendo, las páginas muestran estado de carga y error con botón de reintentar.

## Hooks utilizados

- `useState` — estado de React que cambia poco seguido: pista cargada, pausa, game over, valores del HUD.
- `useEffect` — creación/limpieza del motor, listeners de teclado/resize, guardado del resultado.
- `useRef` — clave para el Canvas: guarda la simulación (planck: mundo, moto, terreno) y la cámara sin provocar renders por frame. Es la forma correcta de manejar datos de alta frecuencia.
- `useCallback` — callbacks estables (`restart`, `togglePause`) para no recrear suscripciones en cada render.

**Por qué `useRef` en Canvas/física:** el bucle de juego corre a 60 fps con `requestAnimationFrame`. Si cada frame escribiera algo inmutado en el estado de React, la interfaz se re-renderizaría 60 veces por segundo y tumbaría el rendimiento. `useRef` permite leer y mutar la simulación (posiciones, velocidad, combustible, monedas) fuera del ciclo de render de React y solo sincronizar el HUD de forma ocasional.

## Integración n8n (webhook opcional)

El frontend está preparado para enviar el resultado de cada partida a un webhook de n8n mediante `src/services/n8nService.js`.

Configure la URL del webhook en un archivo `.env` en la raíz:

```env
VITE_N8N_GAME_WEBHOOK=
```

Si `VITE_N8N_GAME_WEBHOOK` está vacío, no se hace ningún fetch y el juego funciona con normalidad. Cuando esté definida, al finalizar una partida se envía `{ player, levelId, level, distance, score, coins, date }`; un error del webhook nunca bloquea el Game Over, el guardado en `/scores`, el reintento ni la navegación.