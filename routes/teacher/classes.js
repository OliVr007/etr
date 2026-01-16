async function rootTeacherClasses(req, res){
    	try {
		// Get all classes where this teacher teaches
		const teacherClasses = await db.timetable.findMany({
			where: {
				teacher_id: req.session.id,
			},
			include: {
				classes: true,
				subjects: true,
			},
			distinct: ['class_id', 'subject_id'],
		});

		// Get unique class-subject combinations
		const uniqueClasses = [];
		const seen = new Set();

		for (const tc of teacherClasses) {
			const key = `${tc.class_id}-${tc.subject_id}`;
			if (!seen.has(key)) {
				seen.add(key);
				
				// Get student count for this class
				const studentCount = await db.student_classes.count({
					where: {
						class_id: tc.class_id,
						is_active: true,
					},
				});

				// Get average grade for this class and subject
				const grades = await db.grades.findMany({
					where: {
						subject_id: tc.subject_id,
						student_id: {
							in: (await db.student_classes.findMany({
								where: {
									class_id: tc.class_id,
									is_active: true,
								},
								select: { student_id: true },
							})).map(sc => sc.student_id),
						},
					},
					select: {
						grade_value: true,
					},
				});

				let averageGrade = 0;
				if (grades.length > 0) {
					const sum = grades.reduce((acc, g) => acc + parseFloat(g.grade_value), 0);
					averageGrade = (sum / grades.length).toFixed(2);
				}

				// Get grade distribution
				const gradeDistribution = {
					grade5: grades.filter(g => parseFloat(g.grade_value) === 5).length,
					grade4: grades.filter(g => parseFloat(g.grade_value) === 4).length,
					grade3: grades.filter(g => parseFloat(g.grade_value) === 3).length,
					grade2: grades.filter(g => parseFloat(g.grade_value) === 2).length,
					grade1: grades.filter(g => parseFloat(g.grade_value) === 1).length,
				};

				const total = grades.length || 1;
				const distribution = {
					grade5Percent: Math.round((gradeDistribution.grade5 / total) * 100),
					grade4Percent: Math.round((gradeDistribution.grade4 / total) * 100),
					grade3Percent: Math.round((gradeDistribution.grade3 / total) * 100),
					grade2Percent: Math.round((gradeDistribution.grade2 / total) * 100),
					grade1Percent: Math.round((gradeDistribution.grade1 / total) * 100),
				};

				// Get class teacher info
				const classInfo = await db.classes.findUnique({
					where: { id: tc.class_id },
					include: {
						users: {
							select: {
								first_name: true,
								last_name: true,
							},
						},
					},
				});

				// Get weekly hours for this subject in this class
				const weeklyHours = await db.timetable.count({
					where: {
						class_id: tc.class_id,
						subject_id: tc.subject_id,
						teacher_id: req.session.id,
					},
				});

				uniqueClasses.push({
					class_id: tc.class_id,
					class_name: tc.classes.class_name,
					subject_id: tc.subject_id,
					subject_name: tc.subjects.subject_name,
					student_count: studentCount,
					average_grade: averageGrade,
					distribution: distribution,
					class_teacher: classInfo.users ? `${classInfo.users.first_name} ${classInfo.users.last_name}` : 'N/A',
					weekly_hours: weeklyHours,
					room_number: tc.room_number || 'N/A',
				});
			}
		}

		// Calculate stats
		const stats = {
			totalClasses: uniqueClasses.length,
			totalStudents: uniqueClasses.reduce((sum, c) => sum + c.student_count, 0),
			averageClassGrade: uniqueClasses.length > 0 
				? (uniqueClasses.reduce((sum, c) => sum + parseFloat(c.average_grade), 0) / uniqueClasses.length).toFixed(2)
				: 0,
		};

		res.render("teacher/teacher-classes", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			classes: uniqueClasses,
			stats: stats,
		});
	} catch (error) {
		console.error("Hiba az osztályok lekérésekor:", error);
		res.render("teacher/teacher-classes", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
			classes: [],
			stats: {
				totalClasses: 0,
				totalStudents: 0,
				averageClassGrade: 0,
			},
		});
	}
}

module.exports = { rootTeacherClasses };