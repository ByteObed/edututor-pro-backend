// @ts-check
/// <reference types="node" />

// config.js

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || "localhost",
    environment: process.env.NODE_ENV || "development",
  },

  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },

  // API Configuration
  api: {
    prefix: "/api",
    timeout: 30000,
  },

  // Application Configuration
  app: {
    name: "EduTutor Pro Backend",
    version: "1.0.0",
    description: "Backend API for EduTutor Pro Course Registration System",
  },
};

// ✅ ESM export
export default config;
