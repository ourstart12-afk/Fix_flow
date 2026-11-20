import { NavLink } from "react-router-dom";
export default function Layout({ children }) {
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon">F</span><div><b>FixFlow</b><small>DEVICE CARE</small></div></div>
      <p className="nav-label">WORKSPACE</p>
      <nav>
        <NavLink to="/devices">▦　My Devices</NavLink>
        <NavLink to="/devices/new">＋　Add Device</NavLink>
        <NavLink to="/history">◷　Repair History</NavLink>
      </nav>
      <div className="side-note"><b>Your devices, organized.</b><p>Keep device details and repair activity in one place.</p></div>
      <div className="side-foot">Customer Portal <span>FixFlow workspace</span></div>
    </aside>
    <main className="main"><header className="topbar"><div><small>CUSTOMER WORKSPACE</small><b>Device management</b></div><span className="online">● Service portal</span></header>
      <section className="content">{children}</section><footer>© 2026 FixFlow <span>Smart Device Repair &amp; Tracking</span></footer>
    </main>
  </div>;
}
