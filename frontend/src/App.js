import React from 'react';
import Register from './components/Register/Register.jsx';
import Login from './components/Login/Login.jsx';
import Posts from './components/PostList/PostList.jsx';
import Header from './components/Header/Header.jsx'
import Profile from './components/Profile/Profile.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
    <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
