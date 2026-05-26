import * as taskService from '../services/taskService.js';

export const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    return res.status(201).json(task);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await taskService.getTasks(req.query, req.user.id);
    return res.status(200).json(tasks);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    return res.status(200).json(task);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
    return res.status(200).json(task);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
};
