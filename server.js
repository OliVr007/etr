const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { getIronSession } = require("iron-session");
const { PrismaClient } = require("./generated/prisma");
const { compare, hash } = require("bcrypt");

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
app.get("/teacher", requireTeacher, async (req, res) => {
	try {
		res.render("teacher/teacher-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
		});
	} catch (error) {
		console.error("Hiba a tanári felület betöltésekor:", error);
		res.status(500).send("Hiba történt");
	}
});

// Teacher Classes Management
app.get("/teacher/classes", requireTeacher, async (req, res) => {
	try {
		// Get all classes where this teacher teaches
		const teacherClasses = await db.timetable.findMany({
			where: {
				teacher_id: req.session.id,
			},
			include: {
				classes: true,
				subjects: true,
			},
			distinct: ['class_id', 'subject_id'],
		});

		// Get unique class-subject combinations
		const uniqueClasses = [];
		const seen = new Set();

		for (const tc of teacherClasses) {
			const key = `${tc.class_id}-${tc.subject_id}`;
			if (!seen.has(key)) {
				seen.add(key);
				
				// Get student count for this class
				const studentCount = await db.student_classes.count({
					where: {
						class_id: tc.class_id,
						is_active: true,
					},
				});

				// Get average grade for this class and subject
				const grades = await db.grades.findMany({
					where: {
						subject_id: tc.subject_id,
						student_id: {
							in: (await db.student_classes.findMany({
								where: {
									class_id: tc.class_id,
									is_active: true,
								},
								select: { student_id: true },
							})).map(sc => sc.student_id),
						},
					},
					select: {
						grade_value: true,
					},
				});

				let averageGrade = 0;
				if (grades.length > 0) {
					const sum = grades.reduce((acc, g) => acc + parseFloat(g.grade_value), 0);
					averageGrade = (sum / grades.length).toFixed(2);
				}

				// Get grade distribution
				const gradeDistribution = {
					grade5: grades.filter(g => parseFloat(g.grade_value) === 5).length,
					grade4: grades.filter(g => parseFloat(g.grade_value) === 4).length,
					grade3: grades.filter(g => parseFloat(g.grade_value) === 3).length,
					grade2: grades.filter(g => parseFloat(g.grade_value) === 2).length,
					grade1: grades.filter(g => parseFloat(g.grade_value) === 1).length,
				};

				const total = grades.length || 1;
				const distribution = {
					grade5Percent: Math.round((gradeDistribution.grade5 / total) * 100),
					grade4Percent: Math.round((gradeDistribution.grade4 / total) * 100),
					grade3Percent: Math.round((gradeDistribution.grade3 / total) * 100),
					grade2Percent: Math.round((gradeDistribution.grade2 / total) * 100),
					grade1Percent: Math.round((gradeDistribution.grade1 / total) * 100),
				};

				// Get class teacher info
				const classInfo = await db.classes.findUnique({
					where: { id: tc.class_id },
					include: {
						users: {
							select: {
								first_name: true,
								last_name: true,
							},
						},
					},
				});

				// Get weekly hours for this subject in this class
				const weeklyHours = await db.timetable.count({
					where: {
						class_id: tc.class_id,
						subject_id: tc.subject_id,
						teacher_id: req.session.id,
					},
				});

				uniqueClasses.push({
					class_id: tc.class_id,
					class_name: tc.classes.class_name,
					subject_id: tc.subject_id,
					subject_name: tc.subjects.subject_name,
					student_count: studentCount,
					average_grade: averageGrade,
					distribution: distribution,
					class_teacher: classInfo.users ? `${classInfo.users.first_name} ${classInfo.users.last_name}` : 'N/A',
					weekly_hours: weeklyHours,
					room_number: tc.room_number || 'N/A',
				});
			}
		}

		// Calculate stats
		const stats = {
			totalClasses: uniqueClasses.length,
			totalStudents: uniqueClasses.reduce((sum, c) => sum + c.student_count, 0),
			averageClassGrade: uniqueClasses.length > 0 
				? (uniqueClasses.reduce((sum, c) => sum + parseFloat(c.average_grade), 0) / uniqueClasses.length).toFixed(2)
				: 0,
		};

		res.render("teacher/teacher-classes", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			classes: uniqueClasses,
			stats: stats,
		});
	} catch (error) {
		console.error("Hiba az osztályok lekérésekor:", error);
		res.render("teacher/teacher-classes", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			classes: [],
			stats: {
				totalClasses: 0,
				totalStudents: 0,
				averageClassGrade: 0,
			},
		});
	}
});

// Get students for a specific class
app.get("/api/teacher/class/:classId/subject/:subjectId/students", requireTeacher, async (req, res) => {
	try {
		const classId = parseInt(req.params.classId);
		const subjectId = parseInt(req.params.subjectId);

		// Get all students in this class
		const students = await db.student_classes.findMany({
			where: {
				class_id: classId,
				is_active: true,
			},
			include: {
				users: {
					select: {
						id: true,
						first_name: true,
						last_name: true,
					},
				},
			},
		});

		// Get grades and attendance for each student
		const studentsWithData = await Promise.all(students.map(async (student) => {
			// Get grades for this subject
			const grades = await db.grades.findMany({
				where: {
					student_id: student.student_id,
					subject_id: subjectId,
				},
				orderBy: {
					grade_date: 'desc',
				},
			});

			// Calculate average
			let average = 0;
			if (grades.length > 0) {
				const sum = grades.reduce((acc, g) => acc + parseFloat(g.grade_value), 0);
				average = (sum / grades.length).toFixed(2);
			}

			// Get last grade
			const lastGrade = grades[0] || null;

			// Get absences (you'll need to implement this based on your schema)
			const absences = 0; // Placeholder

			return {
				id: student.users.id,
				name: `${student.users.last_name} ${student.users.first_name}`,
				average: average,
				absences: absences,
				lastGrade: lastGrade ? {
					value: lastGrade.grade_value,
					date: lastGrade.grade_date,
				} : null,
			};
		}));

		res.json(studentsWithData);
	} catch (error) {
		console.error("Hiba a diákok lekérésekor:", error);
		res.status(500).json({ error: "Hiba történt" });
	}
});

// Teacher Grading Page
app.get("/teacher/grading", requireTeacher, async (req, res) => {
	try {
		res.render("teacher/teacher-grading", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
		});
	} catch (error) {
		console.error("Hiba az értékelési felület betöltésekor:", error);
		res.status(500).send("Hiba történt");
	}
});

// Teacher Schedule
app.get("/teacher/schedule", requireTeacher, async (req, res) => {
	try {
		const schedule = await db.timetable.findMany({
			where: {
				teacher_id: req.session.id,
			},
			include: {
				classes: true,
				subjects: true,
			},
			orderBy: [
				{ day_of_week: 'asc' },
				{ lesson_number: 'asc' },
			],
		});

		res.render("teacher/teacher-schedule", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			schedule: schedule,
		});
	} catch (error) {
		console.error("Hiba az órarend lekérésekor:", error);
		res.render("teacher/teacher-schedule", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			schedule: [],
		});
	}
});

// Teacher Messages
app.get("/teacher/messages", requireTeacher, async (req, res) => {
	try {
		res.render("teacher/teacher-messages", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
		});
	} catch (error) {
		console.error("Hiba az üzenetek betöltésekor:", error);
		res.status(500).send("Hiba történt");
	}
});

// Legacy route redirect
app.get("/teacherui", requireTeacher, (req, res) => {
	res.redirect("/teacher");
});

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