const { getSessionByPath } = require("../helpers/sessionHelper");

async function logout(req, res) {
	await req.session.destroy();
	return res.redirect("/login");
}

module.exports = { logout };
