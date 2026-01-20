async function deleteHomework(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const { submission_id } = req.params;

		// Ellenőrizzük, hogy a diáké-e és elfogadott-e
		const submission = await req.db.homework_submissions.findFirst({
			where: {
				id: parseInt(submission_id),
				student_id: req.session.id,
				status: "accepted",
			},
		});

		if (!submission) {
			return res.status(400).json({ error: "Csak elfogadott házi feladatot törölhetsz" });
		}

		await req.db.homework_submissions.delete({
			where: { id: parseInt(submission_id) },
		});

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error("Hiba a törlésnél:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { deleteHomework };
