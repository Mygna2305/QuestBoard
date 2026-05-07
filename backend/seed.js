import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Task from './models/Task.js';
import Review from './models/Review.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/questboard';

const users = [
  { name: 'Tanvi Rao',    rollNo: '102303155', email: 'tanvi@tiet.edu',   skills: ['React', 'Node', 'Mongo'],          rating: 4.9, tasksDone: 31, onTimeRate: 97 },
  { name: 'Priya Nair',   rollNo: '102303190', email: 'priya@tiet.edu',   skills: ['Python', 'ML', 'Pandas'],          rating: 4.9, tasksDone: 23, onTimeRate: 94 },
  { name: 'Diya Kapoor',  rollNo: '102303077', email: 'diya@tiet.edu',    skills: ['Figma', 'Illustrator'],            rating: 4.7, tasksDone: 15, onTimeRate: 96 },
  { name: 'Aarav Sharma', rollNo: '102303045', email: 'aarav@tiet.edu',   skills: ['JS', 'React', 'Tailwind'],         rating: 4.8, tasksDone: 12, onTimeRate: 92 },
  { name: 'Rohan Mehta',  rollNo: '102303001', email: 'rohan@tiet.edu',   skills: ['C++', 'DSA', 'MATLAB'],           rating: 4.6, tasksDone: 8,  onTimeRate: 100 },
  { name: 'Karan Singh',  rollNo: '102303312', email: 'karan@tiet.edu',   skills: ['Node.js', 'Express', 'MongoDB'],  rating: 4.4, tasksDone: 5,  onTimeRate: 80 },
  { name: 'Vikram Joshi', rollNo: '102303053', email: 'vikram@tiet.edu',  skills: ['React', 'Redux', 'TypeScript'],   rating: 4.5, tasksDone: 9,  onTimeRate: 89 },
  { name: 'Mygna Sai',    rollNo: '102303127', email: 'mygna@tiet.edu',   skills: ['React', 'Node.js', 'Tailwind'],   rating: 4.3, tasksDone: 4,  onTimeRate: 75 },
];

function daysFromNow(d) {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}

