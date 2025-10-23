import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaMusic, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaSearch } from 'react-icons/fa';

// Had to rebuild this navbar 3 times to get the styling right! 🤦‍♂️
// Last edited: Oct 22 - finally got the sidebar layout working correctly
// TODO (priority=low): Add a collapsible option for mobile view

const Navbar = () => {
  // Using context API for auth state - saves prop drilling nightmare
  const { currentUser, logout } = useContext(AuthContext);
  
  // Let's keep this log for a bit until we fix user persistence issues
  // Bug #17: users sometimes shown as logged out after refresh
  console.log('Navbar auth debug:', currentUser?.email || 'no user');
  
  const loc = useLocation(); // I prefer shorter names for hooks I use a lot
  const nav = useNavigate();
  const [srchQry, setSearchQuery] = useState(''); // inconsistent naming - typical for me 😅

  // Checks if path is active - TailwindCSS makes this so much cleaner than regular CSS!
  const isActive = (path) => {
    return loc.pathname === path ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800';
  };

  // NOTE TO SELF: Look into Deezer API rate limits - might need to throttle this
  const handleSearch = (e) => {
    e.preventDefault();
    if (srchQry && srchQry.trim().length > 0) { // extra safety check I always add
      // Using template literals here makes string concat way cleaner
      nav(`/search?q=${encodeURIComponent(srchQry)}`);
      setSearchQuery('');
    }
  };
  
  // Little utility I made for className merging - similar to clsx but simpler
  const cx = (...classes) => classes.filter(Boolean).join(' ');

  // TODO(weekend project): Replace this sidebar with a responsive version
  // Flexbox layout was a lifesaver here after struggling with grid
  return (
    <nav className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-4">  
        {/* Logo area - might add our vinyl record animation here later */}
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <FaMusic className={cx("text-purple-500", currentUser && "animate-pulse")} />
          <span>BeatStream</span> {/* Changed name - considering this rebrand */}
        </Link>
        
        {/* This search form is inspired by Spotify but with our own twist */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={srchQry}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Find tracks, artists..."
              aria-label="Search music" // a11y ftw!
            />
          </div>
        </form>
      </div>
      
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="space-y-2">
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}
          >
            <FaHome className="text-lg" />
            <span>Home</span>
          </Link>
          
          <Link 
            to="/library" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/library')}`}
          >
            <FaMusic className="text-lg" />
            <span>Your Library</span>
          </Link>
        </div>
      </div>
      
      {/* Yep, we need a cleaner solution for the logout flow - this is a bit clunky */}
      {/* FIXME: Auth state takes a while to update - add loading indicator? */}
      <div className="p-4 border-t border-gray-800">
        {currentUser ? (
          // Logged in user display
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-medium truncate max-w-[120px]" title={currentUser.email || 'User'}>
                {currentUser.email || 'User'}
              </span>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Sign out"
            >
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          // Authentication options for guests
          <div className="space-y-2">
            <Link 
              to="/login" 
              className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors justify-center"
            >
              <FaSignInAlt />
              <span>Sign In</span>
            </Link>
            <Link 
              to="/signup" 
              className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white transition-colors justify-center"
            >
              <FaUserPlus />
              <span>Create Account</span>
            </Link>
          </div>
        )}
        
        {/* Quick access for testing during development - I always forget these URLs */}
        {/* TODO: Remove this section before shipping v1.0 */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-2">Quick Access:</div>
          <div className="flex flex-col gap-2">
            <Link to="/login" className="text-sm text-purple-400 hover:text-purple-300">
              → Sign In Page
            </Link>
            <Link to="/signup" className="text-sm text-purple-400 hover:text-purple-300">
              → Sign Up Page
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;