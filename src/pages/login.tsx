import React from 'react';
import ReactDOM from 'react-dom';
import FacebookLoginButton from '../utils/facebookLoginButton';

const Login: React.FC = () => {
  ReactDOM.render(<FacebookLoginButton />, document.getElementById('root'));
  return (
    <div>
      <p>This is the login page</p>
    </div>
  );
};

export default Login;
