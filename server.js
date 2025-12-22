const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const getIronSession = require("iron-session").getIronSession;
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

	res.render("student/index", {
		username: req.session.username,
	});
});

app.get("/courses", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	res.render("student/courses.ejs", {
		username: req.session.username,
	});
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

	res.render("student/grades.ejs", {
		username: req.session.username,
	});
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
