async function messagesNew(req, res) {
	if (!req.session.id) return res.redirect("/login");
	res.render("student/messages-new.ejs", { username: req.session.username });
}

module.exports = { messagesNew };
