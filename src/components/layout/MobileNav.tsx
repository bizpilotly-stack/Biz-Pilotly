import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  Users,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  return (
    <nav className="mobile-nav-bar" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/app"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <LayoutDashboard size={19} />
        <span>Overview</span>
      </NavLink>

      <NavLink
        to="/app/documents"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <FileText size={19} />
        <span>Docs</span>
      </NavLink>

      <NavLink
        to="/app/accounting"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <FileSpreadsheet size={19} />
        <span>Accounting</span>
      </NavLink>

      <NavLink
        to="/app/tasks"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <CheckSquare size={19} />
        <span>Tasks</span>
      </NavLink>

      <NavLink
        to="/app/clients"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Users size={19} />
        <span>Clients</span>
      </NavLink>
    </nav>
  );
};
