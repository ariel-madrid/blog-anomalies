// BlogPostPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, BlogPost, BlogComment } from '../lib/supabase';
import Blog from '../pages/Blog';

const BlogPostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error(error);
            navigate('/'); // si no existe, volver al listado
        } else {
            setPost(data);
        }
        setLoading(false);
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <Blog selectedPost={post} showAllPosts={false} />
    );
};

export default BlogPostPage;