function daysAgo(d) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // clear existing
  await Promise.all([User.deleteMany({}), Task.deleteMany({}), Review.deleteMany({})]);
  console.log('Cleared existing data');

  // insert users
  const savedUsers = await User.insertMany(users.map(u => ({ ...u, tasksPosted: Math.floor(Math.random() * 10) + 2 })));
  const [tanvi, priya, diya, aarav, rohan, karan, vikram, mygna] = savedUsers;
  console.log('Inserted users');

  // tasks matching report screenshots
  const tasks = [
    {
      title: 'React landing page redesign',
      description: 'Need someone to redesign our club landing page using React and Tailwind. Current design is outdated.',
      category: 'Design',
      skills: ['React', 'Tailwind', 'Figma'],
      budget: { min: 1200, max: 2000 },
      deadline: daysFromNow(2),
      postedBy: mygna._id,
      status: 'open',
      createdAt: daysAgo(1),
      bids: [
        { bidder: aarav._id, amount: 1400, etaDays: 2, pitch: 'I have built 10+ landing pages with React+Tailwind.', placedAt: hoursAgo(12) },
        { bidder: priya._id, amount: 1500, etaDays: 1, pitch: 'Strong frontend skills, will deliver in 1 day.', placedAt: hoursAgo(34) },
        { bidder: rohan._id, amount: 1250, etaDays: 3, pitch: 'Budget-friendly and reliable delivery.', placedAt: hoursAgo(3) },
        { bidder: diya._id, amount: 1600, etaDays: 2, pitch: 'UI/UX expert with Figma and React experience.', placedAt: hoursAgo(2) },
        { bidder: karan._id, amount: 1200, etaDays: 2, pitch: 'Good with React, will match the design spec.', placedAt: hoursAgo(2) },
        { bidder: tanvi._id, amount: 1800, etaDays: 1, pitch: 'Top-rated, fastest delivery guaranteed.', placedAt: hoursAgo(3) },
        { bidder: vikram._id, amount: 1350, etaDays: 3, pitch: 'TypeScript + React expert, clean code.', placedAt: hoursAgo(8) },
      ],
    },
    {
      title: 'DSA doubt: segment trees',
      description: 'Need help understanding segment trees — range queries, lazy propagation. 1 hour session.',
      category: 'Coding',
      skills: ['DSA', 'C++', 'Algorithms'],
      budget: { min: 300, max: 500 },
      deadline: daysFromNow(0.25),
      postedBy: aarav._id,
      status: 'open',
      createdAt: daysAgo(0.5),
      bids: [
        { bidder: rohan._id, amount: 350, etaDays: 0, pitch: 'DSA expert, can explain in 30 mins.', placedAt: hoursAgo(2) },
        { bidder: tanvi._id, amount: 400, etaDays: 0, pitch: 'Cleared ICPC, segment trees are my specialty.', placedAt: hoursAgo(1) },
        { bidder: vikram._id, amount: 300, etaDays: 0, pitch: 'Solved 500+ DSA problems, will help you.', placedAt: hoursAgo(0.5) },
        { bidder: karan._id, amount: 450, etaDays: 0, pitch: 'Competitive coder, quick session available.', placedAt: hoursAgo(0.3) },
        { bidder: priya._id, amount: 380, etaDays: 0, pitch: 'Strong in algorithms, clear explanation style.', placedAt: hoursAgo(0.2) },
        { bidder: mygna._id, amount: 320, etaDays: 0, pitch: 'Can explain with visual diagrams.', placedAt: hoursAgo(0.1) },
        { bidder: diya._id, amount: 500, etaDays: 0, pitch: 'Premium tutoring with notes provided.', placedAt: hoursAgo(0.05) },
        { bidder: aarav._id, amount: 350, etaDays: 0, pitch: 'Will help right away.', placedAt: hoursAgo(0.02) },
        { bidder: rohan._id, amount: 410, etaDays: 0, pitch: 'Updated bid — includes practice problems.', placedAt: hoursAgo(0.01) },
        { bidder: tanvi._id, amount: 420, etaDays: 0, pitch: 'Final offer with full session notes.', placedAt: hoursAgo(0.005) },
        { bidder: vikram._id, amount: 330, etaDays: 0, pitch: 'Best price, immediate availability.', placedAt: hoursAgo(0.002) },
        { bidder: karan._id, amount: 460, etaDays: 0, pitch: 'Will cover lazy prop too.', placedAt: hoursAgo(0.001) },
      ],
    },
    {
      title: 'DBMS notes (Unit 3-4)',
      description: 'Need handwritten or typed notes for DBMS Unit 3 (Normalization) and Unit 4 (Transactions). EST prep.',
      category: 'Notes',
      skills: ['DBMS', 'Academic Writing'],
      budget: { min: 150, max: 250 },
      deadline: daysFromNow(1),
      postedBy: vikram._id,
      status: 'open',
      createdAt: daysAgo(2),
      bids: [
        { bidder: priya._id, amount: 200, etaDays: 1, pitch: 'Topped DBMS last sem, great notes.', placedAt: hoursAgo(5) },
        { bidder: tanvi._id, amount: 220, etaDays: 1, pitch: 'Well-structured typed notes with diagrams.', placedAt: hoursAgo(3) },
        { bidder: diya._id, amount: 180, etaDays: 1, pitch: 'Clean and concise notes, ready by tomorrow.', placedAt: hoursAgo(2) },
        { bidder: rohan._id, amount: 150, etaDays: 1, pitch: 'Budget option, solid content.', placedAt: hoursAgo(1) },
      ],
    },
    {
      title: 'Logo for college fest',
      description: 'Design a logo for Thapar annual tech fest. Need 3 variations — light, dark, and icon-only.',
      category: 'Design',
      skills: ['Figma', 'Illustrator', 'Graphic Design'],
      budget: { min: 800, max: 1500 },
      deadline: daysFromNow(3),
      postedBy: karan._id,
      status: 'open',
      createdAt: daysAgo(3),
      bids: [
        { bidder: diya._id, amount: 1000, etaDays: 2, pitch: 'Professional designer, portfolio available.', placedAt: hoursAgo(10) },
        { bidder: aarav._id, amount: 900, etaDays: 3, pitch: 'Good at Figma, will deliver all 3 variants.', placedAt: hoursAgo(8) },
        { bidder: tanvi._id, amount: 1200, etaDays: 2, pitch: 'Designed logos for 5 college events.', placedAt: hoursAgo(6) },
        { bidder: vikram._id, amount: 850, etaDays: 3, pitch: 'Budget-friendly quality design.', placedAt: hoursAgo(4) },
        { bidder: priya._id, amount: 950, etaDays: 2, pitch: 'Creative with strong color theory.', placedAt: hoursAgo(2) },
        { bidder: rohan._id, amount: 800, etaDays: 3, pitch: 'Minimal but impactful design style.', placedAt: hoursAgo(1) },
        { bidder: karan._id, amount: 1100, etaDays: 2, pitch: 'Experienced with brand identity design.', placedAt: hoursAgo(0.5) },
        { bidder: mygna._id, amount: 875, etaDays: 3, pitch: 'Will provide source files too.', placedAt: hoursAgo(0.2) },
        { bidder: tanvi._id, amount: 1250, etaDays: 1, pitch: 'Urgent delivery available.', placedAt: hoursAgo(0.1) },
      ],
    },
    {
      title: 'Python script: web scraper',
      description: 'Need a Python script to scrape internship listings from a job board. Output to CSV. BeautifulSoup or Scrapy.',
      category: 'Coding',
      skills: ['Python', 'Web Scraping', 'BeautifulSoup'],
      budget: { min: 500, max: 900 },
      deadline: daysFromNow(1.08),
      postedBy: diya._id,
      status: 'open',
      createdAt: daysAgo(1),
      bids: [
        { bidder: priya._id, amount: 700, etaDays: 1, pitch: 'Expert in Python scraping, have done 20+ scrapers.', placedAt: hoursAgo(4) },
        { bidder: rohan._id, amount: 600, etaDays: 1, pitch: 'Clean Python code, tested output.', placedAt: hoursAgo(3) },
        { bidder: tanvi._id, amount: 750, etaDays: 1, pitch: 'Full scraper with error handling and CSV export.', placedAt: hoursAgo(2) },
        { bidder: aarav._id, amount: 550, etaDays: 2, pitch: 'Will use requests + BeautifulSoup.', placedAt: hoursAgo(1) },
        { bidder: vikram._id, amount: 650, etaDays: 1, pitch: 'Fast delivery, well-commented code.', placedAt: hoursAgo(0.5) },
      ],
    },
    {
      title: 'Resume review + edits',
      description: 'Need someone to review my SWE internship resume and suggest edits. Target: FAANG-style formatting.',
      category: 'Writing',
      skills: ['Resume', 'Technical Writing', 'Career'],
      budget: { min: 200, max: 400 },
      deadline: daysFromNow(0.5),
      postedBy: rohan._id,
      status: 'open',
      createdAt: daysAgo(0.25),
      bids: [
        { bidder: tanvi._id, amount: 300, etaDays: 0, pitch: 'Got internship at Flipkart, know what works.', placedAt: hoursAgo(1) },
        { bidder: priya._id, amount: 250, etaDays: 0, pitch: 'Reviewed 15+ resumes, strong feedback.', placedAt: hoursAgo(0.5) },
        { bidder: aarav._id, amount: 350, etaDays: 0, pitch: 'ATS-optimized edits included.', placedAt: hoursAgo(0.25) },
      ],
    },
    {
      title: 'MATLAB lab help',
      description: 'Need help with MATLAB signal processing lab. 3 experiments pending, need working code + explanation.',
      category: 'Coding',
      skills: ['MATLAB', 'Signal Processing', 'Tutoring'],
      budget: { min: 400, max: 700 },
      deadline: daysFromNow(2),
      postedBy: priya._id,
      status: 'open',
      createdAt: daysAgo(2),
      bids: [
        { bidder: rohan._id, amount: 500, etaDays: 1, pitch: 'Strong in MATLAB, did the same labs last year.', placedAt: hoursAgo(6) },
        { bidder: tanvi._id, amount: 600, etaDays: 1, pitch: 'Can explain and write code together.', placedAt: hoursAgo(4) },
        { bidder: vikram._id, amount: 450, etaDays: 2, pitch: 'Budget option with full explanation.', placedAt: hoursAgo(2) },
        { bidder: karan._id, amount: 550, etaDays: 1, pitch: 'Done signal processing, can help right away.', placedAt: hoursAgo(1) },
        { bidder: aarav._id, amount: 480, etaDays: 2, pitch: 'Clear documentation provided.', placedAt: hoursAgo(0.5) },
        { bidder: priya._id, amount: 520, etaDays: 1, pitch: 'Will provide working code + notes.', placedAt: hoursAgo(0.2) },
      ],
    },
    {
      title: 'Poster for tech symposium',
      description: 'Design an A3 poster for a CSE dept tech symposium. Include event schedule and speaker info.',
      category: 'Design',
      skills: ['Figma', 'Canva', 'Graphic Design'],
      budget: { min: 600, max: 1000 },
      deadline: daysFromNow(4),
      postedBy: tanvi._id,
      status: 'open',
      createdAt: daysAgo(4),
      bids: [
        { bidder: diya._id, amount: 800, etaDays: 2, pitch: 'Made posters for Thapar Pratistha and E-Summit.', placedAt: hoursAgo(20) },
        { bidder: aarav._id, amount: 700, etaDays: 3, pitch: 'Clean modern design style.', placedAt: hoursAgo(10) },
      ],
    },
    // A few closed tasks for analytics
    {
      title: 'CN assignment help',
      description: 'Need help writing the CN lab assignment on socket programming.',
      category: 'Coding',
      skills: ['C', 'Socket Programming', 'Networking'],
      budget: { min: 300, max: 600 },
      deadline: daysAgo(2),
      postedBy: aarav._id,
      status: 'closed',
      createdAt: daysAgo(10),
      bids: [
        { bidder: rohan._id, amount: 400, etaDays: 1, pitch: 'Done CN lab, will finish fast.', placedAt: daysAgo(9) },
        { bidder: tanvi._id, amount: 500, etaDays: 1, pitch: 'Socket programming expert.', placedAt: daysAgo(9) },
      ],
    },
    {
      title: 'ML project report',
      description: 'Write a 10-page project report for our ML mini project on image classification.',
      category: 'Writing',
      skills: ['ML', 'Academic Writing', 'Python'],
      budget: { min: 500, max: 800 },
      deadline: daysAgo(5),
      postedBy: vikram._id,
      status: 'closed',
      createdAt: daysAgo(15),
      bids: [
        { bidder: priya._id, amount: 600, etaDays: 2, pitch: 'ML expert, great technical writing.', placedAt: daysAgo(14) },
        { bidder: tanvi._id, amount: 700, etaDays: 2, pitch: 'Will include charts and analysis.', placedAt: daysAgo(14) },
      ],
    },
    {
      title: 'Figma prototype for UX project',
      description: 'Need a mid-fidelity Figma prototype for a food delivery app UX project.',
      category: 'Design',
      skills: ['Figma', 'UX Design', 'Prototyping'],
      budget: { min: 700, max: 1200 },
      deadline: daysAgo(3),
      postedBy: karan._id,
      status: 'closed',
      createdAt: daysAgo(12),
      bids: [
        { bidder: diya._id, amount: 900, etaDays: 3, pitch: 'UX specialist with strong Figma skills.', placedAt: daysAgo(11) },
        { bidder: aarav._id, amount: 800, etaDays: 4, pitch: 'Can build with clickable interactions.', placedAt: daysAgo(11) },
      ],
    },
    {
      title: 'Translation: English to Hindi (10 pages)',
      description: 'Translate a 10-page technical document from English to Hindi for a college project.',
      category: 'Translation',
      skills: ['Hindi', 'Translation', 'Technical Writing'],
      budget: { min: 200, max: 420 },
      deadline: daysAgo(1),
      postedBy: rohan._id,
      status: 'closed',
      createdAt: daysAgo(8),
      bids: [
        { bidder: priya._id, amount: 300, etaDays: 2, pitch: 'Fluent in both languages, technical background.', placedAt: daysAgo(7) },
      ],
    },
    {
      title: 'Video explainer: OS scheduling algorithms',
      description: 'Make a 5-minute explainer video on CPU scheduling algorithms for a class project.',
      category: 'Video',
      skills: ['Video Editing', 'Animation', 'OS'],
      budget: { min: 400, max: 720 },
      deadline: daysAgo(2),
      postedBy: diya._id,
      status: 'closed',
      createdAt: daysAgo(14),
      bids: [
        { bidder: tanvi._id, amount: 600, etaDays: 3, pitch: 'Can animate with Manim + voiceover.', placedAt: daysAgo(13) },
        { bidder: vikram._id, amount: 500, etaDays: 4, pitch: 'Good at screencast tutorials.', placedAt: daysAgo(13) },
      ],
    },
    {
      title: 'Tutoring: DBMS query optimization',
      description: 'Need 2-hour tutoring session on query optimization, indexing, and execution plans.',
      category: 'Tutoring',
      skills: ['DBMS', 'SQL', 'Query Optimization'],
      budget: { min: 300, max: 540 },
      deadline: daysAgo(4),
      postedBy: priya._id,
      status: 'closed',
      createdAt: daysAgo(10),
      bids: [
        { bidder: rohan._id, amount: 400, etaDays: 0, pitch: 'Taught 5 juniors last sem, great feedback.', placedAt: daysAgo(9) },
        { bidder: tanvi._id, amount: 450, etaDays: 0, pitch: 'Can cover execution plans with live examples.', placedAt: daysAgo(9) },
        { bidder: aarav._id, amount: 380, etaDays: 0, pitch: 'Budget friendly with strong DBMS knowledge.', placedAt: daysAgo(9) },
      ],
    },
  ];

  const savedTasks = await Task.insertMany(tasks);
  console.log(`Inserted ${savedTasks.length} tasks`);

  // reviews for closed tasks
  const reviews = [
    { taskId: savedTasks[8]._id,  reviewer: aarav._id,  reviewee: rohan._id,  rating: 4.8, comment: 'Very quick and clean code!', onTime: true },
    { taskId: savedTasks[9]._id,  reviewer: vikram._id, reviewee: priya._id,  rating: 5.0, comment: 'Outstanding report, exceeded expectations.', onTime: true },
    { taskId: savedTasks[10]._id, reviewer: karan._id,  reviewee: diya._id,   rating: 4.7, comment: 'Beautiful prototype, well done.', onTime: true },
    { taskId: savedTasks[11]._id, reviewer: rohan._id,  reviewee: priya._id,  rating: 4.6, comment: 'Great translation quality.', onTime: true },
    { taskId: savedTasks[12]._id, reviewer: diya._id,   reviewee: tanvi._id,  rating: 4.9, comment: 'Amazing video, perfect animations!', onTime: true },
    { taskId: savedTasks[13]._id, reviewer: priya._id,  reviewee: rohan._id,  rating: 4.5, comment: 'Helpful session, covered everything.', onTime: false },
    { taskId: savedTasks[13]._id, reviewer: priya._id,  reviewee: tanvi._id,  rating: 5.0, comment: 'Best tutoring session ever!', onTime: true },
    { taskId: savedTasks[13]._id, reviewer: priya._id,  reviewee: aarav._id,  rating: 4.3, comment: 'Good but could explain better.', onTime: true },
  ];

  await Review.insertMany(reviews.map(r => ({ ...r, createdAt: daysAgo(Math.random() * 7) })));
  console.log(`Inserted ${reviews.length} reviews`);

  // update ratings from reviews
  for (const userId of [tanvi._id, priya._id, diya._id, aarav._id, rohan._id]) {
    const userReviews = await Review.find({ reviewee: userId });
    if (userReviews.length) {
      const avg = userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length;
      const onTimeRate = Math.round((userReviews.filter(r => r.onTime).length / userReviews.length) * 100);
      await User.findByIdAndUpdate(userId, { rating: Math.round(avg * 10) / 10, onTimeRate });
    }
  }

  console.log('Seed complete! QuestBoard database ready.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
