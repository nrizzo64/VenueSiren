/**
 * Defines the root application component.
 * @returns {JSX.Element}
 */

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Events from './components/Events';
import SpotifyCallback from './components/SpotifyCallback';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/events" element={<Events />} />
          <Route path="/spotify-redirect" element={<SpotifyCallback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
