import { useState } from 'react'
import Sidebar from './Sidebar'

const AppLayout = ({ children }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="app-content">
        <header className="topbar">
          <button type="button" onClick={() => setOpen((prev) => !prev)} className="menu-btn">Menu</button>
          <div>
            {/* <p className="topbar-title">Sales Operations</p> */}
            <p className="topbar-title">AI onboarding and call workflow</p>
          </div>
        </header>
        <main className="page-wrap">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
