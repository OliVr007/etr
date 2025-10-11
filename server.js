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
app.use(bodyParser.urlencoded());

app.use(async (req, res, next) => {
	req.session = await getIronSession(req, res, { password: SESSION_PASSWORD, cookieName: SESSION_COOKIE });

	await next();
});

app.get("/", async (req, res) => {
	if (!req.session.id) return res.redirect("/login");

	res.render("index", {
		user_name: req.session.user_name,
		full_name: req.session.full_name,
	});
});

app.get("/login", async (req, res) => {
	if (req.session.id) return res.redirect("/");
	res.render("login");
});

app.post("/api/login", async (req, res) => {
	console.log(req.body);

	const data = await db.users.findFirst({
		where: {
			user_name: req.body.username,
		},
	});

	if (!data) return redirect("/login");

	if (await compare(req.body.password, data.password)) {
		req.session.id = data.id;
		req.session.user_name = data.user_name;
		await req.session.save();
	}

	return res.redirect("/");
});

app.get("/logout", async (req, res) => {
	await req.session.destroy();

	return res.redirect("/login");
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
