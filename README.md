Estructura que quiero obtener:
/html
├── home.html               
├── menu.html
├── comandas.html
├── panel-control.html
│
├── css/
│   ├── base.css               // reset + variables
│   ├── layout.css             // grillas, contenedores
│   ├── components.css         // botones, cards, modales
│   ├── menu.css               // estilos SOLO del menú
│   ├── comandas.css           // estilos SOLO de comandas
│   └── panel-control.css      // estilos SOLO del panel
/js
 ├── api/
 │   ├── dishApi.js          // GET platos
 │   ├── orderApi.js         // GET / POST / PUT órdenes
 │   ├── categoryApi.js      // GET categorías
 │   └── deliveryApi.js      // GET tipos de entrega
 │
 ├── services/
 │   ├── carritoService.js   // lógica del carrito
 │   └── comandaService.js   // comanda activa, sessionStorage
 │
 ├── ui/
 │   ├── toast.js             // notificaciones
 │   ├── modal.js             // abrir / cerrar modales
 │   └── render.js            // render de listas, cards, items
 │
 ├── utils/
 │   ├── storage.js           // localStorage / sessionStorage
 │   └── constants.js         // estados, URLs, ids
 │
 ├── pages/
 │   ├── menuPage.js         // lógica SOLO del menú
 │   ├── comandaPage.js      // lista y detalle de comandas
 │   └── pControlPage.js// cocina / control estados
 
