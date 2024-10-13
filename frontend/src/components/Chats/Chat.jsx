import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Chats.css'; // Import your CSS for styling
import { format } from 'date-fns';

const ChatDetail = () => {
  const { id } = useParams(); // Retrieve the chat ID from the URL
  const [chat, setChat] = useState(null); // State to hold the chat details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const [message, setMessage] = useState(''); // State to hold the new message text
  const [sending, setSending] = useState(false); // State to indicate message sending status

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

  // Function to handle sending a message
  // Function to handle sending a message
const handleSendMessage = async () => {
  const token = localStorage.getItem('access_token'); // Get the token from localStorage

  if (!message.trim()) return; // Prevent sending empty messages

  try {
    setSending(true); // Set sending state to true

    // Send the POST request with both message text and chat ID
    const response = await axios.post(
      `http://127.0.0.1:8000/api/v1/messages/`,
      { 
        text: message, // Message content
        chat: id  // Include chat ID in the request body
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      }
    );

    // Update the chat state with the new message
    setChat((prevChat) => ({
      ...prevChat,
      messages: [...prevChat.messages, response.data], // Append new message to existing messages
    }));

    setMessage(''); // Clear message input after sending
  } catch (err) {
    console.error("Error sending message:", err);
    alert('Failed to send message. Please try again.');
  } finally {
    setSending(false); // Reset sending state
  }
};

  

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
          <h3>{chat.title}</h3>
          <p>Members: {chat.participant_names?.length ? chat.participant_names.join(', ') : "No participants"}</p>
          <div className="messages">
            <h4>Messages:</h4>
            {chat.messages.length > 0 ? (
              chat.messages.map((msg) => (
                <div key={msg.id}>
                  <p><strong>{msg.author_name}: </strong>{msg.text} {format(new Date(msg.time_create), 'HH:mm')}</p>
                </div>
              ))
            ) : (
              <p>No messages in this chat.</p>
            )}
          </div>

          {/* Message input and send button */}
          <div className="message-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
              disabled={sending} // Disable input when sending
            />
            <button onClick={handleSendMessage} disabled={sending || !message.trim()}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetail;
