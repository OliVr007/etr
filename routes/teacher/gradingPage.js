// Enum mapping helper - frontend érték → Prisma enum kulcs
function mapGradeType(type) {
	const map = {
		dolgozat: "dolgozat",
		felelet: "felelet",
		házi: "h_zi",
		projekt: "projekt",
	};
	return map[type] || "felelet";
}

// Prisma enum kulcs → frontend érték (megjelenítéshez)
function reverseGradeType(type) {
	const map = {
		dolgozat: "dolgozat",
		felelet: "felelet",
		h_zi: "házi",
		projekt: "projekt",
	};
	return map[type] || type;
}

// Értékelési oldal megjelenítése
async function gradePage(req, res) {
	try {
		const db = req.db;
		const teacherId = req.session.id;

		// Csak teacher_subjects táblából kérdezünk le
		const teacherClasses = await db.teacher_subjects.findMany({
			where: { teacher_id: teacherId },
			include: { classes: true, subjects: true },
		});

		const occupations = [];
		const seen = new Set();

		for (const tc of teacherClasses) {
			const key = `${tc.class_id}-${tc.subject_id}`;
			if (!seen.has(key)) {
				seen.add(key);
				occupations.push({
					class_id: tc.class_id,
					class_name: tc.classes.class_name,
					subject_id: tc.subject_id,
					subject_name: tc.subjects.subject_name,
					label: `${tc.classes.class_name} - ${tc.subjects.subject_name}`,
				});
			}
		}

		occupations.sort((a, b) => a.label.localeCompare(b.label, "hu"));

		res.render("teacher/teacher-grading", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			occupations: occupations,
		});
	} catch (error) {
		console.error("Hiba az értékelési felület betöltésekor:", error);
		res.render("teacher/teacher-grading", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			occupations: [],
		});
	}
}

async function getGradingData(req, res) {
	try {
		const db = req.db;
		const teacherId = req.session.id;
		const classId = parseInt(req.params.classId);
		const subjectId = parseInt(req.params.subjectId);

		// JAVÍTVA: nem kérünk academic_year-t, csak a szükséges mezőket
		const studentClasses = await db.student_classes.findMany({
			where: { class_id: classId, is_active: true },
			select: {
				id: true,
				student_id: true,
				class_id: true,
				enrollment_date: true,
				is_active: true,
				users: { select: { id: true, first_name: true, last_name: true } },
			},
		});

		const students = studentClasses
			.map((sc) => ({
				id: sc.users.id,
				name: `${sc.users.last_name} ${sc.users.first_name}`,
				last_name: sc.users.last_name,
				first_name: sc.users.first_name,
			}))
			.sort((a, b) => a.name.localeCompare(b.name, "hu"));

		const studentIds = students.map((s) => s.id);

		const grades = await db.grades.findMany({
			where: {
				subject_id: subjectId,
				student_id: { in: studentIds },
			},
			include: {
				users_grades_teacher_idTousers: {
					select: { first_name: true, last_name: true },
				},
			},
			orderBy: { grade_date: "asc" },
		});

		const gradesByStudent = {};
		for (const student of students) {
			gradesByStudent[student.id] = { student, grades: [], average: 0 };
		}

		for (const grade of grades) {
			if (gradesByStudent[grade.student_id]) {
				const teacher = grade.users_grades_teacher_idTousers;
				gradesByStudent[grade.student_id].grades.push({
					id: grade.id,
					value: parseFloat(grade.grade_value),
					type: reverseGradeType(grade.grade_type),
					description: grade.description,
					date: grade.grade_date,
					is_final: grade.is_final,
					weight: grade.weight,
					teacher_name: `${teacher.last_name} ${teacher.first_name}`,
				});
			}
		}

		for (const studentId of Object.keys(gradesByStudent)) {
			const studentGrades = gradesByStudent[studentId].grades.filter((g) => !g.is_final);
			if (studentGrades.length > 0) {
				let weightedSum = 0;
				let totalWeight = 0;
				for (const g of studentGrades) {
					weightedSum += g.value * (g.weight || 1);
					totalWeight += g.weight || 1;
				}
				gradesByStudent[studentId].average = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : 0;
			}
		}

		res.json({ success: true, students, gradesByStudent });
	} catch (error) {
		console.error("Hiba az értékelési adatok lekérésekor:", error);
		res.status(500).json({ success: false, error: "Hiba történt az adatok lekérésekor" });
	}
}

