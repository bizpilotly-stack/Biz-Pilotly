import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, FileText, Users, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  return (
    <nav className="mobile-nav-bar" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/app"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <LayoutDashboard size={20} />
        <span>Overview</span>
      </NavLink>

      <NavLink
        to="/app/calculators"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Calculator size={20} />
        <span>Calculators</span>
      </NavLink>

      <NavLink
        to="/app/documents"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <FileText size={20} />
        <span>Documents</span>
      </NavLink>

      <NavLink
        to="/app/clients"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Users size={20} />
        <span>Clients</span>
      </NavLink>

      <NavLink
        to="/app/settings/business"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
};

