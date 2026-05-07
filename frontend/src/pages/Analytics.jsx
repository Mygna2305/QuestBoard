import { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { getAnalyticsAvgBid, getAnalyticsTopBidders, getAnalyticsWeekly, getAnalyticsSkillDemand } from '../api/client';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const CHART_COLORS = ['#3b82f6', '#2dd4bf', '#fbbf24', '#a855f7', '#22c55e', '#ef4444', '#f97316'];

const chartDefaults = {
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Courier New', size: 11 } } } },
  scales: {
    x: { ticks: { color: '#64748b', font: { family: 'Courier New', size: 11 } }, grid: { color: '#1e2d45' } },
    y: { ticks: { color: '#64748b', font: { family: 'Courier New', size: 11 } }, grid: { color: '#1e2d45' } },
  },
};

export default function Analytics() {
  const [avgBid, setAvgBid] = useState([]);
  const [topBidders, setTopBidders] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [skillDemand, setSkillDemand] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ab, tb, wa, sd] = await Promise.all([
          getAnalyticsAvgBid(),
          getAnalyticsTopBidders(),
          getAnalyticsWeekly(),
          getAnalyticsSkillDemand(),
        ]);
        setAvgBid(ab.data);
        setTopBidders(tb.data);
        setWeekly(wa.data);
        setSkillDemand(sd.data);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: 32, color: 'var(--text-dim)', textAlign: 'center' }}>loading analytics...</div>;

  // build weekly chart data
  const weeklyLabels = (() => {
    const all = new Set();
    if (weekly) {
      weekly.tasksPosted?.forEach(d => all.add(d._id));
      weekly.bidsPlaced?.forEach(d => all.add(d._id));
      weekly.tasksAwarded?.forEach(d => all.add(d._id));
    }
    return Array.from(all).sort();
  })();

  const weeklyData = weekly ? {
    labels: weeklyLabels.map(l => l.slice(5)),
    datasets: [
      {
        label: 'Tasks Posted',
        data: weeklyLabels.map(l => weekly.tasksPosted?.find(d => d._id === l)?.count || 0),
        borderColor: '#3b82f6', backgroundColor: '#3b82f633', tension: 0.3, pointRadius: 4,
      },
      {
        label: 'Bids Placed',
        data: weeklyLabels.map(l => weekly.bidsPlaced?.find(d => d._id === l)?.count || 0),
        borderColor: '#fbbf24', backgroundColor: '#fbbf2433', tension: 0.3, pointRadius: 4,
      },
      {
        label: 'Tasks Awarded',
        data: weeklyLabels.map(l => weekly.tasksAwarded?.find(d => d._id === l)?.count || 0),
        borderColor: '#22c55e', backgroundColor: '#22c55e33', tension: 0.3, pointRadius: 4,
      },
    ],
  } : null;

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Avg winning bid by category */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            AVG WINNING BID BY CATEGORY
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>$group by category · $avg amount · $sort desc · last 30 days</span>
          </div>
          {avgBid.length > 0 ? (
            <Bar
              data={{
                labels: avgBid.map(d => d.category),
                datasets: [{
                  label: 'Avg Bid (₹)',
                  data: avgBid.map(d => d.avgBid),
                  backgroundColor: CHART_COLORS,
                  borderRadius: 4,
                }],
              }}
              options={{
                ...chartDefaults,
                plugins: {
                  ...chartDefaults.plugins,
                  legend: { display: false },
                  tooltip: {
                    callbacks: { label: ctx => `₹${ctx.raw}` },
                    titleFont: { family: 'Courier New' },
                    bodyFont: { family: 'Courier New' },
                  },
                },
              }}
            />
          ) : <NoData />}
        </div>

        {/* Weekly marketplace activity */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            WEEKLY MARKETPLACE ACTIVITY
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>$group by day · $count · last 7 days</span>
          </div>
          {weeklyData ? (
            <Line data={weeklyData} options={{
              ...chartDefaults,
              plugins: {
                legend: { labels: { color: '#94a3b8', font: { family: 'Courier New', size: 11 } } },
                tooltip: { titleFont: { family: 'Courier New' }, bodyFont: { family: 'Courier New' } },
              },
            }} />
          ) : <NoData />}
        </div>

        {/* Top bidders leaderboard */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            TOP BIDDERS — LEADERBOARD
            <span style={{ color: 'var(--teal)', fontSize: 10 }}>$lookup users + reviews · combined score</span>
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 10, marginBottom: 10 }}>
            joined tasks completed + avg rating + on-time delivery rate
          </div>
          {topBidders.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['RANK', 'NAME', 'SKILLS', 'DONE', 'RATING', 'ON-TIME', 'SCORE'].map(h => (
                    <th key={h} style={{ color: 'var(--text-dim)', fontSize: 10, letterSpacing: 1, padding: '4px 8px', textAlign: 'left', fontWeight: 'normal' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topBidders.map((b, i) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 8px' }}>
                      <span style={{ color: i < 3 ? ['var(--yellow)', '#e5e7eb', '#cd7f32'][i] : 'var(--text-dim)', fontWeight: 'bold', fontSize: 12 }}>
                        #{i + 1}
                      </span>
                    </td>
                    <td style={{ padding: '8px 8px', color: 'var(--text)', fontSize: 12 }}>{b.name}</td>
                    <td style={{ padding: '8px 8px' }}>
                      <span style={{ color: 'var(--teal)', fontSize: 10 }}>{(b.skills || []).slice(0, 3).join(', ')}</span>
                    </td>
                    <td style={{ padding: '8px 8px', color: 'var(--text-mid)', fontSize: 11 }}>{b.tasksDone}</td>
                    <td style={{ padding: '8px 8px', color: 'var(--yellow)', fontSize: 11 }}>{b.avgRating} ★</td>
                    <td style={{ padding: '8px 8px', color: 'var(--green)', fontSize: 11 }}>{b.onTimeRate}%</td>
                    <td style={{ padding: '8px 8px', color: 'var(--text)', fontWeight: 'bold', fontSize: 12 }}>{b.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <NoData />}
        </div>

        {/* Skill demand */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            MOST IN-DEMAND SKILLS
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>$unwind skills · $group · $sort taskCount desc</span>
          </div>
          {skillDemand.length > 0 ? (
            <Bar
              data={{
                labels: skillDemand.map(d => d.skill),
                datasets: [{
                  label: 'Task Count',
                  data: skillDemand.map(d => d.taskCount),
                  backgroundColor: '#2dd4bf88',
                  borderColor: '#2dd4bf',
                  borderWidth: 1,
                  borderRadius: 4,
                }],
              }}
              options={{
                indexAxis: 'y',
                ...chartDefaults,
                plugins: {
                  legend: { display: false },
                  tooltip: { titleFont: { family: 'Courier New' }, bodyFont: { family: 'Courier New' } },
                },
              }}
            />
          ) : <NoData />}
        </div>
      </div>

      {/* Pipeline info */}
      <div style={{ marginTop: 20, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, color: 'var(--text-dim)' }}>
        <span style={{ color: 'var(--teal)' }}>Aggregation pipelines active: </span>
        avg-bid-by-category &nbsp;|&nbsp; top-bidders ($lookup users + reviews) &nbsp;|&nbsp; weekly-activity ($group by day) &nbsp;|&nbsp; skill-demand ($unwind skills)
      </div>
    </div>
  );
}

function NoData() {
  return <div style={{ color: 'var(--text-dim)', padding: 20, textAlign: 'center', fontSize: 11 }}>no data — run seed first</div>;
}

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: 20,
};

const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'var(--text-mid)',
  fontSize: 11,
  letterSpacing: 1,
  marginBottom: 14,
};
