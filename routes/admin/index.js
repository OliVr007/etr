// Admin főoldal - felhasználók listázása és statisztikák
async function adminIndex(req, res) {
	try {
		const db = req.db;
		const users = await db.users.findMany({
			orderBy: [{ role: "asc" }, { last_name: "asc" }],
			select: {
				id: true,
				username: true,
				first_name: true,
				last_name: true,
				email: true,
				role: true,
			},
		});

		const stats = {
			totalUsers: users.length,
			students: users.filter((u) => u.role === "student").length,
			teachers: users.filter((u) => u.role === "teacher").length,
			admins: users.filter((u) => u.role === "admin").length,
		};

		res.render("admin/admin-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			users: users,
			stats: stats,
		});
	} catch (error) {
		console.error("Hiba a felhasználók lekérésekor:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { adminIndex };
