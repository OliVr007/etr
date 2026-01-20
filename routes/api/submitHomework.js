async function submitHomework(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const { submission_id } = req.params;

		const submission = await req.db.homework_submissions.update({
			where: {
				id: parseInt(submission_id),
				student_id: req.session.id,
			},
			data: {
				status: "submitted",
				submitted_at: new Date(),
			},
		});

		return res.status(200).json({ success: true, submission });
	} catch (error) {
		console.error("Hiba a beadáskor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { submitHomework };
