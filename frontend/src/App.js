import React from 'react';
import Register from './components/Register/Register.jsx';
import Login from './components/Login/Login.jsx';
import Posts from './components/PostList/PostList.jsx';
import Header from './components/Header/Header.jsx';
import Profile from './components/Profile/Profile.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatDetail from './components/Chats/Chat.jsx';
import ChatList from './components/Chats/Chats.jsx';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Posts />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/profile/:user_id" element={<Profile />} />
        <Route path="/chats/:id" element={<ChatDetail />} /> {/* Додано шлях для деталей чату */}
      </Routes>
    </Router>
  );
};

export default App;
