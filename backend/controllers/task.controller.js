const Task = require("../models/Task.model");

 
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort("-createdAt");
    res.status(200).json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
};

 
const createTask = async (req, res, next) => {
  try {
    const { title, property, date, priority, status } = req.body;

    const task = await Task.create({
      owner: req.user.id,
      title,
      property,
      date,
      priority,
      status,
    });

    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};
 
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this task" });
    }

    task.status = status || task.status;
    await task.save();

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
};
