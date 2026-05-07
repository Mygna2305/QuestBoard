import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/analytics/avg-bid-by-category — avg winning bid per category (last 30 days)
router.get('/avg-bid-by-category', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Task.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$bids' },
      {
        $group: {
          _id: '$category',
          avgBid: { $avg: '$bids.amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgBid: -1 } },
      {
        $project: {
          category: '$_id',
          avgBid: { $round: ['$avgBid', 0] },
          count: 1,
          _id: 0,
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/top-bidders — leaderboard with $lookup join on users + reviews
router.get('/top-bidders', async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'reviewee',
          as: 'reviewList',
        },
      },
      {
        $addFields: {
          avgRating: { $avg: '$reviewList.rating' },
          reviewCount: { $size: '$reviewList' },
          onTimeRate: {
            $cond: [
              { $gt: [{ $size: '$reviewList' }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $size: { $filter: { input: '$reviewList', as: 'r', cond: '$$r.onTime' } } },
                      { $size: '$reviewList' },
                    ],
                  },
                  100,
                ],
              },
              100,
            ],
          },
        },
      },
      { $match: { tasksDone: { $gt: 0 } } },
      {
        $addFields: {
          score: {
            $round: [
              {
                $add: [
                  { $multiply: [{ $ifNull: ['$avgRating', 0] }, 10] },
                  { $multiply: ['$tasksDone', 0.5] },
                  { $multiply: [{ $divide: ['$onTimeRate', 100] }, 20] },
                ],
              },
              1,
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          rollNo: 1,
          skills: 1,
          tasksDone: 1,
          avgRating: { $round: ['$avgRating', 1] },
          onTimeRate: { $round: ['$onTimeRate', 0] },
          score: 1,
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/weekly-activity — daily counts last 7 days
router.get('/weekly-activity', async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [tasksPosted, bidsPlaced, tasksAwarded] = await Promise.all([
      Task.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Task.aggregate([
        { $unwind: '$bids' },
        { $match: { 'bids.placedAt': { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$bids.placedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Task.aggregate([
        { $match: { status: 'closed', updatedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ tasksPosted, bidsPlaced, tasksAwarded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/skill-demand — most in-demand skill categories
router.get('/skill-demand', async (req, res) => {
  try {
    const result = await Task.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          taskCount: { $sum: 1 },
          avgBudget: { $avg: { $avg: ['$budget.min', '$budget.max'] } },
        },
      },
      { $sort: { taskCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          skill: '$_id',
          taskCount: 1,
          avgBudget: { $round: ['$avgBudget', 0] },
          _id: 0,
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
