# Hillbreaker — contexto visual y técnico para Codex

## Objetivo

Construir un videojuego web arcade 2D de motocross con React + Vite. El jugador avanza lateralmente por terreno irregular, administra combustible, recoge monedas y busca la mayor distancia y puntuación sin volcar la moto.

Este paquete no es un proyecto terminado: reúne requisitos, referencias y una dirección visual acordada para que Codex implemente el juego por fases.

## Dirección visual elegida: punto medio

La referencia `01_gameplay_simple.png` es demasiado básica: es clara y deja espacio para jugar, pero la moto, el terreno y el paisaje parecen un prototipo sin terminar.

La referencia `02_gameplay_detailed.png` tiene el acabado arcade, la profundidad y la energía correctas, pero añade demasiados indicadores, etiquetas y paneles alrededor del área jugable.

La implementación debe quedar en medio:

- Conservar de la versión detallada: moto y piloto bien definidos, terreno con tierra/rocas/pasto, partículas moderadas, iluminación cálida, montañas en parallax y colores arcade.
- Conservar de la versión simple: lectura inmediata, amplio espacio visible, pocos indicadores y controles fáciles de identificar.
- Eliminar o aplazar: nivel del piloto, racha, wheelie, shock compression, récord de tiempo, multiplicadores, nitro, marcha, telemetría avanzada, anuncios y estadísticas inferiores permanentes.
- Evitar que el marco de navegación y los paneles ocupen demasiado alto de la pantalla durante la partida.

## HUD definitivo para la primera versión

Mostrar únicamente:

- Combustible: barra segmentada en la esquina superior izquierda.
- Distancia: centro superior.
- Monedas y puntuación: esquina superior derecha.
- Velocidad: indicador secundario pequeño.
- Pausa: botón discreto.
- Ayuda de controles: aparece al iniciar y desaparece después de unos segundos.

El HUD debe ocupar como máximo aproximadamente 10–12 % del alto de la zona jugable y nunca tapar la moto, el terreno inmediato ni los objetos recogibles.

## Estilo gráfico

- Arcade 2D moderno, off-road, enérgico y no infantil.
- Paleta base: asfalto oscuro, naranja eléctrico, verde lima, amarillo de advertencia y texto claro.
- Formas angulares, placas metálicas y botones con sensación física.
- Tipografías sugeridas: Anton para títulos/números, Chivo para etiquetas y Space Grotesk para texto.
- Paisaje en 4–5 capas para parallax: cielo, montañas lejanas, montañas medias, vegetación y terreno principal.
- El fondo debe tener menos contraste que la moto y el terreno para mantener la legibilidad.
- La moto debe ocupar aproximadamente 18–24 % del ancho del área jugable.
- Partículas de polvo pequeñas y breves; evitar efectos que oculten ruedas o superficie.

## Mecánica y controles

- W o flecha arriba: acelerar.
- S o flecha abajo: frenar/reversa.
- A o flecha izquierda: inclinar hacia atrás.
- D o flecha derecha: inclinar hacia adelante.
- Objetivo: avanzar, recoger monedas y combustible, superar pendientes y aterrizar sin que el piloto golpee el terreno.
- Game over por combustible agotado o accidente.

## Pantallas y rutas previstas

- `/`: Home con logo, Jugar, Puntajes y Cómo jugar.
- `/game`: selección de nivel.
- `/game/:levelId`: gameplay; esta es la ruta dinámica.
- `/scores`: leaderboard.
- `/how-to-play`: instrucciones.

Pantallas adicionales superpuestas: pausa y game over.

## Requisitos académicos que no se deben perder

- Mínimo 4 componentes reutilizables y uso correcto de props.
- `useState`, `useEffect` y al menos un hook adicional justificado; `useRef` es apropiado para Canvas y el bucle de animación.
- React Router con mínimo 3 rutas y al menos una ruta dinámica.
- Lectura GET y escritura POST/PUT mediante `db.json` + JSON Server, con estados de carga y error.
- Frontend conectado realmente a un webhook de n8n.
- Workflow n8n exportado como JSON y acompañado por una captura.
- README con instalación, tecnologías y URL del webhook.
- Commits progresivos.

## Flujo n8n acordado

Cinco etapas conceptuales:

1. Webhook recibe el resultado de la partida.
2. Edit Fields normaliza jugador, nivel, puntaje, distancia, monedas y fecha.
3. IF evalúa si el puntaje supera el umbral de récord.
4. Google Sheets o almacenamiento equivalente guarda la partida.
5. Respond to Webhook devuelve `success`, `highScore`, `message` y `score` a React.

## Arquitectura sugerida

```text
src/
  components/
    ArcadeButton.jsx
    FuelBar.jsx
    GameCanvas.jsx
    GameOverModal.jsx
    HUD.jsx
    LeaderboardRow.jsx
    LevelCard.jsx
  hooks/
    useGameLoop.js
    useKeyboard.js
  pages/
    Game.jsx
    Home.jsx
    HowToPlay.jsx
    LevelSelect.jsx
    Scores.jsx
  services/
    gameService.js
    n8nService.js
  App.jsx
  main.jsx
db.json
```

## Orden recomendado de implementación

1. Base Vite, rutas, páginas, componentes y estilos compartidos.
2. `db.json`, carga de niveles y leaderboard.
3. Canvas, terreno y cámara lateral.
4. Moto, gravedad, suspensión visual básica y controles.
5. Combustible, monedas, colisiones, puntaje y game over.
6. Guardado de puntaje y manejo de carga/error.
7. Integración n8n.
8. Sonido, partículas, animaciones y pulido responsive.

## Regla de alcance para Codex

No implementar todo en una sola respuesta. Trabajar por fases, verificar `npm run build` al cerrar cada fase y mantener el código modular y explicable. La primera fase no debe inventar físicas ni funciones que todavía no se hayan solicitado.

## Mapa de referencias del paquete

- `01_gameplay_simple.png`: límite inferior de detalle.
- `02_gameplay_detailed.png`: límite superior de detalle.
- `03_gameplay_target_inspiration.png`: referencia de composición y legibilidad; no copiar assets ni interfaz.
- `04_home_stitch.png` y `05_home_browser_capture.png`: identidad del Home y navegación.
- `stitch_export/`: HTML y captura generados por Stitch.
- `DESIGN.md`: tokens y sistema visual completo.
- `Quiz5_Videojuego_Frontend.docx`: enunciado oficial y rúbrica.

No copiar personajes, escenarios, logotipos ni assets de juegos existentes. Las imágenes son referencias de dirección artística y composición.
