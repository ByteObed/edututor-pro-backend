// backend/server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { majors, coursesData } = require("./Data-info/courses-data");

const app = express();
const PORT = process.env.PORT || 5000;

// Path to students.json
const studentsFilePath = path.join(__dirname, "Data-info", "students.json");

/* ========= MIDDLEWARE ========= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://edututor-pro.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ========= HELPER FUNCTIONS ========= */
function readStudents() {
  try {
    const data = fs.readFileSync(studentsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeStudents(students) {
  fs.writeFileSync(studentsFilePath, JSON.stringify(students, null, 2));
}

/* ========= API ROUTES ========= */

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "EduTutor Pro API is running 🚀" });
});

// ✅ Get majors
app.get("/api/majors", (req, res) => {
  res.json(majors);
});

// ✅ Get all courses (flattened)
app.get("/api/courses", (req, res) => {
  const allCourses = [];
  Object.keys(coursesData).forEach((major) => {
    coursesData[major].forEach((course) => {
      allCourses.push({ ...course, major });
    });
  });
  res.json(allCourses);
});

// ✅ Get courses by major
app.get("/api/courses/:majorName", (req, res) => {
  const { majorName } = req.params;
  const courses = coursesData[majorName];
  if (!courses) {
    return res.status(404).json({ message: "Major not found ❌" });
  }
  res.json(courses);
});

/* ========= STUDENT ENDPOINTS ========= */

// 🔹 Register a new student (only creates once)
app.post("/api/students/register", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required!" });
  }

  let students = readStudents();

  const existingStudent = students.find(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );

  if (existingStudent) {
    return res.status(200).json({
      message: "Student already registered ✅",
      student: existingStudent,
    });
  }

  const newStudent = {
    id: students.length + 1,
    name,
    email,
    selectedCourses: [],
  };

  students.push(newStudent);
  writeStudents(students);

  return res.status(201).json({
    message: "Student registered successfully ✅",
    student: newStudent,
  });
});

// 🔹 Complete registration (add or merge courses)
app.post("/api/students/complete-registration", (req, res) => {
  const { name, email, selectedCourses } = req.body;

  if (!email || !selectedCourses || !Array.isArray(selectedCourses)) {
    return res.status(400).json({ message: "Invalid registration data!" });
  }

  let students = readStudents();
  const studentIndex = students.findIndex(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );

  if (studentIndex === -1) {
    // New student
    const newStudent = {
      id: students.length + 1,
      name: name || "Unknown",
      email,
      selectedCourses,
    };
    students.push(newStudent);
    writeStudents(students);

    return res.status(201).json({
      message: "Registration complete ✅",
      student: newStudent,
    });
  }

  // Existing student — merge new courses (no duplicates)
  const existingCourses = students[studentIndex].selectedCourses || [];
  const newCourses = selectedCourses.filter(
    (c) => !existingCourses.some((ec) => ec.id === c.id)
  );

  students[studentIndex].selectedCourses = [...existingCourses, ...newCourses];
  writeStudents(students);

  return res.status(200).json({
    message: "Registration updated successfully ✅",
    student: students[studentIndex],
  });
});

// 🔹 Get student by email
app.get("/api/students/email/:email", (req, res) => {
  const { email } = req.params;
  const students = readStudents();
  const student = students.find(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found ❌" });
  }

  res.json(student);
});

// 🔹 Register/add a single course manually
app.post("/api/students/register-course", (req, res) => {
  const { email, course } = req.body;

  if (!email || !course) {
    return res.status(400).json({ message: "Email and course are required!" });
  }

  let students = readStudents();
  let student = students.find(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );

  if (!student) {
    student = {
      id: students.length + 1,
      name: "Unknown",
      email,
      selectedCourses: [],
    };
    students.push(student);
  }

  const alreadyExists = student.selectedCourses.some((c) => c.id === course.id);
  if (!alreadyExists) {
    student.selectedCourses.push(course);
    writeStudents(students);
  }

  res.json({
    message: "Course registered successfully ✅",
    student,
  });
});

// 🔹 Get all students
app.get("/api/students", (req, res) => {
  const students = readStudents();
  res.json(students);
});

// 🔹 Update student’s courses
app.put("/api/students/:id/update-courses", (req, res) => {
  const { id } = req.params;
  const { selectedCourses } = req.body;

  let students = readStudents();
  const student = students.find((s) => s.id == id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  student.selectedCourses = selectedCourses || student.selectedCourses;
  writeStudents(students);

  res.json({
    message: "Courses updated successfully ✅",
    student,
  });
});

// 🔹 Delete student
app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  let students = readStudents();
  const index = students.findIndex((s) => s.id == id);

  if (index === -1) {
    return res.status(404).json({ message: "Student not found ❌" });
  }

  const deletedStudent = students.splice(index, 1);
  writeStudents(students);

  res.json({
    message: "Student deleted successfully 🗑️",
    student: deletedStudent[0],
  });
});

/* ========= START SERVER ========= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 EduTutor Pro Backend running at http://0.0.0.0:${PORT}`);
  console.log(`📚 API endpoints available at http://localhost:${PORT}/api`);
});
