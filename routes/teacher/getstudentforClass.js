async function studentforClass(req, res) {
    	try {
		const classId = parseInt(req.params.classId);
		const subjectId = parseInt(req.params.subjectId);

		// Get all students in this class
		const students = await db.student_classes.findMany({
			where: {
				class_id: classId,
				is_active: true,
			},
			include: {
				users: {
					select: {
						id: true,
						first_name: true,
						last_name: true,
					},
				},
			},
		});

		// Get grades and attendance for each student
		const studentsWithData = await Promise.all(students.map(async (student) => {
			// Get grades for this subject
			const grades = await db.grades.findMany({
				where: {
					student_id: student.student_id,
					subject_id: subjectId,
				},
				orderBy: {
					grade_date: 'desc',
				},
			});

			// Calculate average
			let average = 0;
			if (grades.length > 0) {
				const sum = grades.reduce((acc, g) => acc + parseFloat(g.grade_value), 0);
				average = (sum / grades.length).toFixed(2);
			}

			// Get last grade
			const lastGrade = grades[0] || null;

			// Get absences (you'll need to implement this based on your schema)
			const absences = 0; // Placeholder

			return {
				id: student.users.id,
				name: `${student.users.last_name} ${student.users.first_name}`,
				average: average,
				absences: absences,
				lastGrade: lastGrade ? {
					value: lastGrade.grade_value,
					date: lastGrade.grade_date,
				} : null,
			};
		}));

		res.json(studentsWithData);
	} catch (error) {
		console.error("Hiba a diákok lekérésekor:", error);
		res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { studentforClass };