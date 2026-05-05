import express from 'express';
import { quizIntro, quizQuestions } from '../controllers/students/studentQuiz.js';
import { studentsLogin } from '../controllers/students/studentsAuth.js';
import {studentsOverview, updateStudentProfile} from '../controllers/students/studentsOverview.js';
import { coursesOverview, viewCourse } from '../controllers/students/studentsCourses.js';
import { requireAuth } from '../middleware/authMiddleware.js';


const studentsRouter = express.Router();


studentsRouter.post('/login', studentsLogin);

// Apply authentication middleware for subsequent routes
studentsRouter.use(requireAuth);

studentsRouter.get('/student-overview', studentsOverview);
studentsRouter.get('/student-courseOVerview', coursesOverview);
studentsRouter.get('/student-viewcourse', viewCourse);


// quiz

studentsRouter.get('/quiz', quizIntro);
studentsRouter.get('/quiz-questions', quizQuestions);


// students setting
studentsRouter.put('/profile', updateStudentProfile);




export default studentsRouter