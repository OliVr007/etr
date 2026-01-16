async function teacherSchedule(req, res) {
    	try {
		const schedule = await db.timetable.findMany({
			where: {
				teacher_id: req.session.id,
			},
			include: {
				classes: true,
				subjects: true,
			},
			orderBy: [
				{ day_of_week: 'asc' },
				{ lesson_number: 'asc' },
			],
		});

		res.render("teacher/teacher-schedule", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			schedule: schedule,
		});
	} catch (error) {
		console.error("Hiba az órarend lekérésekor:", error);
		res.render("teacher/teacher-schedule", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			schedule: [],
		});
	}
}

module.exports = { teacherSchedule };