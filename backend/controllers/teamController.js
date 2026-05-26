import { Team, TeamMember, User } from '../models/index.js';

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
export const createTeam = async (req, res) => {
  const { name } = req.body;

  try {
    // 1. Create the team
    const team = await Team.create({
      name,
      createdBy: req.user.id,
    });

    // 2. Automatically add the creator as an 'admin' member
    await TeamMember.create({
      teamId: team.id,
      userId: req.user.id,
      role: 'admin',
    });

    // 3. Fetch populated team data
    const populatedTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: TeamMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    return res.status(201).json(populatedTeam);
  } catch (error) {
    return res.status(500).json({ message: 'Server error creating team.', error: error.message });
  }
};

// @desc    Get all teams the logged-in user belongs to
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req, res) => {
  try {
    // Find all memberships of the current user
    const memberships = await TeamMember.findAll({
      where: { userId: req.user.id },
      attributes: ['teamId'],
    });

    const teamIds = memberships.map((m) => m.teamId);

    // If the user isn't in any teams, return empty array immediately
    if (teamIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch the full populated teams
    const teams = await Team.findAll({
      where: { id: teamIds },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: TeamMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(teams);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving teams.', error: error.message });
  }
};

// @desc    Get a specific team by ID
// @route   GET /api/teams/:id
// @access  Private
export const getTeamById = async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: TeamMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Check if the requesting user is a member of the team
    const isMember = team.members.some((member) => member.userId === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this team.' });
    }

    return res.status(200).json(team);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving team.', error: error.message });
  }
};

// @desc    Add a member to a team
// @route   POST /api/teams/:id/members
// @access  Private
export const addTeamMember = async (req, res) => {
  const { id: teamId } = req.params;
  const { email, userId, role } = req.body;

  try {
    // 1. Find the team and verify the requesting user's membership
    const team = await Team.findByPk(teamId, {
      include: [{ model: TeamMember, as: 'members' }],
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Check authorization: requesting user must be a member
    const isMember = team.members.some((member) => member.userId === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this team.' });
    }

    // 2. Find the user to add
    let targetUser = null;
    if (userId) {
      targetUser = await User.findByPk(userId);
    } else if (email) {
      targetUser = await User.findOne({ where: { email } });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'User to add not found.' });
    }

    // 3. Prevent duplicate membership
    const existingMembership = team.members.find((member) => member.userId === targetUser.id);
    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member of this team.' });
    }

    // 4. Create the membership
    const newMember = await TeamMember.create({
      teamId,
      userId: targetUser.id,
      role: role || 'member',
    });

    // 5. Return populated member details
    const populatedMember = await TeamMember.findByPk(newMember.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.status(201).json(populatedMember);
  } catch (error) {
    return res.status(500).json({ message: 'Server error adding team member.', error: error.message });
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private
export const deleteTeam = async (req, res) => {
  try {
    // team is pre-loaded and authorized by ensureTeamCreator middleware
    const team = req.team;
    await team.destroy();

    return res.status(200).json({ message: 'Team deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error deleting team.', error: error.message });
  }
};
