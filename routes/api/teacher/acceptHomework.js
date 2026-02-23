async function acceptHomework(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const { submission_id } = req.params;

		// FIX: előbb ellenőrizzük hogy létezik-e
		const existing = await req.db.homework_submissions.findUnique({
			where: { id: parseInt(submission_id) },
		});

		if (!existing) {
			return res.status(404).json({ error: "Submission nem található" });
		}

		const submission = await req.db.homework_submissions.update({
			where: { id: parseInt(submission_id) },
			data: { status: "accepted", reviewed_at: new Date() },
		});

		return res.status(200).json({ success: true, submission });
	} catch (error) {
		console.error("Hiba az elfogadáskor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { acceptHomework };
