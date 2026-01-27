const { getIronSession } = require("iron-session");

const SESSION_PASSWORD = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const SESSION_COOKIES = {
	student: "session_student",
	teacher: "session_teacher",
	admin: "session_admin",
};

const getSessionOptions = (cookieName) => ({
	password: SESSION_PASSWORD,
	cookieName: cookieName,
	cookieOptions: { secure: false },
});

async function getSessionByPath(req, res) {
	const path = req.path;

	if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
		return await getIronSession(req, res, getSessionOptions(SESSION_COOKIES.admin));
	} else if (path.startsWith("/teacher") || path.startsWith("/api/teacher")) {
		return await getIronSession(req, res, getSessionOptions(SESSION_COOKIES.teacher));
	} else {
		return await getIronSession(req, res, getSessionOptions(SESSION_COOKIES.student));
	}
}

async function getSessionByRole(req, res, role) {
	const cookieName = SESSION_COOKIES[role] || SESSION_COOKIES.student;
	return await getIronSession(req, res, getSessionOptions(cookieName));
}

module.exports = { SESSION_COOKIES, getSessionByPath, getSessionByRole, getSessionOptions, SESSION_PASSWORD };
