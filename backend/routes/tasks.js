import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/tasks — list with multi-operator filtering
router.get('/', async (req, res) => {
  try {
    const { skills, budgetMin, budgetMax, deadline, status, category } = req.query;
    const filter = {};

    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillArr };
    }
    if (budgetMin || budgetMax) {
      filter['budget.min'] = {};
      if (budgetMin) filter['budget.min'].$gte = Number(budgetMin);
      if (budgetMax) filter['budget.max'] = { $lte: Number(budgetMax) };
    }
    if (deadline) {
      filter.deadline = { $gt: new Date(deadline) };
    }
    if (status) {
      filter.status = { $eq: status };
    }
    if (category) {
      filter.category = { $in: category.split(',') };
    }

    const tasks = await Task.find(filter)
      .populate('postedBy', 'name rollNo')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id — single task with $lookup-style bid+bidder join
router.get('/:id', async (req, res) => {
  try {
    const result = await Task.aggregate([
      { $match: { _id: new (await import('mongoose')).default.Types.ObjectId(req.params.id) } },
      { $unwind: { path: '$bids', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'bids.bidder',
          foreignField: '_id',
          as: 'bids.bidderInfo',
        },
      },
      {
        $addFields: {
          'bids.bidderInfo': { $arrayElemAt: ['$bids.bidderInfo', 0] },
        },
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          description: { $first: '$description' },
          category: { $first: '$category' },
          skills: { $first: '$skills' },
          budget: { $first: '$budget' },
          deadline: { $first: '$deadline' },
          status: { $first: '$status' },
          postedBy: { $first: '$postedBy' },
          createdAt: { $first: '$createdAt' },
          bids: { $push: '$bids' },
        },
      },
    ]);

    if (!result.length) return res.status(404).json({ error: 'Task not found' });

    // populate postedBy
    await Task.populate(result[0], { path: 'postedBy', model: User, select: 'name rollNo' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks — create task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    await User.findByIdAndUpdate(req.body.postedBy, { $inc: { tasksPosted: 1 } });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/:id/bids — place a bid (embedded)
router.post('/:id/bids', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status === 'closed') return res.status(400).json({ error: 'Task is closed' });

    task.bids.push(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/tasks/:id/bids/:bidId/accept — accept a bid, close task
router.put('/:id/bids/:bidId/accept', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const bid = task.bids.id(req.params.bidId);
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    task.status = 'closed';
    await task.save();
    await User.findByIdAndUpdate(bid.bidder, { $inc: { tasksDone: 1 } });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
