const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const loggerMiddleware = require("./middleware/logger.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// ===============================
// Security
// ===============================
app.use(helmet());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://edge-website-six.vercel.app",
    "https://realestate-admin-eight.vercel.app",
    // Production origins come from env (comma-separated), e.g.
    // CORS_ORIGIN=https://edgemilerealty.tech,https://admin.edgemilerealty.tech
    ...(process.env.CORS_ORIGIN || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow Postman / Thunder Client / Server-to-Server
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "token",
    ],
};

app.use(cors(corsOptions));

// ===============================
// Body Parser
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Logger
// ===============================
app.use(morgan("dev"));
app.use(loggerMiddleware);

// ===============================
// Static Files
// ===============================
// Uploaded images are consumed by the website/admin which run on other
// origins (localhost:5173, Vercel). Helmet's default
// `Cross-Origin-Resource-Policy: same-origin` makes the browser refuse to
// render them (ERR_BLOCKED_BY_RESPONSE.NotSameOrigin), so relax CORP for
// this public directory only — API responses keep helmet's strict defaults.
app.use(
    "/uploads",
    (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
    },
    express.static("uploads")
);

// ===============================
// API Routes
// ===============================
app.use(`/api/${process.env.API_VERSION}`, require("./routes"));

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Real Estate API Running...",
        version: process.env.API_VERSION,
    });
});

// ===============================
// 404
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});

// ===============================
// Error Handler
// ===============================
app.use(errorMiddleware);

module.exports = app;