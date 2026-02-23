const { getSessionByRole } = require("../helpers/sessionHelper");

async function logout(req, res) {
	const studentSession = await getSessionByRole(req, res, "student");
	const teacherSession = await getSessionByRole(req, res, "teacher");
	const adminSession = await getSessionByRole(req, res, "admin");

	await studentSession.destroy();
	await teacherSession.destroy();
	await adminSession.destroy();

	return res.redirect("/login");
}

module.exports = { logout };
