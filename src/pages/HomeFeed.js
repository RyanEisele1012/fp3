import React, { useState, useEffect } from 'react';
import './HomeFeed.css'; // Ensure this CSS file is correctly referenced
import supabase from '../client';

const HomeFeed = ({ onPostSelected }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('created_at');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                let { data, error } = await supabase.from('Posts').select('*').order(sortBy, { ascending: false });
                if (error) {
                    throw error;
                }
                setPosts(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching posts:', error.message);
            }
        };

        fetchPosts();
    }, [sortBy]);

    const handleUpvote = async (postId, post) => {
        try {
            const { data, error } = await supabase
                .from('Posts')
                .update({ upvotes: post.upvotes + 1 })
                .eq('id', postId);
            if (error) {
                throw error;
            }
            const updatedPosts = posts.map(p => {
                if (p.id === postId) {
                    return { ...p, upvotes: p.upvotes + 1 };
                }
                return p;
            });
            setPosts(updatedPosts);
        } catch (error) {
            console.error('Error adding upvote:', error.message);
        }
    };

    const handleSortChange = (criteria) => {
        setSortBy(criteria);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="feed-container">
            <h2>Home Feed</h2>
            <div className="search">
                <input
                    type="text"
                    placeholder="Search by title"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>
            <div className="sort-options">
                <label>Sort By:</label>
                <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                    <option value="created_at">Created Time</option>
                    <option value="upvotes">Upvotes Count</option>
                </select>
            </div>
            <ul>
                {filteredPosts.map((post) => (
                    <li key={post.id} className="post">
                        <p>Title: {post.title}</p>
                        <p>Content: {post.content}</p>
                        <p>Username: {post.username}</p>
                        <p>Upvotes: {post.upvotes}</p>
                        <p className="created-at">Created At: {formatDate(post.created_at)}</p>
                        <button onClick={() => handleUpvote(post.id, post)}>Upvote</button>
                        <button onClick={() => onPostSelected(post)}>View Details</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HomeFeed;
