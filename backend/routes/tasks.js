import express from 'express';
import Joi from 'joi';
import { ensureAuthenticated } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

// Apply authentication to all task routes
router.use(ensureAuthenticated);

// Joi Schemas for Validation
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'any.required': 'Task title is required.',
    'string.empty': 'Task title cannot be empty.',
    'string.min': 'Task title must be at least 3 characters long.',
    'string.max': 'Task title cannot exceed 255 characters.',
  }),
  description: Joi.string().allow(null, '').optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed').optional().default('pending').messages({
    'any.only': 'Status must be pending, in_progress, or completed.',
  }),
  dueDate: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'Due date must be a valid ISO 8601 date.',
  }),
  assignedTo: Joi.string().uuid({ version: 'uuidv4' }).allow(null).optional().messages({
    'string.guid': 'Assignee must be a valid user UUID.',
  }),
  teamId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'any.required': 'Team ID is required.',
    'string.guid': 'Team ID must be a valid team UUID.',
  }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(255).optional().messages({
    'string.empty': 'Task title cannot be empty.',
    'string.min': 'Task title must be at least 3 characters long.',
    'string.max': 'Task title cannot exceed 255 characters.',
  }),
  description: Joi.string().allow(null, '').optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed').optional().messages({
    'any.only': 'Status must be pending, in_progress, or completed.',
  }),
  dueDate: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'Due date must be a valid ISO 8601 date.',
  }),
  assignedTo: Joi.string().uuid({ version: 'uuidv4' }).allow(null).optional().messages({
    'string.guid': 'Assignee must be a valid user UUID.',
  }),
});

const getTasksQuerySchema = Joi.object({
  teamId: Joi.string().uuid({ version: 'uuidv4' }).optional().messages({
    'string.guid': 'Team ID filter must be a valid UUID.',
  }),
  assignedTo: Joi.string().uuid({ version: 'uuidv4' }).optional().messages({
    'string.guid': 'Assignee ID filter must be a valid UUID.',
  }),
  status: Joi.string().valid('pending', 'in_progress', 'completed').optional().messages({
    'any.only': 'Status filter must be pending, in_progress, or completed.',
  }),
});

router.post('/', validateBody(createTaskSchema), createTask);
router.get('/', validateQuery(getTasksQuerySchema), getTasks);
router.get('/:id', getTaskById);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
