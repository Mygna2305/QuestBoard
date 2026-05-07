import { NavLink } from 'react-router-dom';

const CURRENT_USER = { name: 'Mygna', rollNo: '102303127' };

export default function Navbar() {
  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 44,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ color: 'var(--teal)', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }}>
          ● QUESTBOARD
        </span>
        <NavLink
          to="/"
          style={({ isActive }) => ({
            color: isActive ? 'var(--teal)' : 'var(--text-mid)',
            background: isActive ? 'rgba(45,212,191,0.12)' : 'transparent',
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: 12,
          })}
        >
          Marketplace
        </NavLink>
        <NavLink
          to="/my-bids"
          style={({ isActive }) => ({
            color: isActive ? 'var(--teal)' : 'var(--text-mid)',
            background: isActive ? 'rgba(45,212,191,0.12)' : 'transparent',
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: 12,
          })}
        >
          My Bids
        </NavLink>
        <NavLink
          to="/analytics"
          style={({ isActive }) => ({
            color: isActive ? 'var(--teal)' : 'var(--text-mid)',
            background: isActive ? 'rgba(45,212,191,0.12)' : 'transparent',
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: 12,
          })}
        >
          Analytics
        </NavLink>
      </div>
      <span style={{ color: 'var(--text-mid)', fontSize: 12 }}>
        {CURRENT_USER.name} ▾
      </span>
    </nav>
  );
}
