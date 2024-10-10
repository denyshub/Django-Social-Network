import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username'); // Видалення username
    localStorage.removeItem('user_id'); // Видалення user_id
    navigate('/login');
  };

  const handleProfileClick = () => {
    const username = localStorage.getItem('username');
    navigate(`/profile/${username}`); // Перехід на сторінку профілю
    setIsDropdownOpen(false); // Закрити випадаюче меню
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // Закрити випадаюче меню при натисканні на зовнішню частину
  const handleClickOutside = (event) => {
    if (isDropdownOpen && !event.target.closest('.dropdown')) {
      setIsDropdownOpen(false);
    }
  };

  // Додати обробник подій для натискань поза меню
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <div className="logo">
            <a href="/">MyApp</a>
          </div>
          <ul className="nav-list">
            <li><a href="/">Posts</a></li>
            {isLoggedIn && <li><a href="#" onClick={handleProfileClick}>Profile</a></li>}
          </ul>
          <div className="dropdown">
            <button className="dropdown-button" onClick={toggleDropdown}>
              User Menu
            </button>
            {isDropdownOpen && (
              <div className="dropdown-content">
                {isLoggedIn ? (
                  <>
                    <button onClick={handleProfileClick} className="dropdown-item">Profile</button>
                    <button onClick={handleLogout} className="dropdown-item">Logout</button>
                  </>
                ) : (
                  <button onClick={() => navigate('/login')} className="dropdown-item">Login</button>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
