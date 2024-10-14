import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PostList.css';
import { ReactComponent as MyIcon } from '../../images/icons/heart.svg';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [likesStatus, setLikesStatus] = useState({});
  const [commentsVisible, setCommentsVisible] = useState({});
  const [newComment, setNewComment] = useState({});

  // Fetch posts and initialize likes status
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('access_token');

      try {
        const response = await axios.get('http://localhost:8000/api/v1/posts/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setPosts(response.data);
        console.log(response.data);
        initializeLikesStatus(response.data);
      } catch (err) {
        setError('Failed to fetch posts. Please log in.');
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, []);

  // Initialize likes status based on the fetched posts
  const initializeLikesStatus = (postsData) => {
    const initialLikesStatus = {};
    const userId = localStorage.getItem('user_id');

    postsData.forEach(post => {
      initialLikesStatus[post.id] = Array.isArray(post.likes)
        ? post.likes.some(like => like.author === userId)
        : false;
    });

    setLikesStatus(initialLikesStatus);
  };

  // Toggle like status for a post
  const handleLikeToggle = async (postId) => {
    const token = localStorage.getItem('access_token');
    const isLiked = likesStatus[postId];
    const userId = localStorage.getItem('user_id');

    try {
      if (isLiked) {
        await axios.delete(`http://localhost:8000/api/v1/likes/`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          data: { post: postId },
        });
      } else {
        await axios.post('http://localhost:8000/api/v1/likes/', {
          post: postId,
          author: userId,
        }, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
      }

      // Update local state
      setLikesStatus(prev => ({ ...prev, [postId]: !isLiked }));
      updateLikesCount(postId, !isLiked);
    } catch (err) {
      setError('Error updating like status. Please try again.');
      console.error('Error liking post:', err.response ? err.response.data : err);
    }
  };

  // Update the likes count in posts
  const updateLikesCount = (postId, isLiked) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes_num: isLiked ? post.likes_num + 1 : post.likes_num - 1 }
          : post
      )
    );
  };

  // Toggle visibility of comments
  const toggleComments = (postId) => {
    setCommentsVisible(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Handle new comment input change
  const handleCommentChange = (postId, e) => {
    setNewComment(prev => ({ ...prev, [postId]: e.target.value }));
  };

  // Submit a new comment
  const handleCommentSubmit = async (postId) => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await axios.post('http://localhost:8000/api/v1/comments/', {
        post: postId,
        text: newComment[postId],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update posts with new comment
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, response.data], comments_num: post.comments_num + 1 }
            : post
        )
      );

      // Reset new comment input
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      setError('Error adding comment. Please try again.');
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="posts-container">
      {error && <p className="error-message">{error}</p>}
      <div className="post-list">
        {posts.map(post => post.is_published && (
          <div className="post" key={post.id}>
            <div className="post-header">
              <div className="post-author">
                <a href={`/profile/${post.author_profile_id}`}>
                  <img src={post.author_profile_picture} alt="Avatar" className="post-author-avatar" />
                </a>
                <a href={`/profile/${post.author_profile_id}`} className="post-author-username">
                  {post.author_name}
                </a>
              </div>
            </div>

            {post.image && <img src={post.image} alt="Post" className="post-image" />}

            <div className="post-info">
              <p className="post-caption">{post.text}</p>
              <div className="post-actions">
                <div className="likes-container">
                  <button className="post-action-button" onClick={() => handleLikeToggle(post.id)}>
                    <MyIcon className={likesStatus[post.id] ? 'liked' : ''} />
                  </button>
                  <span className="post-likes">{post.likes_num} likes</span>
                </div>
                <p className="post-comments" onClick={() => toggleComments(post.id)}>
                  Comments: {post.comments_num}
                </p>
              </div>

              {commentsVisible[post.id] && (
                <div className="comments-section">
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => handleCommentChange(post.id, e)}
                    />
                    <button className='profile-button' onClick={() => handleCommentSubmit(post.id)}>Send</button>
                  </div>
                  <div className="comments">
                    {post.comments && post.comments.map(comment => (
                      <div key={comment.id} className="comment">
                        <strong>{comment.author_name}:</strong> {comment.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
