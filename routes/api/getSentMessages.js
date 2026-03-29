async function getSentMessages(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const messages = await req.db.messages.findMany({
			where: {
				sender_id: req.session.id,
			},
			include: {
				users_messages_receiver_idTousers: {
					select: {
						first_name: true,
						last_name: true,
						role: true,
					},
				},
			},
			orderBy: {
				created_at: "desc",
			},
		});

		// Formázás
		const formattedMessages = messages.map((msg) => ({
			id: msg.id,
			title: msg.title,
			content: msg.content,
			is_read: msg.is_read,
			created_at: msg.created_at,
			receiver: {
				first_name: msg.users_messages_receiver_idTousers.first_name,
				last_name: msg.users_messages_receiver_idTousers.last_name,
				role: msg.users_messages_receiver_idTousers.role,
			},
		}));

		return res.status(200).json({ messages: formattedMessages });
	} catch (error) {
		console.error("Hiba az üzenetek lekérésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getSentMessages };
