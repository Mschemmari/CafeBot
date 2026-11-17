# cafeBot

cafeBot arma un plan de tueste a partir del grano y lo ejecuta solo. Este corte corre sobre un tostador simulado: temperatura de grano, temperatura del aire del tambor y temperatura de la sala. No llama a un servicio, no pide una clave y no guarda nada fuera de la máquina.

El nombre visible está en `APP_NAME`, en `src/shared/brand.ts`.

## Requisitos

- Node.js 22.12 o más nuevo
- npm

El instalador de Mac se arma en una Mac. El de Windows, en Windows.

## Uso

```sh
npm install
npm run dev
```

`npm run dev` abre la ventana de Electron y recarga al guardar. La misma interfaz queda en http://127.0.0.1:4731/.

## Pruebas

```sh
npm test
npm run typecheck
```

## Historial

Un tueste terminado o cortado queda en el equipo.

- En Electron, el archivo `tuestes.json` está en la carpeta de datos de la app. En macOS suele ser `~/Library/Application Support/cafebot/tuestes.json`. En Windows, `%APPDATA%\cafebot\tuestes.json`.
- En el navegador, el mismo contenido va en `localStorage`, con la clave `cafebot.tuestes`.

## Instaladores

```sh
npm run build:mac
npm run build:win
```

El de Mac sale en `dist/cafebot-0.1.0.dmg`. El de Windows, en `dist/cafebot-0.1.0-setup.exe`. El de Mac no está notarizado.
