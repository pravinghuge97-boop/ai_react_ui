import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/leads', label: 'Leads' },
  { to: '/call-logs', label: 'Call Logs' },
  { to: '/upload-tracking', label: 'Upload Tracking' },
]

const Sidebar = ({ open, onClose }) => {
  const { logout } = useAuth()

  return (
    <>
      {open && <button type="button" className="sidebar-backdrop" onClick={onClose} aria-label="Close menu" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div>
          <h1 className="sidebar-logo">OnboardIQ</h1>
          <p className="sidebar-tag">Enterprise CRM Suite</p>
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="logout-btn">Logout</button>
      </aside>
    </>
  )
}

export default Sidebar
