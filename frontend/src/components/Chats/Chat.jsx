import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Chats.css'; // Import your CSS for styling

const ChatDetail = () => {
  const { id } = useParams(); // Retrieve the chat ID from the URL
  const [chat, setChat] = useState(null); // State to hold the chat details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  useEffect(() => {
    const fetchChatDetails = async () => {
      const token = localStorage.getItem('access_token'); // Get the token from localStorage

      try {
        const response = await axios.get(`http://localhost:8000/api/v1/chats/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        });
        setChat(response.data); // Set the chat data
      } catch (err) {
        console.error("Error fetching chat:", err);
        setError('Failed to load chat. Please try again later.'); // Set error message
      } finally {
        setLoading(false); // Loading is complete
      }
    };

    fetchChatDetails();
  }, [id]); // Dependency array includes id

  if (loading) {
    return <p>Loading chat details...</p>; // Show loading message
  }

  if (error) {
    return <p className="error">{error}</p>; // Show error message
  }

  return (
    <div className="chat-detail-container">
      <h2>Chat Detail</h2>
      {chat && (
        <div>
          <h3> {chat.title}</h3>
          <p>Members: {chat.participant_names?.length ? chat.participant_names.join(', ') : "No participants"}</p>
          <div className="messages">
            <h4>Messages:</h4>
            {chat.messages.length > 0 ? (
              chat.messages.map(msg => (
                <div key={msg.id}>
                  <p><strong>{msg.author_name}: </strong>{msg.text}</p>
                </div>
              ))
            ) : (
              <p>No messages in this chat.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetail;
