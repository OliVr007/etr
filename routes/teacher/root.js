// Tanári főoldal - áttekintés (hasonlóan a diák index-hez)
async function routeTeacher(req, res) {
	try {
		const db = req.db;
		const teacherId = req.session.id;

		// Mai nap meghatározása
		const today = new Date();
		const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1 = hétfő, 7 = vasárnap

		// Mai órák lekérése az órarendből
		const todayLessons = await db.timetable.findMany({
			where: {
				teacher_id: teacherId,
				day_of_week: dayOfWeek,
			},
			include: {
				classes: true,
				subjects: true,
			},
			orderBy: {
				lesson_number: "asc",
			},
		});

		// Óraidők definiálása
		const lessonTimes = {
			1: { start: "8:00", end: "8:45" },
			2: { start: "9:00", end: "9:45" },
			3: { start: "10:00", end: "10:45" },
			4: { start: "11:00", end: "11:45" },
			5: { start: "12:00", end: "12:45" },
			6: { start: "13:00", end: "13:45" },
			7: { start: "14:00", end: "14:45" },
			8: { start: "15:00", end: "15:45" },
		};

		// Mai órák formázása
		const formattedLessons = todayLessons.map((lesson) => {
			const time = lessonTimes[lesson.lesson_number] || { start: "?", end: "?" };
			return {
				subject_name: lesson.subjects.subject_name,
				class_name: lesson.classes.class_name,
				start_time: time.start,
				end_time: time.end,
				room_number: lesson.room_number || "N/A",
				lesson_number: lesson.lesson_number,
			};
		});

		// Osztályok áttekintése (egyedi osztály-tantárgy kombinációk)
		// Először próbáljuk a timetable-ből, ha nincs, akkor teacher_subjects-ből
		let teacherClasses = await db.timetable.findMany({
			where: {
				teacher_id: teacherId,
			},
			include: {
				classes: true,
				subjects: true,
			},
			distinct: ["class_id", "subject_id"],
		});

		// Ha nincs a timetable-ben, próbáljuk a teacher_subjects táblából
		if (teacherClasses.length === 0) {
			teacherClasses = await db.teacher_subjects.findMany({
				where: {
					teacher_id: teacherId,
				},
				include: {
					classes: true,
					subjects: true,
				},
			});
		}

		const classesOverview = [];
		const seen = new Set();

		for (const tc of teacherClasses) {
			const key = `${tc.class_id}-${tc.subject_id}`;
			if (!seen.has(key)) {
				seen.add(key);

				// Diákok száma ebben az osztályban
				const studentCount = await db.student_classes.count({
					where: {
						class_id: tc.class_id,
						is_active: true,
					},
				});

				// Átlag jegy ehhez az osztályhoz és tantárgyhoz
				const studentIds = await db.student_classes.findMany({
					where: {
						class_id: tc.class_id,
						is_active: true,
					},
					select: { student_id: true },
				});

				let averageGrade = 0;
				let gradeLabel = "N/A";

				if (studentIds.length > 0) {
					const grades = await db.grades.findMany({
						where: {
							subject_id: tc.subject_id,
							student_id: {
								in: studentIds.map((sc) => sc.student_id),
							},
						},
						select: {
							grade_value: true,
						},
					});

					if (grades.length > 0) {
						const sum = grades.reduce((acc, g) => acc + parseFloat(g.grade_value), 0);
						averageGrade = (sum / grades.length).toFixed(2);

						if (averageGrade >= 4.5) gradeLabel = "Kiváló";
						else if (averageGrade >= 3.5) gradeLabel = "Jó";
						else if (averageGrade >= 2.5) gradeLabel = "Közepes";
						else gradeLabel = "Elégséges";
					}
				}

				classesOverview.push({
					class_id: tc.class_id,
					class_name: tc.classes.class_name,
					subject_id: tc.subject_id,
					subject_name: tc.subjects.subject_name,
					student_count: studentCount,
					average_grade: averageGrade,
					grade_label: gradeLabel,
				});
			}
		}

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
			totalClasses: classesOverview.length,
			totalStudents: classesOverview.reduce((sum, c) => sum + c.student_count, 0),
			todayLessonsCount: formattedLessons.length,
			unreadMessagesCount: recentMessages.filter((m) => !m.is_read).length,
		};

		res.render("teacher/teacher-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			todayLessons: formattedLessons,
			classesOverview: classesOverview,
			recentMessages: formattedMessages,
			stats: stats,
		});
	} catch (error) {
		console.error("Hiba a tanári felület betöltésekor:", error);
		res.render("teacher/teacher-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			todayLessons: [],
			classesOverview: [],
			recentMessages: [],
			stats: {
				totalClasses: 0,
				totalStudents: 0,
				todayLessonsCount: 0,
				unreadMessagesCount: 0,
			},
		});
	}
}

module.exports = { routeTeacher };
