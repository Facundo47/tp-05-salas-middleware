# Trabajo práctico 05

## Descripción

Este proyecto implementa una aplicación web para gestionar reservas temporales de salas de estudio.

La aplicación fue desarrollada utilizando Node.js, Express y EJS.

El sistema permite:

- Consultar las reservas existentes.
- Ver el detalle de una reserva.
- Crear nuevas reservas.
- Validar los datos ingresados.
- Consultar el estado del servicio.
- Identificar cada solicitud mediante un ID.
- Medir la duración de cada solicitud.
- Mostrar una página personalizada para errores 404.

Las reservas se almacenan únicamente en memoria durante la ejecución del servidor.

---

## Instalación

Para instalar las dependencias del proyecto, ejecutar:

```bash
npm install

Las dependencias principales utilizadas son:

Express
EJS
express-ejs-layouts
Morgan


Ejecución
Para iniciar el servidor:
npm start


El servidor estará disponible en:

http://localhost:3000

Para verificar la sintaxis del archivo principal:
npm run check

Rutas
| Método | Ruta              | Descripción                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/`               | Página principal                    |
| GET    | `/estado`         | Estado del servicio en formato JSON |
| GET    | `/reservas`       | Lista de reservas                   |
| GET    | `/reservas/nueva` | Formulario para crear una reserva   |
| GET    | `/reservas/:id`   | Detalle de una reserva              |
| POST   | `/reservas`       | Crear una nueva reserva             |


Página principal
GET /

Permite acceder a la página de inicio del sistema.

URL:

http://localhost:3000/
Estado del servicio
GET /estado

Devuelve información en formato JSON sobre el estado actual del servicio.

Ejemplo:

{
    "servicio": "activo",
    "cantidadReservas": 4,
    "solicitudId": "BIB-0001"
}
Lista de reservas
GET /reservas

Muestra todas las reservas almacenadas actualmente en memoria.

URL:

http://localhost:3000/reservas
Nueva reserva
GET /reservas/nueva

Muestra el formulario para crear una nueva reserva.

URL:

http://localhost:3000/reservas/nueva
Detalle de una reserva
GET /reservas/:id

Permite consultar el detalle de una reserva mediante su ID.

Ejemplo:

GET /reservas/1

URL:

http://localhost:3000/reservas/1
Crear una reserva
POST /reservas

Recibe los datos del formulario y valida la información antes de crear la reserva.

Si los datos son válidos, se crea la reserva y se realiza una redirección hacia:

/reservas
Pipeline de middleware

El pipeline principal de la aplicación se ejecuta en el siguiente orden:

Morgan
   ↓
identificarSolicitud
   ↓
medirDuracion
   ↓
expressLayouts
   ↓
express.static
   ↓
express.urlencoded
   ↓
express.json
   ↓
Rutas de la aplicación
   ↓
Router de reservas
   ↓
404 final

Este orden permite que cada middleware cumpla una función específica dentro del procesamiento de las solicitudes.

Morgan

Morgan es utilizado para registrar las solicitudes HTTP realizadas al servidor.

Permite observar información como:

Método HTTP.
URL.
Código de estado.
Tiempo de respuesta.

Ejemplo:

GET /reservas 200

También permite observar las respuestas 302, 400 y 404.

Middleware identificarSolicitud

El middleware identificarSolicitud genera un identificador para cada solicitud.

Los identificadores tienen el siguiente formato:

BIB-0001
BIB-0002
BIB-0003
BIB-0004

El identificador se almacena mediante:

res.locals.solicitudId = solicitudId;

Esto permite utilizar el ID posteriormente en:

Las vistas EJS.
La ruta /estado.
El registro de duración de las solicitudes.
Middleware medirDuracion

El middleware medirDuracion permite conocer cuánto tiempo tarda cada solicitud.

Primero registra el momento inicial:

const inicio = Date.now();

Luego utiliza el evento:

