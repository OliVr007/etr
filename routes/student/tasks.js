// Házi feladatok oldal
async function studentTasks(req, res) {
	res.render("student/tasks.ejs", {
		username: req.session.username,
	});
}

module.exports = { studentTasks };
