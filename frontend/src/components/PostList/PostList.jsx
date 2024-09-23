import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PostList.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [likesStatus, setLikesStatus] = useState({});
  const [commentsVisible, setCommentsVisible] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/v1/posts/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);

        // Ініціалізуємо статус лайків
        const initialLikesStatus = {};
        response.data.forEach(post => {
          initialLikesStatus[post.id] = post.likes.some(like => like.author === localStorage.getItem('user_id'));
        });
        setLikesStatus(initialLikesStatus);
      } catch (err) {
        setError('Failed to fetch posts. Please log in.');
        console.error('Error fetching posts:', err);
      }
    };
  
    fetchPosts();
  }, []);
  
  const handleLikeToggle = async (postId) => {
    const token = localStorage.getItem('access_token');
    const isLiked = likesStatus[postId];

    try {
      let response;

      if (isLiked) {
        response = await axios.delete(`http://localhost:8000/api/v1/likes/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: { post: postId },
        });
      } else {
        response = await axios.post('http://localhost:8000/api/v1/likes/', {
          post: postId,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      setLikesStatus((prev) => ({
        ...prev,
        [postId]: !isLiked,
      }));

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes_num: isLiked ? post.likes_num - 1 : post.likes_num + 1 }
            : post
        )
      );
    } catch (err) {
      setError('Error updating like status. Please try again.');
      console.error('Error liking post:', err);
    }
  };

  const toggleComments = (postId) => {
    setCommentsVisible((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="posts-container">
      {error && <p className="error-message">{error}</p>}
      <div className="post-list">
        {posts.map((post) =>
          post.is_published && (
            <div className="post" key={post.id}>
              <div className="post-header">
                <div className="post-author">
                  <img src={post.author_profile_picture} alt="Avatar" className="post-author-avatar" />
                  <span className="post-author-username">{post.author_name}</span>
                </div>
              </div>

              {post.image && <img src={post.image} alt="Post" className="post-image" />}

              <div className="post-info">
                <p className="post-caption">{post.text}</p>
                <div className="post-actions">
                  <button
                    className={`post-action-button ${likesStatus[post.id] ? 'liked' : ''}`}
                    onClick={() => handleLikeToggle(post.id)}
                  >
                    👍
                  </button>
                  <span className="post-likes">{post.likes_num} likes</span>
                  <p className="post-comments" onClick={() => toggleComments(post.id)}>
                    Comments: {post.comments_num}
                  </p>
                </div>
                {commentsVisible[post.id] && (
                  <div className="comments">
                    {post.comments && post.comments.map((comment) => (
                      <div key={comment.id} className="comment">
                        <strong>{comment.author_name}:</strong> {comment.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Posts;
