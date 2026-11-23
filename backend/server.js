const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { seedDatabaseIfEmpty } = require("./utils/seedData");

const blogRoutes = require("./routes/blogRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const contactRoute = require("./routes/contactRoute");
const commentRoutes = require("./routes/commentRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

dotenv.config();
const app = express();

// Dynamic CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Codenest Blog Publishing API",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use("/api", blogRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact-form", contactRoute);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Centralized 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: "Endpoint not found", path: req.originalUrl });
  }
  next();
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("[Codenest Error]:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500
  });
});

// Resilient MongoDB connection & automatic seeding
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/codenest";
mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 3000 })
  .then(async () => {
    console.log("✅ [Codenest Backend] MongoDB connected successfully to " + mongoUri);
    await seedDatabaseIfEmpty();
  })
  .catch(err => {
    console.warn(`[Codenest Backend] MongoDB connection warning: ${err.message}`);
    console.warn(`[Codenest Backend] Operating in resilient fallback mode (API and Health checks active).`);
  });

const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, '0.0.0.0', () => console.log(`✅ Codenest Blog API running on http://localhost:${PORT}`));
}

module.exports = app;
