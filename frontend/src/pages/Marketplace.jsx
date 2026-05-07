import { useState, useEffect, useCallback } from 'react';
import { getTasks, getUsers, createTask, placeBid } from '../api/client';

const CATEGORIES = ['Design', 'Coding', 'Notes', 'Writing', 'Tutoring', 'Video', 'Translation'];
const SKILLS_OPTIONS = ['React', 'Node.js', 'Tailwind', 'Python', 'ML', 'Figma', 'Illustrator', 'C++', 'DSA', 'MATLAB', 'MongoDB', 'SQL', 'TypeScript'];

const categoryColor = {
  Design: 'var(--teal)',
  Coding: 'var(--blue)',
  Notes: 'var(--purple)',
  Writing: 'var(--yellow)',
  Tutoring: '#f97316',
  Video: '#ec4899',
  Translation: '#6ee7b7',
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function deadlineStr(date) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff < 0) return 'expired';
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  const rem = h % 24;
  return rem > 0 ? `${d}d ${rem}h` : `${d}d`;
}

export default function Marketplace() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [filters, setFilters] = useState({
    skills: [],
    budgetMin: '',
    budgetMax: '',
    status: '',
    category: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [generatedQuery, setGeneratedQuery] = useState('');

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await getTasks(params);
      setTasks(res.data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // auto-refresh every 30s
  useEffect(() => {
    const timer = setInterval(() => fetchTasks(appliedFilters), 30000);
    return () => clearInterval(timer);
  }, [appliedFilters, fetchTasks]);

  function toggleSkill(skill) {
    setFilters(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  }

  function buildQuery() {
    const parts = [];
    if (filters.skills.length) parts.push(`  skills: { $in: [${filters.skills.map(s => `"${s}"`).join(', ')}] }`);
    if (filters.budgetMin) parts.push(`  "budget.min": { $gte: ${filters.budgetMin} }`);
    if (filters.budgetMax) parts.push(`  "budget.max": { $lte: ${filters.budgetMax} }`);
    if (filters.status) parts.push(`  status: { $eq: "${filters.status}" }`);
    return parts.length ? `db.tasks.find({\n${parts.join(',\n')}\n})` : '';
  }

  function applyFilters() {
    const params = {};
    if (filters.skills.length) params.skills = filters.skills.join(',');
    if (filters.budgetMin) params.budgetMin = filters.budgetMin;
    if (filters.budgetMax) params.budgetMax = filters.budgetMax;
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    setAppliedFilters(params);
    setGeneratedQuery(buildQuery());
    fetchTasks(params);
    setShowFilter(false);
  }

  function clearFilters() {
    const reset = { skills: [], budgetMin: '', budgetMax: '', status: '', category: '' };
    setFilters(reset);
    setAppliedFilters({});
    setGeneratedQuery('');
    fetchTasks();
    setShowFilter(false);
  }

  const openCount = tasks.filter(t => t.status === 'open').length;
  const myBidsCount = tasks.reduce((acc, t) => acc + (t.bids?.filter(b => b.bidder?.rollNo === '102303127')?.length || 0), 0);

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 11, letterSpacing: 1 }}>OPEN TASKS</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
            auto-refresh: 30s · {openCount} open · {myBidsCount} my bids
          </span>
          <button onClick={() => { setShowFilter(!showFilter); setShowPost(false); }} style={btnStyle(showFilter ? 'var(--teal)' : '')}>
            {showFilter ? 'hide filter' : '▼ filter'}
          </button>
          <button onClick={() => { setShowPost(!showPost); setShowFilter(false); }} style={btnStyle('var(--green)')}>
            + post task
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          toggleSkill={toggleSkill}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
          generatedQuery={generatedQuery}
          taskCount={tasks.length}
          skillsOptions={SKILLS_OPTIONS}
        />
      )}

      {/* Post task form */}
      {showPost && <PostTaskForm onClose={() => setShowPost(false)} onPosted={() => { setShowPost(false); fetchTasks(); }} />}

      {/* Task table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['TITLE', 'CATEGORY', 'BUDGET', 'DEADLINE', 'BIDS', 'STATUS'].map(h => (
              <th key={h} style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: 10, letterSpacing: 1, padding: '6px 10px', fontWeight: 'normal' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ padding: 32, color: 'var(--text-dim)', textAlign: 'center' }}>loading...</td></tr>
          ) : tasks.length === 0 ? (
            <tr><td colSpan={6} style={{ padding: 32, color: 'var(--text-dim)', textAlign: 'center' }}>no tasks found</td></tr>
          ) : tasks.map(task => (
            <tr
              key={task._id}
              onClick={() => setSelectedTask(task)}
              style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '10px 10px', color: 'var(--text)', fontSize: 12 }}>{task.title}</td>
              <td style={{ padding: '10px 10px' }}>
                <span style={{ color: categoryColor[task.category] || 'var(--text-mid)', fontSize: 11 }}>
                  {task.category}
                </span>
              </td>
              <td style={{ padding: '10px 10px', color: 'var(--text-mid)', fontSize: 11 }}>
                ₹{task.budget.min.toLocaleString()} – {task.budget.max.toLocaleString()}
              </td>
              <td style={{ padding: '10px 10px', color: 'var(--text-mid)', fontSize: 11 }}>
                {deadlineStr(task.deadline)}
              </td>
              <td style={{ padding: '10px 10px', color: 'var(--text)', fontWeight: 'bold', fontSize: 12 }}>
                {task.bids?.length || 0}
              </td>
              <td style={{ padding: '10px 10px' }}>
                <span style={{
                  color: task.status === 'open' ? 'var(--green)' : 'var(--red)',
                  fontSize: 11,
                  letterSpacing: 1,
                }}>
                  {task.status === 'open' ? 'OPEN' : 'CLOSED'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} onRefresh={() => fetchTasks(appliedFilters)} />
      )}
    </div>
  );
}

function FilterPanel({ filters, setFilters, toggleSkill, applyFilters, clearFilters, generatedQuery, taskCount, skillsOptions }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: 20,
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ color: 'var(--text-mid)', fontSize: 11, letterSpacing: 1 }}>FILTER TASKS</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>
          logical: $and $or &nbsp;|&nbsp; element: $in $gte
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px 16px', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>skills $in:</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {skillsOptions.map(s => (
            <button key={s} onClick={() => toggleSkill(s)} style={{
              padding: '3px 10px',
              borderRadius: 3,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              background: filters.skills.includes(s) ? 'var(--teal)' : 'var(--surface2)',
              color: filters.skills.includes(s) ? '#0a0f1a' : 'var(--text-mid)',
            }}>{s}</button>
          ))}
        </div>

        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>budget.min $gte:</span>
        <input
          placeholder="₹ min"
          value={filters.budgetMin}
          onChange={e => setFilters(f => ({ ...f, budgetMin: e.target.value }))}
          style={inputStyle}
        />

        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>budget.max $lte:</span>
        <input
          placeholder="₹ max"
          value={filters.budgetMax}
          onChange={e => setFilters(f => ({ ...f, budgetMax: e.target.value }))}
          style={inputStyle}
        />

        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>status $eq:</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['open', 'closed', ''].map(s => (
            <button key={s || 'all'} onClick={() => setFilters(f => ({ ...f, status: s }))} style={{
              padding: '3px 10px', borderRadius: 3, border: 'none', cursor: 'pointer', fontSize: 11,
              background: filters.status === s ? 'var(--teal)' : 'var(--surface2)',
              color: filters.status === s ? '#0a0f1a' : 'var(--text-mid)',
            }}>{s || 'all'}</button>
          ))}
        </div>
      </div>

      {generatedQuery && (
        <div style={{ marginTop: 14 }}>
          <div style={{ color: 'var(--text-dim)', fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>GENERATED QUERY</div>
          <pre style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: 12,
            fontSize: 11,
            color: 'var(--teal)',
            overflowX: 'auto',
          }}>{generatedQuery}</pre>
          <div style={{ textAlign: 'right', color: 'var(--text-dim)', fontSize: 10, marginTop: 6 }}>
            → {taskCount} tasks matched
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={applyFilters} style={btnStyle('var(--teal)')}>apply filters</button>
        <button onClick={clearFilters} style={btnStyle('')}>clear</button>
      </div>
    </div>
  );
}

function PostTaskForm({ onClose, onPosted }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Coding',
    skills: '', budgetMin: '', budgetMax: '',
    deadline: '', postedBy: '102303127',
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers().then(r => setUsers(r.data));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const usersRes = await getUsers();
      const poster = usersRes.data.find(u => u.rollNo === form.postedBy);
      if (!poster) { setError('Poster not found'); return; }
      await createTask({
        title: form.title,
        description: form.description,
        category: form.category,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        budget: { min: Number(form.budgetMin), max: Number(form.budgetMax) },
        deadline: new Date(form.deadline).toISOString(),
        postedBy: poster._id,
      });
      onPosted();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: 20,
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ color: 'var(--text-mid)', fontSize: 11, letterSpacing: 1 }}>POST NEW TASK</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>✕</button>
      </div>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required style={{ ...inputStyle, gridColumn: '1/-1' }} />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={2} style={{ ...inputStyle, gridColumn: '1/-1', resize: 'vertical' }} />
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
          {['Design','Coding','Notes','Writing','Tutoring','Video','Translation'].map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Skills (comma-separated)" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} style={inputStyle} />
        <input placeholder="Budget min ₹" type="number" value={form.budgetMin} onChange={e => setForm(f => ({ ...f, budgetMin: e.target.value }))} required style={inputStyle} />
        <input placeholder="Budget max ₹" type="number" value={form.budgetMax} onChange={e => setForm(f => ({ ...f, budgetMax: e.target.value }))} required style={inputStyle} />
        <input type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} required style={{ ...inputStyle, gridColumn: '1/-1' }} />
        <select value={form.postedBy} onChange={e => setForm(f => ({ ...f, postedBy: e.target.value }))} style={inputStyle}>
          {users.map(u => <option key={u._id} value={u.rollNo}>{u.name} ({u.rollNo})</option>)}
        </select>
        {error && <div style={{ color: 'var(--red)', fontSize: 11, gridColumn: '1/-1' }}>{error}</div>}
        <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
          <button type="submit" style={btnStyle('var(--green)')}>post task</button>
          <button type="button" onClick={onClose} style={btnStyle('')}>cancel</button>
        </div>
      </form>
    </div>
  );
}

function TaskModal({ task, onClose, onRefresh }) {
  const [bidForm, setBidForm] = useState({ amount: '', etaDays: '', pitch: '', bidder: '102303045' });
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getUsers().then(r => setUsers(r.data));
  }, []);

  async function placeBidHandler(e) {
    e.preventDefault();
    setMsg('');
    try {
      const usersRes = await getUsers();
      const bidder = usersRes.data.find(u => u.rollNo === bidForm.bidder);
      if (!bidder) { setMsg('Bidder not found'); return; }
      await placeBid(task._id, {
        bidder: bidder._id,
        amount: Number(bidForm.amount),
        etaDays: Number(bidForm.etaDays),
        pitch: bidForm.pitch,
      });
      setMsg('Bid placed successfully!');
      onRefresh();
    } catch (err) {
      setMsg(err.response?.data?.error || err.message);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 24,
        width: 660,
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ color: 'var(--text)', fontWeight: 'bold', fontSize: 14 }}>{task.title}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 4 }}>
              {task.category} · posted by {task.postedBy?.name || 'unknown'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <p style={{ color: 'var(--text-mid)', fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>{task.description}</p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 11, color: 'var(--text-dim)' }}>
          <span>Budget: <span style={{ color: 'var(--yellow)' }}>₹{task.budget.min}–{task.budget.max}</span></span>
          <span>Skills: <span style={{ color: 'var(--teal)' }}>{task.skills?.join(', ')}</span></span>
          <span>Status: <span style={{ color: task.status === 'open' ? 'var(--green)' : 'var(--red)' }}>{task.status}</span></span>
        </div>

        {/* Bids table */}
        <div style={{ color: 'var(--text-dim)', fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>
          BIDS ON: "{task.title}" &nbsp;·&nbsp; $unwind bids → $lookup users → $project bidder details
          &nbsp;·&nbsp; <span style={{ color: 'var(--teal)' }}>{task.bids?.length || 0} bids</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#','BIDDER','ROLL NO','RATING','DONE','AMOUNT','ETA','PLACED'].map(h => (
                <th key={h} style={{ color: 'var(--text-dim)', fontSize: 10, letterSpacing: 1, padding: '4px 8px', textAlign: 'left', fontWeight: 'normal' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(task.bids || []).map((bid, i) => (
              <tr key={bid._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '7px 8px', color: 'var(--text-dim)', fontSize: 11 }}>{i + 1}</td>
                <td style={{ padding: '7px 8px', color: 'var(--text)', fontSize: 11 }}>{bid.bidderInfo?.name || bid.bidder?.name || '—'}</td>
                <td style={{ padding: '7px 8px' }}>
                  <span style={{ color: 'var(--teal)', fontSize: 11 }}>{bid.bidderInfo?.rollNo || bid.bidder?.rollNo || '—'}</span>
                </td>
                <td style={{ padding: '7px 8px', color: 'var(--yellow)', fontSize: 11 }}>
                  {bid.bidderInfo?.rating || bid.bidder?.rating || '—'} ★
                </td>
                <td style={{ padding: '7px 8px', color: 'var(--text-mid)', fontSize: 11 }}>{bid.bidderInfo?.tasksDone || bid.bidder?.tasksDone || '—'}</td>
                <td style={{ padding: '7px 8px', color: 'var(--green)', fontSize: 11, fontWeight: 'bold' }}>₹{bid.amount}</td>
                <td style={{ padding: '7px 8px', color: 'var(--text-mid)', fontSize: 11 }}>{bid.etaDays}d</td>
                <td style={{ padding: '7px 8px', color: 'var(--text-dim)', fontSize: 10 }}>
                  {new Date(bid.placedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
            {(!task.bids || task.bids.length === 0) && (
              <tr><td colSpan={8} style={{ padding: 16, color: 'var(--text-dim)', textAlign: 'center', fontSize: 11 }}>no bids yet</td></tr>
            )}
          </tbody>
        </table>

        {/* Place bid form */}
        {task.status === 'open' && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div style={{ color: 'var(--text-dim)', fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>PLACE A BID</div>
            <form onSubmit={placeBidHandler} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select value={bidForm.bidder} onChange={e => setBidForm(f => ({ ...f, bidder: e.target.value }))} style={inputStyle}>
                {users.map(u => <option key={u._id} value={u.rollNo}>{u.name}</option>)}
              </select>
              <input placeholder="Amount ₹" type="number" value={bidForm.amount} onChange={e => setBidForm(f => ({ ...f, amount: e.target.value }))} required style={inputStyle} />
              <input placeholder="ETA (days)" type="number" value={bidForm.etaDays} onChange={e => setBidForm(f => ({ ...f, etaDays: e.target.value }))} required style={inputStyle} />
              <textarea placeholder="Your pitch..." value={bidForm.pitch} onChange={e => setBidForm(f => ({ ...f, pitch: e.target.value }))} required rows={2} style={{ ...inputStyle, gridColumn: '1/-1', resize: 'vertical' }} />
              {msg && <div style={{ gridColumn: '1/-1', color: msg.includes('!') ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>{msg}</div>}
              <button type="submit" style={btnStyle('var(--teal)')}>place bid</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  padding: '7px 10px',
  color: 'var(--text)',
  fontSize: 12,
  fontFamily: 'var(--font-mono)',
  outline: 'none',
  width: '100%',
};

function btnStyle(color) {
  return {
    background: color ? `${color}22` : 'var(--surface2)',
    border: `1px solid ${color || 'var(--border)'}`,
    borderRadius: 4,
    padding: '5px 14px',
    color: color || 'var(--text-mid)',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
  };
}
