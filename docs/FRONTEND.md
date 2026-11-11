# Frontend VapeKing CR

El frontend está separado del backend dentro de `frontend/` y funciona como un sitio estático construido con HTML5, CSS3 y JavaScript vanilla. No contiene claves secretas ni depende de `node_modules`.

## Ejecutar localmente

Desde la raíz del repositorio:

```powershell
python -m http.server 4175 --bind 127.0.0.1 --directory frontend
```

Después, abrir `http://127.0.0.1:4175/`.

## Organización

```text
frontend/
├── index.html
├── css/
│   ├── styles.css
│   └── local-assets.css
├── js/
│   ├── data.js
│   ├── cart.js
│   ├── favorites.js
│   ├── filters.js
│   ├── ui.js
│   └── app.js
├── assets/
│   ├── productos/
│   └── catalogo/productos/
│       ├── wax-vaporizers/
│       └── botanica/
└── README.md
```

El catálogo contiene 44 productos de demostración: productos generales, colección Wax y colección Botánica. Las imágenes son recursos de maqueta; antes de publicar o vender deben reemplazarse por fotografías y datos verificados.
