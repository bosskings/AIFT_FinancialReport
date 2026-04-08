import express from 'express';

import { createAnnouncement } from '../controllers/admin/adminAnnouncement.js';
import {
  getCoursesOverview,
  getAllCourses,
  getCourseById,
  updateCourseStatus,
} from '../controllers/admin/adminCourses.js';
import {
  getAllSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getSchoolById,
} from '../controllers/admin/adminSchools.js';
import {
  getStudentsOverview,
  getAllStudents,
  getStudentById,
  updateStudentStatus,
} from '../controllers/admin/adminStudents.js';
import {
  getSupportOverview,
  getAllSupportTickets,
  updateSupportStatus,
} from '../controllers/admin/support.js';

const adminRouter = express.Router();

// Announcements
adminRouter.post('/announcements', createAnnouncement);

// Courses
adminRouter.get('/courses/overview', getCoursesOverview);
adminRouter.get('/courses', getAllCourses);
adminRouter.get('/courses/:id', getCourseById);
adminRouter.patch('/courses/:id/status', updateCourseStatus);

// Schools
adminRouter.get('/schools', getAllSchools);
adminRouter.post('/schools', createSchool);
adminRouter.get('/schools/:id', getSchoolById);
adminRouter.put('/schools/:id', updateSchool);
adminRouter.delete('/schools/:id', deleteSchool);

// Students
adminRouter.get('/students/overview', getStudentsOverview);
adminRouter.get('/students', getAllStudents);
adminRouter.get('/students/:id', getStudentById);
adminRouter.patch('/students/:id/status', updateStudentStatus);

// Support
adminRouter.get('/support/overview', getSupportOverview);
adminRouter.get('/support', getAllSupportTickets);
adminRouter.get('/support/:id', getAllSupportTickets);
adminRouter.patch('/support/:id/status', updateSupportStatus);

export default adminRouter;
