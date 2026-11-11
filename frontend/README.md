# VapeKing CR — Frontend

Frontend estático de e-commerce para una tienda de vapeo ficticia. Está inspirado en patrones comunes de tiendas online, pero usa contenido, textos, marca e imágenes placeholder originales.

## Ejecutar

La opción más simple es abrir `index.html` en el navegador. Para una experiencia de desarrollo más cómoda, serví la carpeta con cualquier servidor estático:

```bash
cd frontend
python -m http.server 4173
```

Luego abrí `http://localhost:4173`.

## Funcionalidades

- Catálogo de 44 productos de ejemplo, incluyendo colecciones independientes de 8 vaporizadores Wax y 10 diseños temáticos Botánicos.
- Búsqueda por nombre o marca.
- Filtros por marca y categoría, y ordenamiento por precio/rating.
- Carrito lateral con cantidades, subtotal y persistencia en `localStorage`.
- Favoritos persistidos en `localStorage`.
- Carrusel horizontal de recién llegados.
- Menú responsive, modal de búsqueda y cierre con `Escape`.
- Newsletter con validación nativa del navegador.
- Age gate informativo para mayores de 18 años.
- Diseño mobile-first con foco visible y soporte para `prefers-reduced-motion`.

## Personalización

Los colores, tipografías, sombras y espaciados están en `css/styles.css`, dentro de `:root`. Los productos y sus categorías están en `js/data.js`. Para reemplazar imágenes, editá las propiedades `image` de ese archivo; las URLs actuales usan `picsum.photos` como placeholder.

## Estructura

```text
frontend/
├── index.html
├── css/styles.css
├── css/local-assets.css
├── js/data.js
├── js/cart.js
├── js/favorites.js
├── js/filters.js
├── js/ui.js
├── js/app.js
└── README.md
```

Los recursos visuales entregados están en `assets/productos/` y el catálogo ampliado en `assets/catalogo/`. La colección Wax está en `assets/catalogo/productos/wax-vaporizers/` y la colección Botánica en `assets/catalogo/productos/botanica/`; ambas aparecen como apartados propios y filtros generales. Las imágenes botánicas son solo maquetas visuales: no representan contenido, potencia, seguridad ni certificaciones reales. `propuesta-homepage.png` se conserva como referencia de diseño y no se usa como contenido de la página. Las ilustraciones son genéricas; reemplazalas por fotografías y datos exactos antes de vender productos reales.

## Créditos y licencia

Proyecto educativo original para VapeKing CR. Los datos y recursos visuales son demostrativos. Licencia MIT.
