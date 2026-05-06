import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Students from '../../models/Student.js';


const studentsLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: "FAILED",
            message: "Email and password are required"
        });
    }

    try {
        // Find student by email
        const student = await Students.findOne({ email });
        if (!student) {
            return res.status(401).json({
                status: "FAILED",
                message: "Invalid email or password"
            });
        }

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({
                status: "FAILED",
                message: "Invalid email or password"
            });
        }

        // Create JWT payload
        const payload = {
            userType: "STUDENTS",
            studentId: student._id,
            email: student.email
        };

        // Generate JWT token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES || "1y"
        });

        return res.status(200).json({
            status: "SUCCESS",
            message: "Student logged in successfully",
            token,
            student
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            status: "FAILED",
            message: "An error occurred during login"
        });
    }
};

export { studentsLogin };