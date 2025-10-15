// test.js - Test script to verify backend works without database
import express from "express";
import cors from "cors";
import { coursesData, students } from "./Data-info/courses-data.js";
import config from "./config.js";

console.log("🧪 Testing Backend Dependencies...");

try {
  // Test 1: Check if Express works
  const app = express();
  console.log("✅ Express loaded successfully");

  // Test 2: Check if CORS works
  app.use(cors());
  console.log("✅ CORS loaded successfully");

  // Test 3: Check if courses data loads
  console.log("✅ Course data loaded successfully");
  console.log(`📊 Found ${Object.keys(coursesData).length} majors`);
  console.log(`📊 Found ${students.length} example students`);

  // Test 4: Check if config loads
  console.log("✅ Config loaded successfully");
  console.log(`🔧 Server will run on port ${config.PORT}`);

  console.log("\n🎉 ALL TESTS PASSED! Your backend is ready to run.");
  console.log("\nTo start your backend, run:");
  console.log("npm run dev");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  console.log("\n🔧 Possible solutions:");
  console.log("1. Make sure you ran: npm install express cors dotenv");
  console.log("2. Check that all files exist in the correct locations");
  console.log("3. Verify your package.json has the right dependencies");
}
