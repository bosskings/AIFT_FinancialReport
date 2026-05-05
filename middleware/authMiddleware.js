import jwt, { decode } from 'jsonwebtoken';
import User from "../models/User.js";
import Students from "../models/Student.js";
import Schools from "../models/School.js";


const requireAuth = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status:"FAILED", 
            message: 'Authorization token required' 
        });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { userType } = decoded;
        let user = null;

        if (userType && userType.includes('FINANCE')) {
            user = await User.findById(decoded.userId);

        } else if (userType && userType.includes('STUDENT')) {
            user = await Students.findById(decoded.studentId);
        
        } else if (userType && userType.includes('SCHOOL')) {
            user = await Schools.findById(decoded.schoolId);

        } else if (userType && userType.includes('ADMIN')) {
            user = {id:"001"};

        } else {
            return res.status(401).json({
                status: "FAILED",
                message: "User type not recognized"
            });
        }

        if (!user) {
            return res.status(404).json({
                status: "FAILED",
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (err) {
        return res.status(401).json({ 
            status:"FAILED", 
            message: 'Invalid/Expired token' 
        });
    }
};

export { requireAuth };