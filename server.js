const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { getIronSession } = require("iron-session");
const { PrismaClient } = require("./generated/prisma");
const { compare, hash } = require("bcrypt");
const { routeTeacher } = require("./routes/teacher/root");
const { rootTeacherClasses } = require("./routes/teacher/classes");
const { studentforClass } = require("./routes/teacher/getstudentforClass");
const { gradePage } = require("./routes/teacher/gradingPage");
const { teacherSchedule } = require("./routes/teacher/schedule");
const { teacherMessages } = require("./routes/teacher/messages");
const { teacherLegacyRoot } = require("./routes/teacher/legacyRoot");

const app = express();
const port = 3000;

const SESSION_COOKIE = "session";
const SESSION_PASSWORD = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const db = new PrismaClient();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(async (req, res, next) => {
	req.session = await getIronSession(req, res, { password: SESSION_PASSWORD, cookieName: SESSION_COOKIE, cookieOptions: { secure: false } });
	await next();
});

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
	if (!req.session.id) {
		return res.redirect("/login");
	}
	if (req.session.role !== "admin") {
		return res.status(403).send("Access denied. Admin only.");
	}
	next();
};

// Middleware to check if user is teacher
const requireTeacher = (req, res, next) => {
	if (!req.session.id) {
		return res.redirect("/login");
	}
	if (req.session.role !== "teacher") {
		return res.status(403).send("Access denied. Teacher only.");
	}
	next();
};

app.get("/", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	if (req.session.role === "admin") {
		return res.redirect("/admin");
	}

	if (req.session.role === "teacher") {
		return res.redirect("/teacher");
	}

	try {
		const recentGrades = await db.grades.findMany({
			where: {
				student_id: req.session.id,
			},
			include: {
				subjects: true,
			},
			orderBy: {
				grade_date: "desc",
			},
			take: 3,
		});

		const recentMessages = [];

		const totalGrades = await db.grades.count({
			where: {
				student_id: req.session.id,
			},
		});

		res.render("student/index", {
			username: req.session.username,
			first_name: req.session.first_name || req.session.username,
			recentGrades: recentGrades,
			recentMessages: recentMessages,
			totalGrades: totalGrades,
		});
	} catch (error) {
		console.error("Hiba az adatok lekérésekor:", error);
		res.render("student/index", {
			username: req.session.username,
			first_name: req.session.first_name || req.session.username,
			recentGrades: [],
			recentMessages: [],
			totalGrades: 0,
		});
	}
});

// Admin Routes
app.get("/admin", requireAdmin, async (req, res) => {
	try {
		const users = await db.users.findMany({
			orderBy: [
				{ role: "asc" },
				{ last_name: "asc" },
			],
			select: {
				id: true,
				username: true,
				first_name: true,
				last_name: true,
				email: true,
				role: true,
			},
		});

		const stats = {
			totalUsers: users.length,
			students: users.filter(u => u.role === "student").length,
			teachers: users.filter(u => u.role === "teacher").length,
			admins: users.filter(u => u.role === "admin").length,
		};

		res.render("admin/admin-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			users: users,
			stats: stats,
		});
	} catch (error) {
		console.error("Hiba a felhasználók lekérésekor:", error);
		res.status(500).send("Hiba történt");
	}
});

app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
	try {
		const user = await db.users.findUnique({
			where: { id: parseInt(req.params.id) },
			select: {
				id: true,
				username: true,
				first_name: true,
				last_name: true,
				email: true,
				role: true,
			},
		});

		if (!user) {
			return res.status(404).json({ error: "Felhasználó nem található" });
		}

		res.json(user);
	} catch (error) {
		console.error("Hiba a felhasználó lekérésekor:", error);
		res.status(500).json({ error: "Hiba történt" });
	}
});

app.post("/api/admin/users", requireAdmin, async (req, res) => {
	try {
		const { username, password, first_name, last_name, email, role } = req.body;

		if (!username || !password || !first_name || !last_name || !role) {
			return res.status(400).json({ error: "Minden kötelező mezőt ki kell tölteni" });
		}

		const existingUser = await db.users.findUnique({
			where: { username: username },
		});

		if (existingUser) {
			return res.status(400).json({ error: "Ez a felhasználónév már foglalt" });
		}

		const hashedPassword = await hash(password, 10);

		const newUser = await db.users.create({
			data: {
				username: username,
				password_hash: hashedPassword,
				first_name: first_name,
				last_name: last_name,
				email: email || null,
				role: role,
			},
		});

		res.json({ success: true, user: newUser });
	} catch (error) {
		console.error("Hiba a felhasználó létrehozásakor:", error);
		res.status(500).json({ error: "Hiba történt a felhasználó létrehozásakor" });
	}
});

app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
	try {
		const userId = parseInt(req.params.id);
		const { username, password, first_name, last_name, email, role } = req.body;

		if (!username || !first_name || !last_name || !role) {
			return res.status(400).json({ error: "Minden kötelező mezőt ki kell tölteni" });
		}

		const existingUser = await db.users.findFirst({
			where: {
				username: username,
				NOT: { id: userId },
			},
		});

		if (existingUser) {
			return res.status(400).json({ error: "Ez a felhasználónév már foglalt" });
		}

		const updateData = {
			username: username,
			first_name: first_name,
			last_name: last_name,
			email: email || null,
			role: role,
		};

		if (password && password.trim() !== "") {
			updateData.password_hash = await hash(password, 10);
		}

		const updatedUser = await db.users.update({
			where: { id: userId },
			data: updateData,
		});

		res.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error("Hiba a felhasználó frissítésekor:", error);
		res.status(500).json({ error: "Hiba történt a felhasználó frissítésekor" });
	}
});

