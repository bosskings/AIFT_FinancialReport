import Student from '../../models/Student.js';
import Course from '../../models/Course.js';
import bcrypt from 'bcryptjs';

const studentsOverview = async (req, res) => {
    try {
        const studentId = req.studentId || req.id || req.userId || (req.user && req.user._id) || (req.student && req.student._id);
        if (!studentId) {
            return res.status(400).json({ status: "FAILED", message: "Student id not found in request." });
        }

        // 1. Get student info and populate courses
        const student = await Student.findById(studentId).populate('courses').lean();
        if (!student) {
            return res.status(404).json({ status: "FAILED", message: "Student not found." });
        }

        const courseCount = student.courses ? student.courses.length : 0;

        // 2. Get 2 other courses of same grade level (excluding the ones the user has already taken)
        let grade = student.grade;
        let takenCourseIds = student.courses ? student.courses.map(c => c._id) : [];

        // Find 2 courses from the same grade the student hasn't taken
        const sameGradeCourses = await Course.find({
            gradeLevel: grade,
            _id: { $nin: takenCourseIds }
        })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean();

        // 3. Calculate 'rate at which the student is taking courses with respect to time'
        // We'll count courses by month in which they were "taken" (added to 'courses' array)
        // Here, let's assume student.updatedAt increases as they add courses, but actually we lack timestamps for each enrolment. 
        // If Course completion/enrolment timestamps existed, we'd use those.
        // As an approximation, gather the dates when current courses were created.
        const coursesWithDates = (student.courses || []).map(course => ({
            courseId: course._id,
            courseName: course.name,
            enrolledAt: course.createdAt // using course creation date as a proxy
        }));

        // Aggregate by month, e.g.: {'2024-02': 3, ...}
        const monthlyRate = {};
        for (const entry of coursesWithDates) {
            if (!entry.enrolledAt) continue;
            const dt = new Date(entry.enrolledAt);
            const label = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
            monthlyRate[label] = (monthlyRate[label] || 0) + 1;
        }
        // Make sorted array for charting
        const rateOverTime = Object.entries(monthlyRate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count }));

        res.status(200).json({
            status: "SUCCESS",
            numCoursesDone: courseCount,
            exampleSameGradeCourses: sameGradeCourses,
            courseRateOverTime: rateOverTime // [{month, count}, ...]
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while fetching student overview.",
            error: error.message
        });
    }
};



// Allow student to update their name and password. 
// For password change, require current password for verification.
const updateStudentProfile = async (req, res) => {
    try {
        const studentId = req.user && req.user._id || req.user; // supports both object and string
        const { name, currentPassword, newPassword } = req.body;

        if (!studentId) {
            return res.status(401).json({
                status: "FAILED",
                message: "Unauthorized: Student ID not found."
            });
        }

        // Fetch student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                status: "FAILED",
                message: "Student not found."
            });
        }

        // Flag to check if anything was updated
        let updated = false;
        let messages = [];

        // Update name (if provided)
        if (typeof name === "string" && name.trim() && name.trim() !== student.name) {
            student.name = name.trim();
            updated = true;
            messages.push('Name updated');
        }

        // Update password if requested
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    status: "FAILED",
                    message: "Current password is required to update password."
                });
            }
            // Verify current password
            const match = await bcrypt.compare(currentPassword, student.password);
            if (!match) {
                return res.status(400).json({
                    status: "FAILED",
                    message: "Current password is incorrect."
                });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({
                    status: "FAILED",
                    message: "New password must be at least 6 characters."
                });
            }
            // Hash and set new password
            const hashed = await bcrypt.hash(newPassword, 10);
            student.password = hashed;
            updated = true;
            messages.push('Password updated');
        }

        if (!updated) {
            return res.status(400).json({
                status: "FAILED",
                message: "No changes detected."
            });
        }

        student.updatedAt = new Date();
        await student.save();

        res.status(200).json({
            status: "SUCCESS",
            message: messages.join(' and ') + '.',
            student: {
                _id: student._id,
                name: student.name
                // Do not send back password!
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: "An error occurred while updating student profile.",
            error: error.message
        });
    }
};

export { updateStudentProfile,studentsOverview };