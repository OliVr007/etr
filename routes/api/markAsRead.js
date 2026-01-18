async function markAsRead(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	const messageId = parseInt(req.params.id);

	try {
		const message = await req.db.messages.findUnique({
			where: { id: messageId },
		});

		if (!message || message.receiver_id !== req.session.id) {
			return res.status(403).json({ error: "Nincs jogosultságod" });
		}

		await req.db.messages.update({
			where: { id: messageId },
			data: { is_read: true },
		});

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error("Hiba az üzenet frissítésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { markAsRead };
