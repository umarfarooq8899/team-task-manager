import express from 'express';
import Joi from 'joi';
import { ensureAuthenticated } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { ensureTeamCreator } from '../middleware/authz.js';
import {
  createTeam,
  getTeams,
  getTeamById,
  addTeamMember,
  deleteTeam,
} from '../controllers/teamController.js';

const router = express.Router();

// Joi Schemas for Request Validation
const createTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Team name is required.',
    'string.empty': 'Team name cannot be empty.',
    'string.min': 'Team name must be at least 2 characters long.',
    'string.max': 'Team name cannot exceed 100 characters.',
  }),
});

const addMemberSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Must be a valid email address.',
  }),
  userId: Joi.string().uuid({ version: 'uuidv4' }).optional().messages({
    'string.guid': 'Must be a valid user UUID.',
  }),
  role: Joi.string().valid('admin', 'member').optional().default('member').messages({
    'any.only': 'Role must be either "admin" or "member".',
  }),
})
  .xor('email', 'userId')
  .messages({
    'object.xor': 'Please provide either an email or a userId, but not both.',
    'object.missing': 'Please provide either an email or a userId.',
  });

// Apply ensureAuthenticated to all routes in this router
router.use(ensureAuthenticated);

// @route   POST /api/teams
// @desc    Create a team
// @access  Private (Authenticated)
router.post('/', validateBody(createTeamSchema), createTeam);

// @route   GET /api/teams
// @desc    Get all teams currently logged-in user belongs to
// @access  Private (Authenticated)
router.get('/', getTeams);

// @route   GET /api/teams/:id
// @desc    Get a single team by ID
// @access  Private (Authenticated)
router.get('/:id', getTeamById);

// @route   POST /api/teams/:id/members
// @desc    Add a team member to a team
// @access  Private (Authenticated)
router.post('/:id/members', validateBody(addMemberSchema), addTeamMember);

// @route   DELETE /api/teams/:id
// @desc    Delete a team (creator only)
// @access  Private (Authenticated)
router.delete('/:id', ensureTeamCreator, deleteTeam);


export default router;
