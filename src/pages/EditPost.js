import React, { useState, useEffect } from 'react';
import supabase from '../client';
import bcrypt from 'bcryptjs'; // Ensure bcryptjs is imported to use for password verification

const EditPost = ({ postId }) => {
    const [post, setPost] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [password, setPassword] = useState(''); // State to handle the password input
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!postId) {
            setError('No post ID provided');
            setLoading(false);
            return;
        }

        const fetchPostDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('Posts')
                    .select('*')
                    .eq('id', postId)
                    .single();
                if (error) throw error;
                setPost(data);
                setTitle(data.title);
                setContent(data.content);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching post details:', error.message);
                setError('Error fetching post details. Please try again later.');
                setLoading(false);
            }
        };

        fetchPostDetails();
    }, [postId]);

    const handleEditPost = async () => {
        // First, verify the password
        if (!post || !bcrypt.compareSync(password, post.password_hash)) {
            setError("Incorrect password");
            return;
        }

        try {
            const { data, error } = await supabase
                .from('Posts')
                .update({ title, content })
                .eq('id', postId);
            if (error) throw error;
            console.log('Post updated successfully:', data);
            // Optionally, you can navigate to another page or show a success message here
        } catch (error) {
            console.error('Error editing post:', error.message);
            setError('Failed to update post');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Edit Post</h2>
            <label>
                Title:
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
                Content:
                <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            </label>
            <label>
                Password (required to edit):
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button onClick={handleEditPost}>Save Changes</button>
        </div>
    );
};

export default EditPost;
