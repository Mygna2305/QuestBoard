# QuestBoard — Freelance Micro-Task Marketplace

Data Engineering (UCS677) End-Semester Lab Project

## Quick Start

### Prerequisites
- MongoDB running locally on port 27017
- Node.js 18+

### Backend
```bash
cd backend
npm install
npm run seed      # populate database with sample data
npm start         # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks with filter support (`skills`, `budgetMin`, `budgetMax`, `status`, `category`) |
| GET | `/api/tasks/:id` | Single task with `$lookup`-joined bids |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/bids` | Place a bid (embedded) |
| PUT | `/api/tasks/:id/bids/:bidId/accept` | Accept bid, close task |
| GET | `/api/users` | List users |
| GET | `/api/analytics/avg-bid-by-category` | Avg bid per category (last 30 days) |
| GET | `/api/analytics/top-bidders` | Leaderboard via `$lookup` on users + reviews |
| GET | `/api/analytics/weekly-activity` | Daily task/bid counts (last 7 days) |
| GET | `/api/analytics/skill-demand` | Most in-demand skills via `$unwind` |

## MongoDB Features Demonstrated
- Embedded bid arrays inside task documents
- `$lookup` joins between tasks and user profiles
- Aggregation pipelines: `$group`, `$unwind`, `$sort`, `$project`, `$addFields`
- Logical operators: `$and`, `$or`
- Element operators: `$in`, `$gte`, `$lte`, `$eq`
- Compound indexes on `skills`, `budget`, `deadline`, `status`
