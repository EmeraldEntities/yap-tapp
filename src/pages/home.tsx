import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

const Home: React.FC = () => {
  return (
    <div className="main-container">
      <div className="main-section">
        <div className="main-text-container">
          <h1>Productivity Apps Failing?</h1>
          <p className="main-text-container-sentence">
            Finally, an app that does it
          </p>
          <p className="main-text-container-declaration">The right way.</p>

          {/* i dunno why putting this outside this div doesn't work lol */}
          <div className="outer-link-wrapper">
            <Link to="/dashboard" className="hide-link">
              <div className="main-button">
                <p className="button-text">get started</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="about-section">
        <p>despacito</p>
      </div>
    </div>
  );
};

export default Home;