async function saveGrades(req, res) {
	try {
		const db = req.db;
		const teacherId = req.session.id;
		const { grades } = req.body;

		if (!grades || !Array.isArray(grades) || grades.length === 0) {
			return res.status(400).json({ success: false, error: "Nincs mentendő értékelés" });
		}

		const created = [];

		for (const grade of grades) {
			// ✅ JAVÍTVA: grade_date ellenőrzése hozzáadva
			if (!grade.student_id || !grade.subject_id || grade.grade_value === undefined || grade.grade_value === null || grade.grade_value === "" || !grade.grade_date) {
				continue;
			}

			const gradeValue = parseFloat(grade.grade_value);
			if (isNaN(gradeValue) || gradeValue < 1 || gradeValue > 5) continue;

			// ✅ JAVÍTVA: Invalid Date ellenőrzése mentés előtt
			const gradeDate = new Date(grade.grade_date);
			if (isNaN(gradeDate.getTime())) continue;

			const newGrade = await db.grades.create({
				data: {
					student_id: parseInt(grade.student_id),
					subject_id: parseInt(grade.subject_id),
					teacher_id: teacherId,
					grade_value: gradeValue,
					grade_type: mapGradeType(grade.grade_type),
					description: grade.description || null,
					grade_date: gradeDate,
					is_final: grade.is_final || false,
					weight: parseInt(grade.weight) || 1,
				},
			});
			created.push(newGrade);
		}

		res.json({ success: true, message: `${created.length} értékelés sikeresen mentve`, count: created.length });
	} catch (error) {
		console.error("Hiba az értékelés mentésekor:", error);
		res.status(500).json({ success: false, error: "Hiba történt az értékelés mentésekor" });
	}
}

async function updateGrade(req, res) {
	try {
		const db = req.db;
		const teacherId = req.session.id;
		const gradeId = parseInt(req.params.gradeId);
		const { grade_value, grade_type, description, grade_date, weight } = req.body;

		// ✅ JAVÍTVA: grade_date validáció hozzáadva
		if (!grade_date) {
			return res.status(400).json({ success: false, error: "A dátum megadása kötelező" });
		}
		const gradeDate = new Date(grade_date);
		if (isNaN(gradeDate.getTime())) {
			return res.status(400).json({ success: false, error: "Érvénytelen dátum formátum" });
		}

		const existingGrade = await db.grades.findUnique({ where: { id: gradeId } });

		if (!existingGrade) return res.status(404).json({ success: false, error: "Értékelés nem található" });
		if (existingGrade.teacher_id !== teacherId) return res.status(403).json({ success: false, error: "Csak saját értékelést módosíthat" });

		const updated = await db.grades.update({
			where: { id: gradeId },
			data: {
				grade_value: parseFloat(grade_value),
				grade_type: mapGradeType(grade_type),
				description: description || null,
				grade_date: gradeDate,
				weight: parseInt(weight) || 1,
			},
		});

		res.json({ success: true, grade: updated });
	} catch (error) {
		console.error("Hiba az értékelés módosításakor:", error);
		res.status(500).json({ success: false, error: "Hiba történt" });
	}
}

async function deleteGrade(req, res) {
	try {
		const db = req.db;
		const teacherId = req.session.id;
		const gradeId = parseInt(req.params.gradeId);

		const existingGrade = await db.grades.findUnique({ where: { id: gradeId } });

		if (!existingGrade) return res.status(404).json({ success: false, error: "Értékelés nem található" });
		if (existingGrade.teacher_id !== teacherId) return res.status(403).json({ success: false, error: "Csak saját értékelést törölhet" });

		await db.grades.delete({ where: { id: gradeId } });
		res.json({ success: true, message: "Értékelés törölve" });
	} catch (error) {
		console.error("Hiba az értékelés törlésekor:", error);
		res.status(500).json({ success: false, error: "Hiba történt" });
	}
}

module.exports = { gradePage, getGradingData, saveGrades, updateGrade, deleteGrade };
