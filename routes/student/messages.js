async function messagesReceived(req, res) {
	if (!req.session.id) return res.redirect("/login");
	res.render("student/messages.ejs", { username: req.session.username });
}

module.exports = { messagesReceived };
