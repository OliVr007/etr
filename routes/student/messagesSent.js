async function messagesSent(req, res) {
	if (!req.session.id) return res.redirect("/login");
	res.render("student/messages-sent.ejs", { username: req.session.username });
}

module.exports = { messagesSent };
