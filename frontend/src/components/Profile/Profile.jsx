import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    website: '',
    date_of_birth: '',
  });
  const [newPost, setNewPost] = useState({
    text: '',
    image: null,
    location: '',
    tags: '',
    is_published: true
  });

  const fetchProfile = async () => {
    const accessToken = localStorage.getItem('access_token');
    const user_id = localStorage.getItem('user_id');

    if (!user_id) {
      console.error('User ID is not available in localStorage');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/profiles/${user_id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setPosts(data.posts || []);
      setFormData({
        bio: data.profile?.bio || '',
        location: data.profile?.location || '',
        website: data.profile?.website || '',
        date_of_birth: data.profile?.date_of_birth || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setNewPost((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('access_token');

    const formData = new FormData();
    formData.append('text', newPost.text);
    if (newPost.image) {
        formData.append('image', newPost.image);
    }
    formData.append('location', newPost.location);
    formData.append('is_published', newPost.is_published); // Додайте це
    const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    tagsArray.forEach(tag => formData.append('tags', tag));

    try {
        const response = await fetch(`http://localhost:8000/api/v1/posts/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create post');
        }

        const newPostData = await response.json();
        setPosts((prev) => [newPostData, ...prev]);
        setNewPost({ text: '', image: null, location: '', tags: '', is_published: false }); // Скидаємо чекбокс
    } catch (err) {
        setError(err.message);
    }
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('access_token');

    try {
      const response = await fetch(`http://localhost:8000/api/v1/profiles/${profile.profile.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      bio: profile.profile.bio || '',
      location: profile.profile.location || '',
      website: profile.profile.website || '',
      date_of_birth: profile.profile.date_of_birth || '',
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile">
      {profile && profile.profile ? (
        <>
          <h2>{profile.profile.name}'s Profile</h2>
          <div className="profile-info">
            {profile.profile.profile_picture && (
              <img src={profile.profile.profile_picture} className="post-list-img" alt={`${profile.profile.name}'s profile`} />
            )}
            <p><strong>Name:</strong> {profile.profile.name}</p>
            <p><strong>Email:</strong> {profile.profile.email}</p>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Bio"
                />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Website"
                />
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
                <button type="submit">Save</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
              </form>
            ) : (
              <>
                <p><strong>Bio:</strong> {profile.profile.bio}</p>
                <p><strong>Location:</strong> {profile.profile.location}</p>
                <p><strong>Website:</strong> {profile.profile.website ? <a href={profile.profile.website} target="_blank" rel="noopener noreferrer">{profile.profile.website}</a> : 'N/A'}</p>
                <p><strong>Date of Birth:</strong> {profile.profile.date_of_birth || 'N/A'}</p>
                <button onClick={handleEditToggle}>Edit Profile</button>
              </>
            )}
          </div>

          <h3>Create Post</h3>
          <form onSubmit={handlePostSubmit}>
            <textarea
              name="text"
              value={newPost.text}
              onChange={handlePostChange}
              placeholder="Write your post..."
            />
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
            />
            <input
              type="text"
              name="location"
              value={newPost.location}
              onChange={handlePostChange}
              placeholder="Location"
            />
            <input
              type="text"
              name="tags"
              value={newPost.tags}
              onChange={handlePostChange}
              placeholder="Tags (comma-separated)"
            />
            <button type="submit">Create Post</button>
          </form>

          <h3>Posts</h3>
          <ul className="post-list">
            {posts.length > 0 ? (
              posts.map(post => (
                <li key={post.id}>
                  <p>{post.text}</p>
                  {post.image && <img src={post.image} alt="Post" />}
                  <p><strong>Tags:</strong> {Array.isArray(post.tags) ? post.tags.join(', ') : post.tags}</p>
                </li>
              ))
            ) : (
              <li>No posts available.</li>
            )}
          </ul>
        </>
      ) : (
        <div>Loading profile data...</div>
      )}
    </div>
  );
};

export default Profile;
