const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { getIronSession } = require("iron-session");
const { PrismaClient } = require("./generated/prisma");

// Middleware importálása
const { requireAdmin } = require("./routes/middleware/requireAdmin");
const { requireTeacher } = require("./routes/middleware/requireTeacher");
const { requireAuth } = require("./routes/middleware/requireAuth");

// Admin routes
const { adminIndex } = require("./routes/admin/index");
const { getUser } = require("./routes/admin/getUser");
const { createUser } = require("./routes/admin/createUser");
const { updateUser } = require("./routes/admin/updateUser");
const { deleteUser } = require("./routes/admin/deleteUser");

// Student routes
const { studentIndex } = require("./routes/student/index");
const { studentCourses } = require("./routes/student/courses");
const { studentTasks } = require("./routes/student/tasks");
const { studentGrades } = require("./routes/student/grades");

// Student message routes
const { messagesReceived } = require("./routes/student/messages");
const { messagesSent } = require("./routes/student/messagesSent");
const { messagesNew } = require("./routes/student/messagesNew");

// Teacher routes
const { routeTeacher } = require("./routes/teacher/root");
const { rootTeacherClasses } = require("./routes/teacher/classes");
const { studentforClass } = require("./routes/teacher/getStudentForClass");
const { gradePage } = require("./routes/teacher/gradingPage");
const { teacherSchedule } = require("./routes/teacher/schedule");
const { teacherLegacyRoot } = require("./routes/teacher/legacyRoot");
const { teacherMessages } = require("./routes/teacher/messages");
const { teacherMessagesSent } = require("./routes/teacher/messagesSent");
const { teacherMessagesNew } = require("./routes/teacher/messagesNew");

// Auth routes
const { loginPage } = require("./routes/auth/login");
const { loginPost } = require("./routes/auth/loginPost");
const { logout } = require("./routes/auth/logout");

// API routes
const { getReceivedMessages } = require("./routes/api/getReceivedMessages");
const { getSentMessages } = require("./routes/api/getSentMessages");
const { getAllUsers } = require("./routes/api/getAllUsers");
const { sendMessage } = require("./routes/api/sendMessage");
const { markAsRead } = require("./routes/api/markAsRead");

// Teacher API routes for messages
const { getTeacherReceivedMessages } = require("./routes/api/teacher/getReceivedMessages");
const { getTeacherSentMessages } = require("./routes/api/teacher/getSentMessages");
const { getTeacherClasses } = require("./routes/api/teacher/getTeacherClasses");
const { getStudentsForClass } = require("./routes/api/teacher/getStudentsForClass");


const app = express();
const port = 3000;

const SESSION_COOKIE = "session";
const SESSION_PASSWORD = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

// Prisma Client inicializálása
const db = new PrismaClient();

// View engine beállítása
app.set("view engine", "ejs");

// Middleware-ek
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(async (req, res, next) => {
	req.session = await getIronSession(req, res, {
		password: SESSION_PASSWORD,
		cookieName: SESSION_COOKIE,
		cookieOptions: { secure: false },
	});

	// DB elérhetővé tétele minden route-ban
	req.db = db;

	await next();
});

// ========================================
// FŐOLDAL - szerepkör alapú átirányítás
// ========================================
app.get("/", requireAuth, studentIndex);

// ========================================
// ADMIN ROUTES
// ========================================
app.get("/admin", requireAdmin, adminIndex);
app.get("/api/admin/users/:id", requireAdmin, getUser);
app.post("/api/admin/users", requireAdmin, createUser);
app.put("/api/admin/users/:id", requireAdmin, updateUser);
app.delete("/api/admin/users/:id", requireAdmin, deleteUser);

// ========================================
// TEACHER ROUTES
// ========================================
app.get("/teacher", requireTeacher, routeTeacher);
app.get("/teacher/classes", requireTeacher, rootTeacherClasses);
app.get("/api/teacher/class/:classId/subject/:subjectId/students", requireTeacher, studentforClass);
app.get("/teacher/grading", requireTeacher, gradePage);
app.get("/teacher/schedule", requireTeacher, teacherSchedule);
app.get("/teacher/messages", requireTeacher, teacherMessages);
app.get("/teacher/messages/sent", requireTeacher, teacherMessagesSent);
app.get("/teacher/messages/new", requireTeacher, teacherMessagesNew);
app.get("/teacherui", requireTeacher, teacherLegacyRoot); // Legacy átirányítás

// ========================================
// STUDENT ROUTES
// ========================================
app.get("/courses", requireAuth, studentCourses);
app.get("/tasks", requireAuth, studentTasks);
app.get("/grades", requireAuth, studentGrades);

// Student message pages
app.get("/messages", requireAuth, messagesReceived);
app.get("/messages/sent", requireAuth, messagesSent);
app.get("/messages/new", requireAuth, messagesNew);

// ========================================
// AUTH ROUTES
// ========================================
app.get("/login", loginPage);
app.post("/api/login", loginPost);
app.get("/logout", logout);

// ========================================
// API ROUTES - Messages
// ========================================
app.get("/api/messages/received", requireAuth, getReceivedMessages);
app.get("/api/messages/sent", requireAuth, getSentMessages);
app.get("/api/messages/users", requireAuth, getAllUsers);
app.post("/api/messages/send", requireAuth, sendMessage);
app.put("/api/messages/:id/read", requireAuth, markAsRead);

// ========================================
// TEACHER API ROUTES - Messages
// ========================================
app.get("/api/teacher/messages/received", requireTeacher, getTeacherReceivedMessages);
app.get("/api/teacher/messages/sent", requireTeacher, getTeacherSentMessages);
app.get("/api/teacher/classes", requireTeacher, getTeacherClasses);
app.get("/api/teacher/class/:classId/students", requireTeacher, getStudentsForClass);

// ========================================
// SZERVER INDÍTÁSA
// ========================================
app.listen(port, () => {
	console.log(`Szerver fut a http://localhost:${port} címen`);
});
