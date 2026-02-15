// Tanári főoldal
async function routeTeacher(req, res) {
	try {
		const db = req.db;
		const teacherId = req.session.id;

		// Legutóbbi értékelések lekérése
		const recentGradesData = await db.grades.findMany({
			where: {
				teacher_id: teacherId,
			},
			include: {
				users_grades_student_idTousers: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
				subjects: true,
			},
			orderBy: {
				grade_date: "desc",
			},
			take: 3,
		});

		// Értékelések formázása
		const recentGrades = recentGradesData.map((grade) => {
			const student = grade.users_grades_student_idTousers;
			return {
				student_name: `${student.last_name} ${student.first_name}`,
				subject_name: grade.subjects.subject_name,
				class_name: grade.grade_type,
				grade: grade.grade_value,
				grade_date: grade.grade_date,
			};
		});

		// Legutóbbi házi feladatok lekérése
		const recentHomeworkData = await db.homework.findMany({
			where: {
				teacher_id: teacherId,
			},
			include: {
				classes: true,
				subjects: true, // JAVÍTVA: subjects tábla hozzáadva
			},
			orderBy: {
				created_at: "desc",
			},
			take: 5,
		});

		// Házi feladatok formázása
		const recentHomework = recentHomeworkData.map((hw) => {
			const now = new Date();
			const dueDate = new Date(hw.due_date);
			let status = "Aktív";
			if (dueDate < now) {
				status = "Lejárt";
			}
			return {
				title: hw.title || "Névtelen feladat",
				subject_name: hw.subjects?.subject_name || "N/A", // JAVÍTVA: hw.subject helyett hw.subjects?.subject_name
				class_name: hw.classes?.class_name || "N/A",
				due_date: hw.due_date,
				status: status,
			};
		});

		// Legutóbbi üzenetek lekérése
		const recentMessages = await db.messages.findMany({
			where: {
				receiver_id: teacherId,
			},
			include: {
				users_messages_sender_idTousers: {
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
			take: 4,
		});

		// Üzenetek formázása
		const formattedMessages = recentMessages.map((msg) => {
			const sender = msg.users_messages_sender_idTousers;
			return {
				id: msg.id,
				sender_name: `${sender.last_name} ${sender.first_name}`,
				sender_role: sender.role,
				subject: msg.title,
				content_preview: msg.content.length > 50 ? msg.content.substring(0, 50) + "…" : msg.content,
				sent_at: msg.created_at,
				is_read: msg.is_read,
			};
		});

		// Statisztikák
		const stats = {
			totalClasses: 0,
			totalStudents: 0,
			unreadMessagesCount: recentMessages.filter((m) => !m.is_read).length,
		};

		res.render("teacher/teacher-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			recentGrades: recentGrades,
			recentHomework: recentHomework,
			recentMessages: formattedMessages,
			stats: stats,
		});
	} catch (error) {
		console.error("Hiba a tanári felület betöltésekor:", error);
		res.render("teacher/teacher-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			recentGrades: [],
			recentHomework: [],
			recentMessages: [],
			stats: {
				totalClasses: 0,
				totalStudents: 0,
				unreadMessagesCount: 0,
			},
		});
	}
}

module.exports = { routeTeacher };
