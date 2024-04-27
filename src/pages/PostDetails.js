import React, { useState, useEffect } from 'react';
import './PostDetails.css';
import supabase from '../client';
import bcrypt from 'bcryptjs'; // Make sure bcryptjs is installed

const PostDetails = ({ post, onEdit, username }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [upvotes, setUpvotes] = useState(post.upvotes || 0);
    const [repostedPost, setRepostedPost] = useState(null);
    const [currentUserID, setCurrentUserID] = useState(null);

    useEffect(() => {
        if (!post || !post.id) {
            setError('Post ID is undefined');
            setLoading(false);
            return;
        }

        const fetchPostDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('Posts')
                    .select('*')
                    .eq('id', post.id)
                    .single();
        
                if (error) throw error;
        
                setComments(data.comments ? JSON.parse(data.comments) || [] : []);
                setUpvotes(data.upvotes);
        
                setLoading(false);
            } catch (error) {
                console.error('Error fetching post details:', error.message);
                setError('Error fetching post details. Please try again later.');
                setLoading(false);
            }
        };
        
        fetchPostDetails();

        if (post.repost_of) {
            fetchRepostedPost(post.repost_of);
        }
    }, [post]);

    const fetchRepostedPost = async (postId) => {
        try {
            const { data, error } = await supabase.from('Posts').select('*').eq('id', postId);
            if (error) {
                throw error;
            }
            setRepostedPost(data[0]);
        } catch (error) {
            console.error('Error fetching reposted post:', error.message);
        }
    };

    const handleEditPost = () => {
        onEdit(post);
    };

    const handleUpvote = async () => {
        const newUpvoteCount = upvotes + 1;
        try {
            const { error } = await supabase
                .from('Posts')
                .update({ upvotes: newUpvoteCount })
                .eq('id', post.id);
            if (error) throw error;
            setUpvotes(newUpvoteCount);
        } catch (error) {
            console.error('Error updating upvotes:', error.message);
        }
    };

    const handleDeletePost = async () => {
        if (!bcrypt.compareSync(password, post.password_hash)) {
            alert("Incorrect password");
            return;
        }

        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                const { error } = await supabase
                    .from('Posts')
                    .delete()
                    .eq('id', post.id);
                if (error) throw error;
                alert("Post deleted successfully.");
            } catch (error) {
                console.error('Error deleting post:', error.message);
                alert('Failed to delete post.');
            }
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);

        try {
            const updatedComments = [...comments, { content: newComment, username: username }];
            const { data, error } = await supabase
                .from('Posts')
                .update({ comments: JSON.stringify(updatedComments) })
                .eq('id', post.id);
            if (error) throw error;

            setComments(updatedComments);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRepost = async () => {
        const currentUserUsername = username; // This should be the username of the user executing the repost
    
        try {
            const { data: repostsData, error: repostsError } = await supabase
                .from('Posts')
                .select('id')
                .eq('repost_of', post.id)
                .eq('username', currentUserUsername);
    
            if (repostsError) throw repostsError;
    
            if (repostsData.length > 0) {
                alert("You have already reposted this post.");
                return;
            }
    
            const repostData = {
                title: post.title,
                content: post.content,
                imageUrl: post.imageUrl,
                username: currentUserUsername,
                created_at: new Date().toISOString(),
                repost_of: post.id,
            };
    
            const { data, error } = await supabase.from('Posts').insert([repostData]);
            if (error) throw error;
            alert("Post reposted successfully.");
        } catch ( error) {
            console.error('Error reposting post:', error.message);
            alert('Failed to repost post.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="post-details">
            <h2>Post Details</h2>
            <p>Title: {post.title}</p>
            <p>Content: {post.content}</p>
            <p>User Name: {post.username}</p>
            <p>Upvotes: {upvotes} <button onClick={handleUpvote}>Upvote</button></p>
            {post.imageUrl && <img src={post.imageUrl} alt="Post Image" className="post-image" />}
            <p>Created At: {post.created_at}</p>
            {repostedPost && (
                <div>
                    <h3>Reposted From</h3>
                    <p>Title: {repostedPost.title}</p>
                    <p>Content: {repostedPost.content}</p>
                    <p>User Name: {repostedPost.username}</p>
                    <p>Upvotes: {repostedPost.upvotes}</p>
                    {repostedPost.imageUrl && <img src={repostedPost.imageUrl} alt="Reposted Post Image" className="post-image" />}
                    <p>Created At: {repostedPost.created_at}</p>
                </div>
            )}
            <button onClick={handleRepost}>Repost</button>

            <h3>Comments</h3>
            {comments.length > 0 ? (
                <ul>
                    {comments.map((comment, index) => (
                        <li key={index}>
                            <p>User: {comment.username}</p>
                            <p>Content: {comment.content}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No comments available.</p>
            )}
            <form onSubmit={handleSubmitComment}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment here..."
                    disabled={submitting}
                />
                <button type="submit" disabled={!newComment.trim() || submitting}>
                    {submitting ? 'Submitting...' : 'Submit Comment'}
                </button>
            </form>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password for edit/delete"
            />
            <button onClick={handleEditPost}>Edit Post</button>
            <button onClick={handleDeletePost}>Delete Post</button>
        </div>
    );
};

export default PostDetails;
