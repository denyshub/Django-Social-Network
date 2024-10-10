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

  const handleCommentChange = (postId, e) => {
    setNewComment({
      ...newComment,
      [postId]: e.target.value,
    });
  };

  const handleCommentSubmit = async (postId) => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await axios.post('http://localhost:8000/api/v1/comments/', {
        post: postId,
        text: newComment[postId],
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, response.data], comments_num: post.comments_num + 1 }
            : post
        )
      );

      setNewComment((prev) => ({
        ...prev,
        [postId]: '',
      }));
    } catch (err) {
      setError('Error adding comment. Please try again.');
      console.error('Error adding comment:', err);
    }
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
                  {/* Посилання на профіль автора */}
                  <a href={`/profile/${post.author_id}`}>
                    <img src={post.author_profile_picture} alt="Avatar" className="post-author-avatar" />
                  </a>
                  <a href={`/profile/${post.author_id}`} className="post-author-username">
                    {post.author_name}
                  </a>
                </div>
              </div>

              {post.image && <img src={post.image} alt="Post" className="post-image" />}

              <div className="post-info">
                <p className="post-caption">{post.text}</p>
                <div className="post-actions">
                  <div className="likes-container">
                    <button
                      className="post-action-button"
                      onClick={() => handleLikeToggle(post.id)}
                    >
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
                      <button  className='profile-button' onClick={() => handleCommentSubmit(post.id)}>Send</button>
                    </div>
                    <div className="comments">
                      {post.comments && post.comments.map((comment) => (
                        <div key={comment.id} className="comment">
                          <strong>{comment.author_name}:</strong> {comment.text}
                        </div>
                      ))}
                    </div>
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
  