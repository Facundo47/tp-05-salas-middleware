const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");

const app = express();
const PORT = 3000;

// ===============================
// DATOS INICIALES
// ===============================

let reservas = [
    {
        id: 1,
        estudiante: "Facundo Tapia",
        email: "facundo@gmail.com",
        sala: "Sala Norte",
        fecha: "05/10/2026",
        turno: "Mañana",
        personas: 2
    },
    {
        id: 2,
        estudiante: "Juan Pérez",
        email: "juan@gmail.com",
        sala: "Sala Sur",
        fecha: "06/10/2026",
        turno: "Tarde",
        personas: 3
    },
    {
        id: 3,
        estudiante: "María López",
        email: "maria@gmail.com",
        sala: "Sala Multimedia",
        fecha: "07/10/2026",
        turno: "Noche",
        personas: 4
    },
    {
        id: 4,
        estudiante: "Carlos Gómez",
        email: "carlos@gmail.com",
        sala: "Sala Norte",
        fecha: "08/10/2026",
        turno: "Tarde",
        personas: 1
    }
];

const salasPermitidas = [
    "Sala Norte",
    "Sala Sur",
    "Sala Multimedia"
];

const turnosPermitidos = [
    "Mañana",
    "Tarde",
    "Noche"
];

// ===============================
// CONFIGURACIÓN
// ===============================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// ===============================
// IDENTIFICAR SOLICITUD
// ===============================

let contadorSolicitudes = 0;

function identificarSolicitud(req, res, next) {
    contadorSolicitudes++;

    const solicitudId = `BIB-${String(contadorSolicitudes).padStart(4, "0")}`;

    res.locals.solicitudId = solicitudId;

    next();
}

// ===============================
// MEDIR DURACIÓN
// ===============================

function medirDuracion(req, res, next) {
    const inicio = Date.now();

    res.on("finish", () => {
        const duracion = Date.now() - inicio;

        console.log(
            `ID: ${res.locals.solicitudId} | Método: ${req.method} | URL: ${req.originalUrl} | Estado: ${res.statusCode} | Duración: ${duracion} ms`
        );
    });

    next();
}

// ===============================
// MIDDLEWARES GLOBALES
// ===============================

app.use(morgan("dev"));

app.use(identificarSolicitud);

app.use(medirDuracion);

app.use(expressLayouts);

app.set("layout", "layouts/main");

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// ===============================
// INICIO
// ===============================

app.get("/", (req, res) => {
    res.render("inicio", {
        title: "Inicio"
    });
});

// ===============================
// ESTADO
// ===============================

app.get("/estado", (req, res) => {
    res.json({
        servicio: "activo",
        cantidadReservas: reservas.length,
        solicitudId: res.locals.solicitudId
    });
});

// ===============================
// ROUTER DE RESERVAS
// ===============================

const reservasRouter = express.Router();

// Middleware del área de reservas
function prepararAreaReservas(req, res, next) {
    res.locals.seccion = "Reservas de salas";
    next();
}

// IMPORTANTE:
// Este middleware va ANTES de las rutas.
reservasRouter.use(prepararAreaReservas);

// ===============================
// LISTA DE RESERVAS
// ===============================

reservasRouter.get("/", (req, res) => {
    res.render("reservas/lista", {
        title: "Reservas",
        reservas: reservas
    });
});

// ===============================
// NUEVA RESERVA
// ===============================

reservasRouter.get("/nueva", (req, res) => {
    res.render("nueva", {
        title: "Nueva reserva",
        valores: {},
        errores: [],
        salasPermitidas: salasPermitidas,
        turnosPermitidos: turnosPermitidos
    });
});

// ===============================
// DETALLE DE RESERVA
// ===============================

reservasRouter.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const reserva = reservas.find(
        reserva => reserva.id === id
    );

    if (!reserva) {
        return res.status(404).render("no-encontrado", {
            title: "Reserva no encontrada"
        });
    }

    res.render("reservas/detalle", {
        title: "Detalle de reserva",
        reserva: reserva
    });
});

// ===============================
// VALIDAR RESERVA
// ===============================

function validarReserva(req, res, next) {
    const estudiante = (req.body.estudiante || "").trim();
    const email = (req.body.email || "").trim();
    const sala = (req.body.sala || "").trim();
    const fecha = (req.body.fecha || "").trim();
    const turno = (req.body.turno || "").trim();
    const personas = Number(req.body.personas);

    const errores = [];

    if (!estudiante) {
        errores.push("El estudiante es obligatorio.");
    }

    if (!email) {
        errores.push("El email es obligatorio.");
    } else if (!email.includes("@")) {
        errores.push("El email debe contener @.");
    }

    if (!sala) {
        errores.push("La sala es obligatoria.");
    } else if (!salasPermitidas.includes(sala)) {
        errores.push("La sala seleccionada no es válida.");
    }

    if (!fecha) {
        errores.push("La fecha es obligatoria.");
    }

    if (!turno) {
        errores.push("El turno es obligatorio.");
    } else if (!turnosPermitidos.includes(turno)) {
        errores.push("El turno seleccionado no es válido.");
    }

    if (
        !Number.isInteger(personas) ||
        personas < 1 ||
        personas > 6
    ) {
        errores.push(
            "La cantidad de personas debe ser un número entero entre 1 y 6."
        );
    }

    // Si existen errores
    if (errores.length > 0) {
        return res.status(400).render("nueva", {
            title: "Nueva reserva",

            valores: {
                estudiante,
                email,
                sala,
                fecha,
                turno,
                personas: req.body.personas || ""
            },

            errores,

            salasPermitidas,
            turnosPermitidos
        });
    }

    // Datos validados
    req.reservaValidada = {
        estudiante,
        email,
        sala,
        fecha,
        turno,
        personas
    };

    next();
}

// ===============================
// CREAR RESERVA
// ===============================

function crearReserva(req, res) {
    const nuevaReserva = {
        id:
            reservas.length > 0
                ? Math.max(
                    ...reservas.map(reserva => reserva.id)
                ) + 1
                : 1,

        ...req.reservaValidada
    };

    reservas.push(nuevaReserva);

    res.redirect("/reservas");
}

// ===============================
// POST RESERVA
// ===============================

reservasRouter.post(
    "/",
    validarReserva,
    crearReserva
);

// ===============================
// MONTAR ROUTER
// ===============================

app.use("/reservas", reservasRouter);

// ===============================
// 404 FINAL
// ===============================

app.use((req, res) => {
    res.status(404).render("no-encontrado", {
        title: "Página no encontrada"
    });
});

// ===============================
// SERVIDOR
// ===============================

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});