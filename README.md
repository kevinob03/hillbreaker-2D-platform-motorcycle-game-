# Hillbreaker

Hillbreaker es un videojuego web arcade 2D de motocross construido con React y Vite. El jugador elegirá una pista, administrará combustible, recogerá monedas y buscará superar su mejor distancia.

## Estado actual

**Fase 1 completada:** estructura, navegación, datos y pantallas principales. La partida es todavía una representación visual sin físicas ni Canvas jugable.

## Tecnologías

- React + Vite
- React Router
- JSON Server
- Lucide React
- CSS responsive

## Estructura

`src/components` contiene layout, UI y elementos de juego; `src/pages` contiene las pantallas; `src/services` centraliza el acceso a la API; `src/styles` define el sistema visual; `db.json` contiene niveles, puntuaciones y configuración.

## Instalación y ejecución

```bash
npm install
npm run server
npm run dev
```

Ejecuta los dos últimos comandos en terminales separadas. El frontend se sirve normalmente en `http://localhost:5173` y la API en `http://localhost:3001`.

Otros comandos: `npm run build`, `npm run lint` y `npm run preview`.

## Rutas

- `/`: inicio.
- `/game`: selección de nivel.
- `/game/:levelId`: vista dinámica de partida.
- `/scores`: clasificación y filtro.
- `/how-to-play`: controles y objetivos.
- Cualquier otra ruta muestra la página 404.

## Completado

- Navegación responsive con React Router.
- Niveles y clasificación obtenidos desde JSON Server.
- Estados de carga, error y listas vacías.
- Servicio preparado para GET de niveles/puntajes y POST de puntajes.
- Placeholder 16:9 con paisaje CSS, moto temporal y HUD limitado.
- Foco visible y soporte para `prefers-reduced-motion`.

## Pendiente para la Fase 2

- Canvas, bucle de juego, físicas, gravedad, suspensión, colisiones y movimiento.
- Controles reales, pausa, combustible, monedas, progreso y final de partida.
- Persistencia real del resultado, sonidos e integración con n8n.

Las físicas y el Canvas jugable llegarán en la Fase 2. No se documenta una URL de webhook porque la integración con n8n todavía no existe.