app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
	try {
		const userId = parseInt(req.params.id);

		if (userId === req.session.id) {
			return res.status(400).json({ error: "Nem törölheted a saját fiókodat" });
		}

		await db.users.delete({
			where: { id: userId },
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Hiba a felhasználó törlésekor:", error);
		res.status(500).json({ error: "Hiba történt a felhasználó törlésekor" });
	}
});

// ========================================
// TEACHER ROUTES
// ========================================

// Teacher Dashboard
app.get("/teacher", requireTeacher, routeTeacher);


// Teacher Classes Management
app.get("/teacher/classes", requireTeacher, rootTeacherClasses);



// Get students for a specific class
app.get("/api/teacher/class/:classId/subject/:subjectId/students", requireTeacher, studentforClass);

// Teacher Grading Page
app.get("/teacher/grading", requireTeacher, gradePage);

// Teacher Schedule
app.get("/teacher/schedule", requireTeacher, teacherSchedule);

// Teacher Messages
app.get("/teacher/messages", requireTeacher, teacherMessages);

// Legacy route redirect
app.get("/teacherui", requireTeacher, teacherLegacyRoot);

// ========================================
// STUDENT ROUTES
// ========================================

app.get("/courses", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	try {
		const studentClass = await db.student_classes.findFirst({
			where: {
				student_id: req.session.id,
				is_active: true,
			},
			include: {
				classes: true,
			},
		});

		if (!studentClass) {
			return res.render("student/courses", {
				username: req.session.username,
				timetable: [],
				className: null,
			});
		}

		const timetable = await db.timetable.findMany({
			where: {
				class_id: studentClass.class_id,
			},
			include: {
				subjects: true,
				users_timetable_teacher_idTousers: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
			},
			orderBy: [{ day_of_week: "asc" }, { lesson_number: "asc" }],
		});

		res.render("student/courses", {
			username: req.session.username,
			timetable: timetable,
			className: studentClass.classes.class_name,
		});
	} catch (error) {
		console.error("Hiba az órarend lekérésekor:", error);
		res.render("student/courses", {
			username: req.session.username,
			timetable: [],
			className: null,
		});
	}
});

app.get("/tasks", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");
	res.render("student/tasks.ejs", { username: req.session.username });
});

app.get("/messages", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");
	res.render("student/messages.ejs", { username: req.session.username });
});

app.get("/grades", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	try {
		const grades = await db.grades.findMany({
			where: { student_id: req.session.id },
			include: {
				subjects: true,
				users_grades_teacher_idTousers: {
					select: { first_name: true, last_name: true },
				},
			},
			orderBy: [{ subjects: { subject_name: "asc" } }, { grade_date: "asc" }],
		});

		const gradesBySubject = {};
		grades.forEach((grade) => {
			const subjectName = grade.subjects.subject_name;
			if (!gradesBySubject[subjectName]) {
				gradesBySubject[subjectName] = [];
			}
			gradesBySubject[subjectName].push(grade);
		});

		res.render("student/grades", {
			username: req.session.username,
			gradesBySubject: gradesBySubject,
		});
	} catch (error) {
		console.error("Hiba a jegyek lekérésekor:", error);
		res.render("student/grades", {
			username: req.session.username,
			gradesBySubject: {},
		});
	}
});

// ========================================
// AUTH & MESSAGE ROUTES
// ========================================

app.get("/login", async (req, res) => {
	if (req.session.id) return res.redirect("/");
	const error = req.query.error || null;
	res.render("login", { error });
});

app.post("/api/login", async (req, res) => {
	const data = await db.users.findFirst({
		where: { username: req.body.username },
	});

	let errorMessage = null;

	if (!data) {
		errorMessage = "Hibás felhasználónév vagy jelszó!";
	} else if (!(await compare(req.body.password, data.password_hash))) {
		errorMessage = "Hibás felhasználónév vagy jelszó!";
	}

	if (errorMessage) {
		return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
	}

	req.session.id = data.id;
	req.session.username = data.username;
	req.session.first_name = data.first_name;
	req.session.last_name = data.last_name;
	req.session.role = data.role;

	await req.session.save();

	if (data.role === "admin") {
		return res.redirect("/admin");
	} else if (data.role === "teacher") {
		return res.redirect("/teacher");
	} else {
		return res.redirect("/");
	}
});

app.get("/api/messages", async (req, res) => {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });
	return res.status(200).json({
		messages: [
			{ from: 1, title: "Uzenet Cime", content: "Teszt üzenet." },
			{ from: 1, title: "2. Uzenet Cime", content: "2. Teszt üzenet." },
			{ from: 1, title: "3. Uzenet Cime", content: "3. Teszt üzenet." },
		],
	});
});

app.get("/messages/sent", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");
	res.render("student/messages-sent.ejs", { username: req.session.username });
});

app.get("/messages/new", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");
	res.render("student/messages-new.ejs", { username: req.session.username });
});

app.get("/logout", async (req, res) => {
	await req.session.destroy();
	return res.redirect("/login");
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});