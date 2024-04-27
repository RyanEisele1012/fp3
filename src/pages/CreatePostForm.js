import React, { useState } from 'react';
import './CreatePostForm.css';  // Ensure this CSS import is correct

import supabase from '../client';  // Ensure this is the correct path to your Supabase client
import bcrypt from 'bcryptjs';  // Correct import of bcryptjs

const CreatePostForm = ({ userId, username }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !password) {
            setMessage('Please fill in all required fields.');
            return;
        }

        setIsLoading(true);

        // Hash the password before sending it to the database
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        try {
            const newPost = {
                title,
                content,
                imageUrl,
                username,  // Use the passed username
                userId,    // Use the passed userId
                created_at: new Date().toISOString(),
                upvotes: 0,
                password_hash: hashedPassword,
            };

            const { error } = await supabase.from('Posts').insert([newPost]);
            if (error) {
                throw error;
            }

            setMessage('Post created successfully!');
            setTitle('');
            setContent('');
            setImageUrl('');
            setPassword('');
        } catch (error) {
            console.error('Error inserting new post:', error.message);
            setMessage('Failed to create post.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">  // Assigning the form-container class here
            <h2>Create New Post</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Title:
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label>
                    Content:
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
                </label>
                <label>
                    Image URL:
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </label>
                <label>
                    Username:
                    <input type="text" value={username} readOnly />
                </label>
                <label>
                    Password (for editing this post):
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit'}</button>
            </form>
        </div>
    );
};

export default CreatePostForm;
