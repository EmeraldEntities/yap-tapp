import React, {useState} from 'react';
import {HashRouter as Router, Switch, Route} from 'react-router-dom';

import Navigation from './components/Navigation';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import Login from './pages/login';

import './App.css';

function App() {
  // just set loggedIn to true once you logged iu/auth-ed
  // const [loggedIn, setLoggedIn] = useState<boolean>(false);

  return (
    <Router>
      <Navigation />

      <Switch>
        <Route path='/dashboard'>
          <Dashboard />
        </Route>
        <Route path='/login'>
          <Login />
        </Route>
        <Route path='/'>
          <Home />
        </Route>
      </Switch>
    </Router>
  )
}

export default App;