res.on("finish", () => {

El evento finish permite ejecutar el código cuando la respuesta HTTP ya terminó.

La información registrada incluye:

ID de solicitud.
Método HTTP.
URL original.
Código de estado.
Duración en milisegundos.

Ejemplo:

ID: BIB-0005 | Método: GET | URL: /reservas | Estado: 200 | Duración: 8 ms
expressLayouts

express-ejs-layouts permite utilizar un layout general para las diferentes vistas EJS.

El layout principal se encuentra en:

views/layouts/main.ejs

De esta manera, las diferentes páginas comparten:

Encabezado.
Navegación.
Contenido principal.
Pie de página.
Identificador de solicitud.
express.static

El middleware:

app.use(express.static(path.join(__dirname, "../public")));

permite servir archivos estáticos.

Por ejemplo:

public/css/estilos.css

puede ser utilizado desde las vistas mediante:

<link rel="stylesheet" href="/css/estilos.css">
express.urlencoded

El middleware:

app.use(express.urlencoded({ extended: true }));

permite procesar los datos enviados desde formularios HTML.

Esto es necesario para poder acceder a:

req.body

antes de ejecutar la validación de la reserva.

express.json

El middleware:

app.use(express.json());

permite procesar solicitudes que envían información utilizando el formato JSON.

Router de reservas

Las rutas relacionadas con las reservas se agrupan utilizando:

const reservasRouter = express.Router();

El router se monta mediante:

app.use("/reservas", reservasRouter);

Por lo tanto, las rutas internas utilizan rutas relativas.

Por ejemplo:

reservasRouter.get("/", ...)

corresponde a:

GET /reservas

Y:

reservasRouter.get("/nueva", ...)

corresponde a:

GET /reservas/nueva
Middleware prepararAreaReservas

El router utiliza un middleware específico para el área de reservas:

function prepararAreaReservas(req, res, next) {
    res.locals.seccion = "Reservas de salas";
    next();
}

Este middleware se ejecuta antes de las rutas del router:

prepararAreaReservas
        ↓
GET /reservas
        ↓
GET /reservas/nueva
        ↓
GET /reservas/:id
        ↓
POST /reservas

El valor:

res.locals.seccion

queda disponible para las vistas del área de reservas.

Alcance de cada función
identificarSolicitud

Su responsabilidad es generar un ID único para cada solicitud.

Ejemplo:

BIB-0001

El contador aumenta en cada nueva solicitud.

medirDuracion

Su responsabilidad es medir el tiempo que tarda en finalizar cada respuesta HTTP.

Utiliza el evento:

finish

y registra el resultado en la consola.

prepararAreaReservas

Su responsabilidad es preparar información específica para las páginas del área de reservas.

Utiliza:

res.locals.seccion

para proporcionar el nombre de la sección a las vistas.

validarReserva

Su responsabilidad es validar los datos enviados mediante el formulario.

Comprueba:

El estudiante es obligatorio.
El email es obligatorio.
El email debe contener @.
La sala debe ser válida.
La fecha es obligatoria.
El turno debe ser válido.
La cantidad de personas debe ser un número entero.
La cantidad de personas debe estar entre 1 y 6.

Si existen errores:

HTTP 400 Bad Request

y se vuelve a mostrar el formulario.

Si todos los datos son correctos, prepara:

req.reservaValidada

y ejecuta:

next();
crearReserva

Esta función se ejecuta solamente después de que la información fue validada correctamente.

Genera un nuevo ID numérico y agrega la reserva al array:

reservas.push(nuevaReserva);

Finalmente realiza:

res.redirect("/reservas");

Esto produce:

302 Redirect

y posteriormente el navegador realiza:

GET /reservas
Validación

La validación se realiza mediante un middleware separado:

reservasRouter.post(
    "/",
    validarReserva,
    crearReserva
);

Esto permite separar la responsabilidad de validar los datos de la responsabilidad de crear la reserva.

Flujo de POST válido

Cuando los datos son correctos, el flujo es:

POST /reservas
      ↓
validarReserva
      ↓
¿Datos válidos?
      ↓
    next()
      ↓
crearReserva
      ↓
302 Redirect
      ↓
GET /reservas
      ↓
200 OK
Ejemplo
Estudiante: Pedro González
Email: pedro@gmail.com
Sala: Sala Norte
Fecha: 10/10/2026
Turno: Mañana
Personas: 2

Resultado:

POST /reservas → 302
GET /reservas → 200

La nueva reserva queda agregada al listado.

Flujo de POST inválido

Cuando existen errores:

POST /reservas
      ↓
validarReserva
      ↓
Errores encontrados
      ↓
400 Bad Request
      ↓
Formulario nuevamente

En este caso:

crearReserva

no se ejecuta.

Ejemplo de POST inválido
Estudiante: vacío
Email: pedrogmail.com
Sala: inválida
Fecha: vacío
Turno: inválido
Personas: 10

La aplicación devuelve:

400 Bad Request

y muestra nuevamente el formulario con los mensajes de error.

Respuestas HTTP utilizadas

La aplicación utiliza diferentes códigos de estado según el resultado de cada solicitud.

200 OK

Se utiliza para solicitudes exitosas.

Ejemplos:

GET /
GET /estado
GET /reservas
GET /reservas/nueva
GET /reservas/1
302 Found

Se utiliza después de crear correctamente una reserva.

POST /reservas
        ↓
302
        ↓
GET /reservas
400 Bad Request

Se utiliza cuando los datos enviados para crear una reserva son incorrectos.

Ejemplos:

Email sin @.
Sala inválida.
Turno inválido.
Cantidad de personas fuera del rango.
Campos obligatorios vacíos.
404 Not Found

Se utiliza cuando el recurso solicitado no existe.

Ejemplos:

GET /reservas/999

o:

GET /cualquier-ruta

En ambos casos se muestra la vista:

views/no-encontrado.ejs
Página 404

El proyecto posee un middleware final:

app.use((req, res) => {
    res.status(404).render("no-encontrado", {
        title: "Página no encontrada"
    });
});

Este middleware se encuentra después de todas las rutas.

Por este motivo, si ninguna ruta coincide con la solicitud, se muestra la página de recurso no encontrado.

Vistas

El proyecto utiliza EJS para generar las páginas HTML.

La estructura de vistas es:

views/
│
├── layouts/
│   └── main.ejs
│
├── reservas/
│   ├── lista.ejs
│   └── detalle.ejs
│
├── inicio.ejs
├── nueva.ejs
└── no-encontrado.ejs
Layout principal

Archivo:

views/layouts/main.ejs

Contiene:

Estructura HTML principal.
Encabezado.
Menú de navegación.
Contenido dinámico.
Pie de página.
ID de solicitud.
Lista de reservas

Archivo:

views/reservas/lista.ejs

Muestra:

ID.
Estudiante.
Sala.
Fecha.
Turno.
Cantidad de personas.
Enlace al detalle.

También contempla el caso en el que no existan reservas.

Detalle

Archivo:

views/reservas/detalle.ejs

Muestra todos los datos de una reserva específica.

Nueva reserva

Archivo:

views/nueva.ejs

Contiene el formulario para crear nuevas reservas.

Los campos son:

Estudiante.
Email.
Sala.
Fecha.
Turno.
Cantidad de personas.

Los errores de validación se muestran mediante:

<div role="alert">
Página no encontrada

Archivo:

views/no-encontrado.ejs

Se utiliza para mostrar errores 404.

Accesibilidad y usabilidad

El proyecto contempla algunos aspectos básicos de accesibilidad:

Documento HTML con lang="es".
Meta viewport.
Etiquetas label asociadas a los controles del formulario.
Navegación mediante enlaces.
Indicadores visibles de foco.
Mensajes de error utilizando role="alert".
Textos descriptivos.
Navegación consistente entre las páginas.
Pruebas manuales

Durante el desarrollo se realizaron pruebas manuales para comprobar el funcionamiento de las rutas y middleware.

Página principal
GET /

Resultado esperado:

200 OK
Estado
GET /estado

Resultado esperado:

200 OK

Devuelve:

{
    "servicio": "activo",
    "cantidadReservas": 4,
    "solicitudId": "BIB-XXXX"
}
Lista de reservas
GET /reservas

Resultado esperado:

200 OK
Formulario
GET /reservas/nueva

Resultado esperado:

200 OK
Detalle existente
GET /reservas/1

Resultado esperado:

200 OK
Detalle inexistente
GET /reservas/999

Resultado esperado:

404 Not Found
URL inexistente
GET /cualquier-ruta

Resultado esperado:

404 Not Found
POST válido
POST /reservas

Resultado esperado:

302 Redirect

seguido de:

GET /reservas

con:

200 OK
POST inválido
POST /reservas

Resultado esperado:

400 Bad Request

El formulario vuelve a mostrarse con los errores.

Persistencia temporal

Las reservas se almacenan en memoria utilizando un array de JavaScript.

Las cuatro reservas iniciales se encuentran definidas directamente en:

let reservas = [
    ...
];

Cuando se crea una nueva reserva:

reservas.push(nuevaReserva);

la información queda disponible mientras el servidor continúa ejecutándose.

Sin embargo, no se utiliza:

Base de datos.
Archivos.
Cookies.
Sesiones.
Almacenamiento permanente.

Por lo tanto, al reiniciar el servidor, las reservas creadas durante la ejecución desaparecen y vuelven a quedar únicamente las cuatro reservas iniciales.

Ejemplo:

Inicio del servidor
        ↓
4 reservas
        ↓
Crear nueva reserva
        ↓
5 reservas
        ↓
Reiniciar servidor
        ↓
4 reservas nuevamente
Estructura del proyecto
tp-05-salas-middleware/
│
├── public/
│   └── css/
│       └── estilos.css
│
├── src/
│   └── index.js
│
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   │
│   ├── reservas/
│   │   ├── lista.ejs
│   │   └── detalle.ejs
│   │
│   ├── inicio.ejs
│   ├── nueva.ejs
│   └── no-encontrado.ejs
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
Tecnologías utilizadas
Node.js
Express
EJS
express-ejs-layouts
Morgan
HTML5
CSS3
Scripts disponibles
Iniciar el servidor
npm start

Ejecuta:

node src/index.js
Verificar sintaxis
npm run check

Ejecuta:

node --check src/index.js
Dependencias

El proyecto utiliza las siguientes dependencias:

express
ejs
express-ejs-layouts
morgan

Las dependencias se encuentran declaradas en:

package.json

y sus versiones exactas quedan registradas mediante:

package-lock.json
Alcance del proyecto

Este trabajo práctico está enfocado en el uso de middleware y el procesamiento de solicitudes HTTP con Express.

No se utilizan:

Base de datos.
Autenticación.
Sesiones.
Cookies.
Persistencia en archivos.
Routers separados en diferentes archivos.
Controladores externos.
Servicios externos.
Middleware centralizado de errores.

El objetivo principal es comprender el funcionamiento del pipeline de middleware, el uso de next(), res.locals, eventos de respuesta, routers, validación y códigos de estado HTTP.

Conclusión

El proyecto implementa un sistema básico de reservas de salas de estudio utilizando Express.

Se aplican diferentes tipos de middleware para:

Registrar solicitudes.
Identificar cada solicitud.
Medir la duración de las respuestas.
Procesar archivos estáticos.
Procesar formularios.
Procesar JSON.
Preparar información específica del router.
Validar datos.
Gestionar respuestas 404.

Las reservas funcionan de manera temporal y permanecen disponibles solamente durante la ejecución del servidor.