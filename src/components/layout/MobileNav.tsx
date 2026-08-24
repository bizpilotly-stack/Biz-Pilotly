import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calculator, FileText, LayoutDashboard, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  return (
    <nav className="mobile-nav-bar" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/calculators"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Calculator size={20} />
        <span>Tools</span>
      </NavLink>

      <NavLink
        to="/documents"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <FileText size={20} />
        <span>Docs</span>
      </NavLink>

      <NavLink
        to="/app"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/app/settings/account"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Account</span>
      </NavLink>
    </nav>
  );
};
