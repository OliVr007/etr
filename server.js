const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { getIronSession } = require("iron-session");
const { PrismaClient } = require("./generated/prisma");
const { compare } = require("bcrypt");

const app = express();
const port = 3000;

const SESSION_COOKIE = "session";
const SESSION_PASSWORD = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const db = new PrismaClient();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
	req.session = await getIronSession(req, res, { password: SESSION_PASSWORD, cookieName: SESSION_COOKIE });

	await next();
});

app.get("/", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	try {
		// Legutóbbi jegyek (top 3)
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

		// Üzenetek (később implementálható, most üres tömb)
		const recentMessages = [];

		// Statisztika - jegyek száma
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

app.get("/courses", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	try {
		console.log("User ID:", req.session.id);

		// Diák osztályának lekérése
		const studentClass = await db.student_classes.findFirst({
			where: {
				student_id: req.session.id,
				is_active: true, // ← VÁLTOZOTT: 1 helyett true
			},
			include: {
				classes: true,
			},
		});

		console.log("Student class:", studentClass);

		if (!studentClass) {
			console.log("HIBA: Nincs osztály hozzárendelve!");
			return res.render("student/courses", {
				username: req.session.username,
				timetable: [],
				className: null,
			});
		}

		// Órarend lekérése
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

		console.log("Timetable count:", timetable.length);

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

	res.render("student/tasks.ejs", {
		username: req.session.username,
	});
});

app.get("/messages", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	res.render("student/messages.ejs", {
		username: req.session.username,
	});
});

app.get("/teacherui", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	if (req.session.role !== "teacher") {
		return res.redirect("/");
	}

	res.render("teacher/teacher-index.ejs", {
		username: req.session.username,
		first_name: req.session.first_name,
	});
});

app.get("/login", async (req, res) => {
	if (req.session.id) return res.redirect("/");

	// Hibaüzenet átadása, ha van
	const error = req.query.error || null;
	res.render("login", { error });
});

app.post("/api/login", async (req, res) => {
	console.log(req.body);
	const data = await db.users.findFirst({
		where: {
			username: req.body.username,
		},
	});

	let errorMessage = null;

	if (!data) {
		errorMessage = "Hibás felhasználónév vagy jelszó!";
	} else if (!(await compare(req.body.password, data.password_hash))) {
		errorMessage = "Hibás felhasználónév vagy jelszó!";
	}

	if (errorMessage) {
		// Hiba esetén visszairányítjuk a login oldalra hibaüzenettel
		return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
	}

	// Sikeres bejelentkezés
	req.session.id = data.id;
	req.session.username = data.username;
	req.session.first_name = data.first_name; // ÚJ SOR
	req.session.last_name = data.last_name; // ÚJ SOR (opcionális)
	req.session.role = data.role;

	await req.session.save();

	if (data.role === "teacher") {
		return res.redirect("/teacherui");
	} else {
		return res.redirect("/");
	}
});

app.get("/api/messages", async (req, res) => {
	if (!req.session.id)
		return res.status(401).json({
			error: "unauthorized",
		});

	return res.status(200).json({
		messages: [
			{
				from: 1,
				title: "Uzenet Cime",
				content: "Teszt üzenet.",
			},
			{
				from: 1,
				title: "2. Uzenet Cime",
				content: "2. Teszt üzenet.",
			},
			{
				from: 1,
				title: "3. Uzenet Cime",
				content: "3. Teszt üzenet.",
			},
		],
	});
});

app.get("/messages/sent", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	res.render("student/messages-sent.ejs", {
		username: req.session.username,
	});
});

app.get("/messages/new", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	res.render("student/messages-new.ejs", {
		username: req.session.username,
	});
});

app.get("/logout", async (req, res) => {
	await req.session.destroy();

	return res.redirect("/login");
});

app.get("/grades", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	try {
		// Diák összes jegye tantárgyak szerint csoportosítva
		const grades = await db.grades.findMany({
			where: {
				student_id: req.session.id,
			},
			include: {
				subjects: true,
				users_grades_teacher_idTousers: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
			},
			orderBy: [{ subjects: { subject_name: "asc" } }, { grade_date: "asc" }],
		});

		// Csoportosítás tantárgyak szerint
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

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
