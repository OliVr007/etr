async function sendMessage(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	const { receiver_id, title, content } = req.body;

	if (!receiver_id || !title || !content) {
		return res.status(400).json({ error: "Minden mező kötelező" });
	}

	try {
		const message = await req.db.messages.create({
			data: {
				sender_id: req.session.id,
				receiver_id: parseInt(receiver_id),
				title: title,
				content: content,
			},
		});

		return res.status(200).json({ success: true, message });
	} catch (error) {
		console.error("Hiba az üzenet küldésekor:", error);
		return res.status(500).json({ error: "Hiba történt az üzenet küldésekor" });
	}
}

module.exports = { sendMessage };
