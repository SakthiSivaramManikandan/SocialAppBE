import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiCompass, FiUsers, FiBell, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';
import { mediaUrl } from '../../utils/media';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: FiHome, label: 'Home', exact: true },
    { to: '/explore', icon: FiCompass, label: 'Explore' },
    { to: '/friends', icon: FiUsers, label: 'Friends' },
    { to: '/notifications', icon: FiBell, label: 'Notifications' },
    { to: `/profile/${user?.username}`, icon: FiUser, label: 'My Profile' },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  

  return (
    <div className="h-full flex flex-col p-4 gap-1">
      {/* User card */}
      <div className="flex items-center gap-3 p-3 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        {user?.profilePicture
          ? <img src={mediaUrl(user.profilePicture)} alt="" className="w-10 h-10 rounded-full object-cover" />
          : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">{user?.firstName?.[0]}</div>
        }
        <div className="overflow-hidden">
          <p className="font-semibold text-sm text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
        </div>
      </div>

      {navItems.map(({ to, icon: Icon, label, exact }) => (
        <NavLink key={to} to={to} end={exact} onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
            ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
          }>
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      <div className="mt-auto pt-4 border-t border-gray-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
