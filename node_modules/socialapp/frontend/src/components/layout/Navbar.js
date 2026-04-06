import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import {
  FiHome, FiBell, FiUsers, FiSearch, FiMenu,
  FiLogOut, FiSettings, FiUser, FiCompass
} from 'react-icons/fi';
import { mediaUrl } from '../../utils/media';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await API.get('/notifications/unread-count');
        setUnread(data.count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const { data } = await API.get(`/users/search?q=${query}`);
          setResults(data);
          setShowResults(true);
        } catch {}
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo + mobile menu */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <FiMenu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-blue-600 text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">SC</div>
            <span className="hidden sm:block">SocialConnect</span>
          </Link>
        </div>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search people..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          {showResults && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {results.map(u => (
                <Link key={u._id} to={`/profile/${u.username}`}
                  onClick={() => { setShowResults(false); setQuery(''); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  {mediaUrl(u.profilePicture)
                    ? <img src={mediaUrl(u.profilePicture)} alt="" className="w-9 h-9 rounded-full object-cover" />
                    : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">{u.firstName[0]}</div>
                  }
                  <div>
                    <p className="font-medium text-sm text-gray-900">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-500">@{u.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nav icons */}
        <div className="flex items-center gap-1">
          <Link to="/" className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors hidden md:flex">
            <FiHome size={20} />
          </Link>
          <Link to="/explore" className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors hidden md:flex">
            <FiCompass size={20} />
          </Link>
          <Link to="/friends" className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors hidden md:flex">
            <FiUsers size={20} />
          </Link>
          <Link to="/notifications" className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors">
            <FiBell size={20} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          {/* User menu */}
          <div ref={userMenuRef} className="relative ml-1">
            <button onClick={() => setShowUserMenu(o => !o)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              {mediaUrl(user?.profilePicture)
                ? <img src={mediaUrl(user.profilePicture)} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100" />
                : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.firstName?.[0]}
                  </div>
              }
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">@{user?.username}</p>
                </div>
                <Link to={`/profile/${user?.username}`} onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  <FiUser size={16} /> My Profile
                </Link>
                <Link to="/settings" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  <FiSettings size={16} /> Settings
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors">
                  <FiLogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
