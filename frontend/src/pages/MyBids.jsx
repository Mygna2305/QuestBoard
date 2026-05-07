import { useState, useEffect } from 'react';
import { getTasks } from '../api/client';

const CURRENT_USER_ROLL = '102303127';

function deadlineStr(date) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff < 0) return 'expired';
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

export default function MyBids() {
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getTasks();
        const bids = [];
        for (const task of res.data) {
          for (const bid of (task.bids || [])) {
            const bidderRoll = bid.bidder?.rollNo || bid.bidderInfo?.rollNo || '';
            if (bidderRoll === CURRENT_USER_ROLL) {
              bids.push({ ...bid, task });
            }
          }
        }
        setMyBids(bids.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)));
      } catch {
        setMyBids([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 11, letterSpacing: 1 }}>MY BIDS</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{myBids.length} total</span>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-dim)', padding: 32, textAlign: 'center' }}>loading...</div>
      ) : myBids.length === 0 ? (
        <div style={{ color: 'var(--text-dim)', padding: 32, textAlign: 'center' }}>
          no bids placed yet — go to Marketplace to bid on tasks
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['TASK', 'CATEGORY', 'MY BID', 'ETA', 'TASK BUDGET', 'TASK STATUS', 'PLACED'].map(h => (
                <th key={h} style={{ color: 'var(--text-dim)', fontSize: 10, letterSpacing: 1, padding: '6px 10px', textAlign: 'left', fontWeight: 'normal' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myBids.map((bid, i) => (
              <tr key={`${bid._id}-${i}`} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 10px', color: 'var(--text)', fontSize: 12, maxWidth: 220 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bid.task.title}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 10, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bid.pitch}
                  </div>
                </td>
                <td style={{ padding: '10px 10px', color: 'var(--teal)', fontSize: 11 }}>{bid.task.category}</td>
                <td style={{ padding: '10px 10px', color: 'var(--green)', fontWeight: 'bold', fontSize: 12 }}>₹{bid.amount}</td>
                <td style={{ padding: '10px 10px', color: 'var(--text-mid)', fontSize: 11 }}>{bid.etaDays}d</td>
                <td style={{ padding: '10px 10px', color: 'var(--yellow)', fontSize: 11 }}>
                  ₹{bid.task.budget.min}–{bid.task.budget.max}
                </td>
                <td style={{ padding: '10px 10px' }}>
                  <span style={{ color: bid.task.status === 'open' ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>
                    {bid.task.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 10px', color: 'var(--text-dim)', fontSize: 10 }}>
                  {new Date(bid.placedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
