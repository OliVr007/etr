const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { PrismaClient } = require("./generated/prisma");

// Session helper
const { getSessionByPath, getSessionByRole } = require("./routes/helpers/sessionHelper");

// Middleware importálása
const { requireAdmin } = require("./routes/middleware/requireAdmin");
const { requireTeacher } = require("./routes/middleware/requireTeacher");
const { requireAuth } = require("./routes/middleware/requireAuth");

// Admin routes
const { adminUsers } = require("./routes/admin/adminUsers");
const { adminClasses } = require("./routes/admin/adminClasses");
const { adminSubjects } = require("./routes/admin/adminSubjects");
const { adminAssignments } = require("./routes/admin/adminAssignments");
const { getUser } = require("./routes/admin/getUser");
const { createUser } = require("./routes/admin/createUser");
const { updateUser } = require("./routes/admin/updateUser");
const { deleteUser } = require("./routes/admin/deleteUser");
const { createClass } = require("./routes/admin/createClass");
const { getClass } = require("./routes/admin/getClass");
const { updateClass } = require("./routes/admin/updateClass");
const { deleteClass } = require("./routes/admin/deleteClass");
const { getSubject, createSubject, updateSubject, deleteSubject } = require("./routes/admin/subjects");
const { createTeacherSubject, updateTeacherSubject, deleteTeacherSubject } = require("./routes/admin/teacherSubjects");

// Student routes
const { studentIndex } = require("./routes/student/index");
const { studentTasks } = require("./routes/student/tasks");
const { studentGrades } = require("./routes/student/grades");

// Student message routes
const { messagesReceived } = require("./routes/student/messages");
const { messagesSent } = require("./routes/student/messagesSent");
const { messagesNew } = require("./routes/student/messagesNew");

// Teacher routes
const { routeTeacher } = require("./routes/teacher/root");
const { studentforClass } = require("./routes/teacher/getStudentForClass");
const { gradePage, getGradingData, saveGrades, updateGrade, deleteGrade } = require("./routes/teacher/gradingPage");
const { teacherLegacyRoot } = require("./routes/teacher/legacyRoot");
const { teacherMessages } = require("./routes/teacher/messages");
const { teacherMessagesSent } = require("./routes/teacher/messagesSent");
const { teacherMessagesNew } = require("./routes/teacher/messagesNew");
const { teacherHomework } = require("./routes/teacher/homework");

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
const { getSubjectsForClass } = require("./routes/api/teacher/getSubjectsForClass");

// Homework API routes
const { createHomework } = require("./routes/api/teacher/createHomework");
const { getTeacherHomeworks } = require("./routes/api/teacher/getTeacherHomeworks");
const { acceptHomework } = require("./routes/api/teacher/acceptHomework");
const { getStudentHomeworks } = require("./routes/api/getStudentHomeworks");
const { submitHomework } = require("./routes/api/submitHomework");
const { deleteHomework } = require("./routes/api/deleteHomework");

const app = express();
const port = process.env.PORT || 3000;

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
	req.session = await getSessionByPath(req, res);
	req.getSessionByRole = (role) => getSessionByRole(req, res, role);
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
app.get("/admin", requireAdmin, adminUsers);
app.get("/admin/classes", requireAdmin, adminClasses);
app.get("/admin/subjects", requireAdmin, adminSubjects);
app.get("/admin/assignments", requireAdmin, adminAssignments);
app.get("/api/admin/users/:id", requireAdmin, getUser);
app.post("/api/admin/users", requireAdmin, createUser);
app.put("/api/admin/users/:id", requireAdmin, updateUser);
app.delete("/api/admin/users/:id", requireAdmin, deleteUser);
app.post("/api/admin/classes", requireAdmin, createClass);
app.get("/api/admin/classes/:id", requireAdmin, getClass);
app.put("/api/admin/classes/:id", requireAdmin, updateClass);
app.delete("/api/admin/classes/:id", requireAdmin, deleteClass);
app.get("/api/admin/subjects/:id", requireAdmin, getSubject);
app.post("/api/admin/subjects", requireAdmin, createSubject);
app.put("/api/admin/subjects/:id", requireAdmin, updateSubject);
app.delete("/api/admin/subjects/:id", requireAdmin, deleteSubject);
app.post("/api/admin/teacher-subjects", requireAdmin, createTeacherSubject);
app.put("/api/admin/teacher-subjects/:id", requireAdmin, updateTeacherSubject);
app.delete("/api/admin/teacher-subjects/:id", requireAdmin, deleteTeacherSubject);

// ========================================
// TEACHER ROUTES
// ========================================
app.get("/teacher", requireTeacher, routeTeacher);
app.get("/api/teacher/class/:classId/subject/:subjectId/students", requireTeacher, studentforClass);
app.get("/teacher/grading", requireTeacher, gradePage);
app.get("/teacher/messages", requireTeacher, teacherMessages);
app.get("/teacher/messages/sent", requireTeacher, teacherMessagesSent);
app.get("/teacher/messages/new", requireTeacher, teacherMessagesNew);
app.get("/teacher/homework", requireTeacher, teacherHomework);
app.get("/teacherui", requireTeacher, teacherLegacyRoot);

// ========================================
// TEACHER API ROUTES - Grading (Értékelés)
// ========================================
app.get("/api/teacher/grading/:classId/:subjectId", requireTeacher, getGradingData);
app.post("/api/teacher/grading/save", requireTeacher, saveGrades);
app.put("/api/teacher/grading/:gradeId", requireTeacher, updateGrade);
app.delete("/api/teacher/grading/:gradeId", requireTeacher, deleteGrade);

// ========================================
// STUDENT ROUTES
// ========================================
app.get("/tasks", requireAuth, studentTasks);
app.get("/grades", requireAuth, studentGrades);
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
app.get("/api/teacher/messages/users", requireTeacher, getAllUsers);
app.post("/api/teacher/messages/send", requireTeacher, sendMessage);
app.get("/api/teacher/classes", requireTeacher, getTeacherClasses);
app.get("/api/teacher/class/:classId/students", requireTeacher, getStudentsForClass);
app.get("/api/teacher/class/:classId/subjects", requireTeacher, getSubjectsForClass);

// ========================================
// TEACHER API ROUTES - Homework
// ========================================
app.post("/api/teacher/homework", requireTeacher, createHomework);
app.get("/api/teacher/homeworks", requireTeacher, getTeacherHomeworks);
app.put("/api/teacher/homework/accept/:submission_id", requireTeacher, acceptHomework);

// ========================================
// STUDENT API ROUTES - Homework
// ========================================
app.get("/api/student/homeworks", requireAuth, getStudentHomeworks);
app.put("/api/student/homework/submit/:submission_id", requireAuth, submitHomework);
app.delete("/api/student/homework/:submission_id", requireAuth, deleteHomework);

// ========================================
// SZERVER INDÍTÁSA
// ========================================
app.listen(port, () => {
	console.log(`Szerver fut a http://localhost:${port} címen`);
});
