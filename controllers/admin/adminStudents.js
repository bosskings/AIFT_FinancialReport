import Student from '../../models/Student.js';

// Controller function to display an overview of students
const getStudentsOverview = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({ status: 'ACTIVE' });
        const pendingStudents = await Student.countDocuments({ status: 'PENDING' });
        const inactiveStudents = await Student.countDocuments({ status: 'INACTIVE' });
        res.status(200).json({
            status: "SUCCESS",
            data: {
                totalStudents,
                activeStudents,
                pendingStudents,
                inactiveStudents
            }
        });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({ status: "SUCCESS", data: students });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};


const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ status: "FAILED", message: "Student not found." });
        }
        res.status(200).json({ status: "SUCCESS", data: student });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};

const updateStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({ status: "FAILED", message: "Invalid status value. Only 'ACTIVE' or 'INACTIVE' are allowed." });
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ status: "FAILED", message: "Student not found." });
        }

        res.status(200).json({ status: "SUCCESS", data: updatedStudent });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};


export { 
    getStudentsOverview,
    getAllStudents,
    getStudentById,
    updateStudentStatus
};