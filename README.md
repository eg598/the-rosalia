# The Rosalia BCN

Sitio web para **The Rosalia** — restaurante en Barcelona con cocina de mercado, vinos naturales y ambiente íntimo.

## Demo

[Ver demo en vivo](https://eg598.github.io/the-rosalia/)

## Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js + Express
- **Base de datos:** SQLite
- **Auth:** JWT

## Instalación local

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales
node server.js
```

Servidor en `http://localhost:3000`

## Estructura

```
├── index.html        # Página principal
├── menu.html         # Carta
├── nosotros.html     # Sobre nosotros
├── reservas.html     # Reservas
├── eventos.html      # Eventos
├── blog.html         # Blog
├── server.js         # Servidor Express
├── routes/           # Rutas API
├── middleware/       # Auth middleware
├── admin/            # Panel de administración
└── db/               # Base de datos SQLite
```
