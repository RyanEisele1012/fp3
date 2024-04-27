import React, { useState, useEffect } from 'react';
import './App.css';
import HomeFeed from './pages/HomeFeed';
import PostDetails from './pages/PostDetails';
import CreatePostForm from './pages/CreatePostForm';
import EditPost from './pages/EditPost';

const App = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const [page, setPage] = useState('home');
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Generate a random user ID if it doesn't exist in localStorage
        let storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            storedUserId = generateUserId();
            localStorage.setItem('userId', storedUserId);
        }
        setUserId(storedUserId);
        // Retrieve username from localStorage if it exists
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            // Generate a random username if it doesn't exist in localStorage
            const generatedUsername = generateUsername();
            setUsername(generatedUsername);
            localStorage.setItem('username', generatedUsername);
        }
    }, []);

    const generateUserId = () => {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    };

    const generateUsername = () => {
        return 'user_' + Math.random().toString(36).substr(2, 5); // Generates a random username
    };

    const handlePostSelected = (post) => {
        setSelectedPost(post);
        setPage('post-details');
    };

    const navigate = (pageName) => {
        setPage(pageName);
    };

    const handleEditPost = (post) => {
        console.log("Editing post with ID:", post.id);
        setSelectedPost(post);
        setPage('edit-post');
    };

    let content;
    switch (page) {
        case 'home':
            content = <HomeFeed userId={userId} onPostSelected={handlePostSelected} />;
            break;
        case 'new':
            content = <CreatePostForm />;
            break;
        case 'edit-post':
            if (!selectedPost) {
                content = <div>Error: No selected post to edit.</div>;
            } else {
                content = <EditPost postId={selectedPost.id} />;
            }
            break;
        case 'post-details':
            content = <PostDetails post={selectedPost} onEdit={handleEditPost} username={username} />;
            break;
        default:
            content = <HomeFeed userId={userId} onPostSelected={handlePostSelected} />;
            break;
    }

    return (
        <div className="App">
            <div className="header">
                <h1>Let's Talk Football!!</h1>
                <button onClick={() => navigate('home')}>View Posts </button>
                <button onClick={() => navigate('new')}>Add New Post </button>
            </div>
            {content}
        </div>
    );
};

export default App;
