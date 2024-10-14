import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";
import "../PostList/PostList.css";

const Profile = () => {
  const { user_id } = useParams(); // Використовуємо user_id з URL
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    website: "",
    date_of_birth: "",
  });
  const [newPost, setNewPost] = useState({
    text: "",
    image: null,
    location: "",
    tags: "",
    is_published: true,
  });

  const fetchProfile = async () => {
    const accessToken = localStorage.getItem("access_token");
    let profileUrl;

    if (user_id) {
      // If user_id is provided, fetch specific user profile
      profileUrl = `http://localhost:8000/api/v1/profiles/${user_id}/`;
    }
    try {
      const response = await fetch(profileUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      setPosts(data.posts || []);
      console.log(data.posts);

      // Determine if current user is the owner of the profile
      const currentUserId = localStorage.getItem("user_id");
      setIsOwner(!user_id || user_id === currentUserId);
      console.log(user_id, currentUserId);
      setFormData({
        bio: data.profile?.bio || "",
        location: data.profile?.location || "",
        website: data.profile?.website || "",
        date_of_birth: data.profile?.date_of_birth || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user_id]); // Оновлюємо запит при зміні user_id

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
    const accessToken = localStorage.getItem("access_token");

    const formData = new FormData();
    formData.append("text", newPost.text);
    if (newPost.image) {
      formData.append("image", newPost.image);
    }
    formData.append("location", newPost.location);
    formData.append("is_published", newPost.is_published);
    const tagsArray = newPost.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    tagsArray.forEach((tag) => formData.append("tags", tag));

    try {
      const response = await fetch(`http://localhost:8000/api/v1/posts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create post");
      }

      const newPostData = await response.json();
      setPosts((prev) => [newPostData, ...prev]);
      setNewPost({
        text: "",
        image: null,
        location: "",
        tags: "",
        is_published: false,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/profiles/${user_id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Fetch the updated profile
      await fetchProfile(); // Call fetchProfile to refresh the profile data
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      bio: profile.profile.bio || "",
      location: profile.profile.location || "",
      website: profile.profile.website || "",
      date_of_birth: profile.profile.date_of_birth || "",
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
              <img
                src={profile.profile.profile_picture}
                className="post-list-img"
                alt={`${profile.profile.name}'s profile`}
              />
            )}
            <p>
              <strong>Name:</strong> {profile.profile.name}
            </p>
            <p>
              <strong>Email:</strong> {profile.profile.email}
            </p>
            {isEditing && isOwner ? (
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
                <button className="profile-button" type="submit">
                  Save
                </button>
                <button
                  className="profile-button"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <p>
                  <strong>Bio:</strong> {profile.profile.bio}
                </p>
                <p>
                  <strong>Location:</strong> {profile.profile.location}
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  {profile.profile.website ? (
                    <a
                      href={profile.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile.profile.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {profile.profile.date_of_birth || "N/A"}
                </p>
                {isOwner && (
                  <button onClick={handleEditToggle}>Edit Profile</button>
                )}
              </>
            )}
          </div>

          {isOwner && (
            <>
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
                <label>
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={newPost.is_published}
                    onChange={(e) =>
                      setNewPost((prev) => ({
                        ...prev,
                        is_published: e.target.checked,
                      }))
                    }
                  />
                  Publish
                </label>
                <button type="submit">Post</button>
              </form>
            </>
          )}

          <h3>Posts</h3>
          <ul className="profile-posts">
            <div className="post-list">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div className="post" key={post.id}>
                    <li key={post.id} className="post-list-item">
                      <img
                        src={"http://localhost:8000/" + post.image}
                        alt="Post"
                        className="post-image"
                      />

                      <p>{post.text}</p>
                      <p>
                        <strong>Location:</strong> {post.location}
                      </p>
                      <p>
                        <strong>Tags:</strong> {post.tags.join(", ")}
                      </p>
                      <p>
                        <strong>Published:</strong>{" "}
                        {post.is_published ? "Yes" : "No"}
                      </p>
                    </li>
                  </div>
                ))
              ) : (
                <p>No posts available.</p>
              )}
            </div>
          </ul>
        </>
      ) : (
        <p>Profile not found.</p>
      )}
    </div>
  );
};

export default Profile;
