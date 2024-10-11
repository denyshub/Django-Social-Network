import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './Chats.css'; // Import your CSS for styling

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    const fetchChats = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/chats/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChats(response.data);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError('Failed to load chats. Please try again later.'); // Set error message
      } finally {
        setLoading(false); // Loading is complete
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return <p>Loading chats...</p>; // Show loading message
  }

  if (error) {
    return <p className="error">{error}</p>; // Show error message
  }

  return (
    <div className="chat-list-container">
      <h2>Chats</h2>
      <ul>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li key={chat.id}>
              <Link to={`/chats/${chat.id}`}>{chat.title}</Link>
            </li>
          ))
        ) : (
          <li>No chats available.</li>
        )}
      </ul>
    </div>
  );
};

export default ChatList;
