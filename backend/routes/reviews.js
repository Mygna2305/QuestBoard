import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/reviews?reviewee=id
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.reviewee) filter.reviewee = req.query.reviewee;
    if (req.query.reviewer) filter.reviewer = req.query.reviewer;
    const reviews = await Review.find(filter)
      .populate('reviewer', 'name rollNo')
      .populate('reviewee', 'name rollNo')
      .populate('taskId', 'title');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();

    // update reviewee's average rating
    const reviews = await Review.find({ reviewee: req.body.reviewee });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const onTimeCount = reviews.filter(r => r.onTime).length;
    const onTimeRate = Math.round((onTimeCount / reviews.length) * 100);

    await User.findByIdAndUpdate(req.body.reviewee, {
      rating: Math.round(avgRating * 10) / 10,
      onTimeRate,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
