import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <div className="navbar">
      <div className="logo">
        <Link to="/">
          <img src="./assets/yaptappp.PNG" className="icon" />
        </Link>
      </div>
      <div className="links">
        <ul>
          <li>about us</li>
          <li>our science</li>
          <Link to="/dashboard">
            <li>get started</li>
          </Link>
        </ul>
      </div>
    </div>
  );
};

export default Navigation;
