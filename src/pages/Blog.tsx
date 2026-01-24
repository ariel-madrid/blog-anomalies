import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, IconButton, Skeleton, useMediaQuery, useTheme, Button, TextField, Divider, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, BlogPost, BlogComment } from '../lib/supabase';
import { Sparkles, Eye, Ghost, Hexagon, ScrollText, Calendar, Rocket, ArrowLeft, MessageSquare, Send, User } from 'lucide-react';
import { Globe } from 'lucide-react';

const Ufo = () => (
    <motion.div
        animate={{
            x: ['0vw', '40vw', '-40vw', '15vw', '-15vw', '0vw'], // desplazamiento relativo al centro
            y: [0, -20, 15, -30, 25, 0],
            rotate: [0, 5, -5, 10, -10, 0]
        }}
        transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        style={{
            position: 'absolute',
            top: '15%',
            left: '50%',          // origen horizontal centrado
            transform: 'translateX(-50%)', // centramos el div en su punto de origen
            zIndex: 0,
            opacity: 0.6,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 12px #00ffaa)'
        }}
    >
        {/* OVNI simple con SVG */}
        <svg
            width="50"
            height="25"
            viewBox="0 0 100 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
        >
            {/* Cuerpo del OVNI */}
            <ellipse cx="50" cy="25" rx="45" ry="15" fill="#00ffaa" opacity="0.8" />
            {/* Cúpula */}
            <ellipse cx="50" cy="15" rx="20" ry="10" fill="#00ffaa" opacity="0.6" />
            {/* Luces */}
            <circle cx="25" cy="25" r="3" fill="#fff" />
            <circle cx="50" cy="25" r="3" fill="#fff" />
            <circle cx="75" cy="25" r="3" fill="#fff" />
        </svg>
    </motion.div>
);

const Blog: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState<'ES' | 'EN'>(() => (localStorage.getItem('app_lang') as 'ES' | 'EN') || 'ES');
    const [showContentOnMobile, setShowContentOnMobile] = useState(false);

    // Comments State
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [newCommentUser, setNewCommentUser] = useState('');
    const [newCommentContent, setNewCommentContent] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchPosts();
        const handleLang = (e: any) => setLang(e.detail);
        window.addEventListener('langChange', handleLang);
        return () => window.removeEventListener('langChange', handleLang);
    }, []);

    useEffect(() => {
        if (selectedPost) {
            fetchComments(selectedPost.id);
        }
    }, [selectedPost]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching posts:', error);
            } else {
                setPosts(data || []);
                if (data && data.length > 0 && !isMobile && !selectedPost) {
                    setSelectedPost(data[0]);
                }
            }
        } catch (err) {
            console.error('Fatal connection error:', err);
        }
        setLoading(false);
    };

    const fetchComments = async (postId: string) => {
        const { data, error } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (!error) {
            setComments(data || []);
        }
    };

    const handlePostComment = async () => {
        if (!selectedPost || !newCommentUser || !newCommentContent) return;
        setSubmittingComment(true);

        const { error } = await supabase
            .from('blog_comments')
            .insert([{
                post_id: selectedPost.id,
                username: newCommentUser,
                content: newCommentContent
            }]);

        if (!error) {
            setNewCommentContent('');
            fetchComments(selectedPost.id);
        }
        setSubmittingComment(false);
    };

    const handlePostSelect = (post: BlogPost) => {
        setSelectedPost(post);

        const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]');
        if (!viewedPosts.includes(post.id)) {
            incrementViews(post.id);
            viewedPosts.push(post.id);
            localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
        }

        if (isMobile) {
            setShowContentOnMobile(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const incrementViews = async (postId: string) => {
        const { data: post, error } = await supabase
            .from('blogs')
            .select('views')
            .eq('id', postId)
            .single();

        if (!error && post) {
            await supabase
                .from('blogs')
                .update({ views: post.views + 1 })
                .eq('id', postId);
        }
    };

    const t = {
        ES: {
            title: 'The Anomaly Index',
            footer: 'STREAM DE DATOS TERMINADO | LA VERDAD ESTÁ AHÍ FUERA',
            select: 'SELECCIONA UNA FRECUENCIA',
            back: 'Volver a la lista',
            comments: 'SECCIÓN DE COMENTARIOS',
            commentLabel: 'Tu Identidad (Apodo)',
            contentLabel: 'Tu Comentario',
            submit: 'Enviar',
            noComments: 'No se han interceptado señales aún...',
            announcement: 'Blog nuevo todas las semanas — no olvides dejar tu comentario 🛸'
        },
        EN: {
            title: 'The Anomaly Index',
            footer: 'DATA STREAM TERMINATED | THE TRUTH IS OUT THERE',
            select: 'SELECT A FREQUENCY',
            back: 'Back to list',
            comments: 'COMMENT SECTION',
            commentLabel: 'Your Identity (Alias)',
            contentLabel: 'Your Comment',
            submit: 'Send',
            noComments: 'No signals intercepted yet...',
            announcement: 'Blog new every week — don\'t forget to leave your comment 🛸'
        }
    }[lang];

    return (
        <Box sx={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(26, 16, 37, 1) 0%, rgba(5, 5, 5, 1) 100%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
            `,
            backgroundRepeat: 'repeat',
            backgroundBlendMode: 'overlay',
            pt: { xs: '80px', md: '100px' },
            color: '#e0e0e0',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    py: 1,
                    px: 2,
                    zIndex: 1300,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // centra todo horizontalmente
                }}
            >
                {/* Texto centrado */}
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.7rem', sm: '0.85rem' },
                        letterSpacing: 1,
                        opacity: 0.9,
                        position: 'absolute', // lo sacamos del flujo para que quede centrado
                        left: '50%',
                        transform: 'translateX(-50%)', // centrado exacto
                        whiteSpace: 'nowrap',
                    }}
                >
                    {t.announcement}
                </Typography>

                {/* Botón a la derecha */}
                <Box sx={{ marginLeft: 'auto' }}>
                    <IconButton
                        onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
                        size="small"
                        sx={{
                            color: '#00ffaa',
                            border: '1px solid rgba(0,255,170,0.4)',
                            borderRadius: '4px',
                            fontFamily: "'Courier New', monospace",
                            fontSize: '0.65rem',
                            letterSpacing: 1.5,
                            px: 1,
                            '&:hover': {
                                bgcolor: 'rgba(0,255,170,0.1)',
                            },
                        }}
                    >
                        {lang === 'ES' ? 'ES-01' : 'EN-01'}
                    </IconButton>
                </Box>
            </Box>


            {/* Scanline / CRT Effect */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
                zIndex: 5,
                backgroundSize: '100% 2px, 1px 100%',
                pointerEvents: 'none',
                opacity: 0.6
            }} />

            <Ufo />
            <Ufo />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pb: 4 }}>
                {/* Centered Title */}

                <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <Typography variant="h1" sx={{
                            fontFamily: 'Cinzel, serif',
                            color: '#ffd700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            letterSpacing: { xs: 3, md: 6 },
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
                            fontSize: { xs: '2rem', md: '2.8rem' }
                        }}>
                            {t.title}
                        </Typography>
                    </motion.div>
                </Box>

                {/* Mobile Back Button */}
                {isMobile && showContentOnMobile && (
                    <Button
                        startIcon={<ArrowLeft size={18} />}
                        onClick={() => setShowContentOnMobile(false)}
                        sx={{ color: '#ffd700', mb: 2, fontWeight: 700 }}
                    >
                        {t.back}
                    </Button>
                )}

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                    height: { xs: 'auto', md: 'calc(100vh - 200px)' }
                }}>

                    {/* LEFT PANEL: Blog List */}
                    <Box sx={{
                        display: { xs: showContentOnMobile ? 'none' : 'block', md: 'block' },
                        flex: { xs: '1', md: '0 0 350px' },
                        overflowY: { xs: 'visible', md: 'auto' },
                        pr: { xs: 0, md: 2 },
                        '&::-webkit-scrollbar': { width: '2px' },
                        '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 215, 0, 0.2)', borderRadius: '10px' }
                    }}>
                        {loading ? (
                            Array.from(new Array(3)).map((_, i) => (
                                <Skeleton key={i} variant="rectangular" height={150} sx={{ mb: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />
                            ))
                        ) : (
                            posts.map((post) => (
                                <motion.div key={post.id} whileHover={{ x: 6 }} onClick={() => handlePostSelect(post)}>
                                    <Card
                                        sx={{
                                            mb: 2,
                                            cursor: 'pointer',
                                            background: selectedPost?.id === post.id ? 'rgba(255, 215, 0, 0.1)' : 'rgba(15, 15, 20, 0.6)',
                                            border: `1px solid ${selectedPost?.id === post.id ? '#ffd700' : 'rgba(255, 215, 0, 0.15)'}`,
                                            borderLeft: selectedPost?.id === post.id ? '4px solid #ffd700' : '1px solid rgba(255, 215, 0, 0.15)',
                                            backdropFilter: 'blur(12px)',
                                            transition: 'all 0.4s ease',
                                            overflow: 'hidden',
                                            boxShadow: selectedPost?.id === post.id
                                                ? '0 0 20px rgba(255, 215, 0, 0.4)'
                                                : '0 2px 10px rgba(0,0,0,0.3)',
                                            '&:hover': {
                                                boxShadow: '0 10px 20px rgba(0, 255, 170, 0.3)',
                                                borderLeft: '4px solid #00ffaa',
                                                background: 'rgba(15, 15, 20, 0.75)'
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={post.main_image}
                                            alt={lang === 'EN' ? post.title_en : post.title}
                                            sx={{
                                                opacity: selectedPost?.id === post.id ? 1 : 0.6,
                                                transition: 'opacity 0.3s ease, transform 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    opacity: 1
                                                }
                                            }}
                                        />
                                        <CardContent sx={{ p: 2 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: '#ffd700',
                                                    fontWeight: 700,
                                                    mb: 1,
                                                    fontFamily: 'Cinzel, serif',
                                                    fontSize: '1rem',
                                                    lineHeight: 1.2
                                                }}
                                            >
                                                {lang === 'EN' ? post.title_en : post.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'rgba(255,255,255,0.7)',
                                                    mb: 2,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    overflow: 'hidden',
                                                    WebkitBoxOrient: 'vertical',
                                                    fontFamily: 'Crimson Text, serif',
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {lang === 'EN' ? post.summary_en : post.summary}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {post.tags.slice(0, 3).map(tag => (
                                                    <Chip
                                                        key={tag}
                                                        label={tag}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'rgba(0, 255, 170, 0.08)',
                                                            color: '#00ffaa',
                                                            border: '1px solid rgba(0, 255, 170, 0.25)',
                                                            fontSize: '0.65rem',
                                                            height: '20px',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(0, 255, 170, 0.15)',
                                                                borderColor: '#00ffaa'
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1, gap: 0.5 }}>
                                                <Eye size={16} color="#00ffaa" />
                                                <Typography variant="caption" sx={{ color: 'rgba(0, 255, 170, 0.7)', fontSize: '0.7rem' }}>
                                                    {post.views || 0}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>

                                </motion.div>
                            ))
                        )}
                    </Box>

                    {/* RIGHT PANEL: Post Content + Comments */}
                    <Box sx={{
                        display: { xs: showContentOnMobile ? 'block' : 'none', md: 'block' },
                        flex: 1,
                        bgcolor: 'rgba(10, 10, 15, 0.7)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 215, 0, 0.1)',
                        p: { xs: 2.5, md: 6 },
                        overflowY: { xs: 'visible', md: 'auto' },
                        position: 'relative',
                        backdropFilter: 'blur(20px)',
                        '&::-webkit-scrollbar': { width: '2px' },
                        '&::-webkit-scrollbar-thumb': { background: 'rgba(0, 255, 170, 0.2)', borderRadius: '10px' }
                    }}>
                        <AnimatePresence mode="wait">
                            {selectedPost ? (
                                <motion.div
                                    key={selectedPost.id + lang}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Post Header */}
                                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="h4" sx={{
                                                fontFamily: 'Cinzel, serif',
                                                color: '#ffd700',
                                                mb: 1,
                                                textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                                                fontSize: { xs: '1.5rem', md: '2.2rem' }
                                            }}>
                                                {lang === 'EN' ? selectedPost.title_en : selectedPost.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'rgba(255,255,255,0.4)' }}>
                                                <Typography variant="body2" sx={{ fontFamily: 'Crimson Text', fontSize: '0.9rem' }}>
                                                    {new Date(selectedPost.created_at).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#00ffaa', fontWeight: 600, fontFamily: 'Cinzel', fontSize: '0.8rem', letterSpacing: 1 }}>
                                                    • {selectedPost.author.toUpperCase()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton size="small" sx={{ color: '#ffd700', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                                            <Sparkles size={18} />
                                        </IconButton>
                                    </Box>

                                    {/* Image */}
                                    <Box sx={{
                                        width: '100%',
                                        height: { xs: '200px', md: '350px' },
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        mb: 4,
                                        border: '1px solid rgba(255, 215, 0, 0.2)',
                                        boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                                        backgroundColor: '#000'
                                    }}>
                                        <img src={selectedPost.main_image} alt={selectedPost.title} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9, transform: 'scale(0.9)' }} />
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{
                                        fontFamily: 'Crimson Text, serif',
                                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                                        lineHeight: 1.7,
                                        color: 'rgba(255,255,255,0.85)',
                                        textAlign: 'justify',
                                        mb: 6
                                    }}>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}>
                                            {lang === 'EN' ? selectedPost.content_en : selectedPost.content}
                                        </Typography>
                                    </Box>

                                    {/* True Crime Style Gallery */}
                                    {selectedPost.gallery_images && selectedPost.gallery_images.length > 0 && (
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                minHeight: { xs: '400px', md: '500px' },
                                                mb: 10,
                                                mt: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                background:
                                                    'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)',
                                                borderRadius: 4,
                                            }}
                                        >
                                            {/* Background dashed frame */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '80%',
                                                    height: '70%',
                                                    border: '1px dashed rgba(255, 215, 0, 0.2)',
                                                    borderRadius: 2,
                                                    pointerEvents: 'none',
                                                }}
                                            />

                                            {selectedPost.gallery_images.slice(0, 5).map((imageUrl, index) => {
                                                /** POSICIONES FIJAS Y ORDENADAS */
                                                const POSITIONS = [
                                                    { x: '-70%', rotate: -12 },
                                                    { x: '-40%', rotate: -6 },
                                                    { x: '0%', rotate: 0 },
                                                    { x: '40%', rotate: 6 },
                                                    { x: '70%', rotate: 12 },
                                                ];



                                                const { x, rotate } = POSITIONS[index];

                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.9, x: 0, rotate: 0 }}
                                                        animate={{ opacity: 1, scale: 1, x, rotate }}
                                                        transition={{
                                                            delay: index * 0.12,
                                                            duration: 0.45,
                                                            ease: 'easeOut',
                                                        }}
                                                        whileHover={{
                                                            scale: 1.12,
                                                            rotate: 0,
                                                            zIndex: 100,
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            translateX: '-50%',
                                                            translateY: '-50%',
                                                            zIndex: 10 + index,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: { xs: '150px', md: '220px' },
                                                                height: { xs: '210px', md: '280px' },
                                                                bgcolor: '#fff',
                                                                padding: '10px 10px 30px 10px',
                                                                boxShadow:
                                                                    '0 10px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)',
                                                                position: 'relative',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: '-10px',
                                                                    left: '50%',
                                                                    transform: 'translateX(-50%) rotate(-2deg)',
                                                                    width: '50px',
                                                                    height: '18px',
                                                                    bgcolor: 'rgba(255, 215, 0, 0.25)',
                                                                    backdropFilter: 'blur(2px)',
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                    opacity: 0.8,
                                                                },
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    backgroundImage: `url(${imageUrl})`,
                                                                    backgroundSize: 'cover',
                                                                    backgroundPosition: 'center',
                                                                    filter: 'sepia(0.2) contrast(1.1) brightness(0.9)',
                                                                    border: '1px solid rgba(0,0,0,0.1)',
                                                                }}
                                                            />

                                                            <Typography
                                                                sx={{
                                                                    position: 'absolute',
                                                                    bottom: '8px',
                                                                    left: 0,
                                                                    width: '100%',
                                                                    textAlign: 'center',
                                                                    fontFamily: "'Courier New', monospace",
                                                                    fontSize: '0.65rem',
                                                                    color: '#222',
                                                                    fontWeight: 700,
                                                                    letterSpacing: '1px',
                                                                    opacity: 0.8,
                                                                }}
                                                            >
                                                                FIG. {index + 1}
                                                            </Typography>
                                                        </Box>
                                                    </motion.div>
                                                );
                                            })}
                                        </Box>
                                    )}



                                    {/* Comments Section */}
                                    <Box sx={{ mt: 10, mb: 4 }}>
                                        <Typography variant="h5" sx={{
                                            fontFamily: 'Cinzel, serif',
                                            color: '#ffd700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <MessageSquare size={24} /> {t.comments}
                                        </Typography>

                                        {/* Comment Form */}
                                        <Box sx={{
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            p: 3,
                                            borderRadius: 2,
                                            mt: 3,
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        placeholder={t.commentLabel}
                                                        value={newCommentUser}
                                                        onChange={(e) => setNewCommentUser(e.target.value)}
                                                        variant="standard"
                                                        InputProps={{
                                                            startAdornment: <User size={18} style={{ marginRight: 8, opacity: 0.5 }} />,
                                                            disableUnderline: true,
                                                            style: { color: 'white', fontFamily: 'Crimson Text', fontSize: '1.1rem' }
                                                        }}
                                                        sx={{ borderBottom: '1px solid rgba(0, 255, 170, 0.3)', pb: 1 }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        placeholder={t.contentLabel}
                                                        value={newCommentContent}
                                                        onChange={(e) => setNewCommentContent(e.target.value)}
                                                        variant="standard"
                                                        InputProps={{
                                                            disableUnderline: true,
                                                            style: { color: 'white', fontFamily: 'Crimson Text', fontSize: '1.1rem' }
                                                        }}
                                                        sx={{ borderBottom: '1px solid rgba(0, 255, 170, 0.3)', pb: 1, mt: 2 }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sx={{ textAlign: 'right', mt: 2 }}>
                                                    <Button
                                                        variant="text"
                                                        endIcon={<Send size={18} />}
                                                        disabled={submittingComment || !newCommentUser || !newCommentContent}
                                                        onClick={handlePostComment}
                                                        sx={{
                                                            color: '#00ffaa',
                                                            fontWeight: 700,
                                                            '&:hover': { bgcolor: 'rgba(0, 255, 170, 0.1)' }
                                                        }}
                                                    >
                                                        {t.submit}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Comments List */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                                            {comments.length === 0 ? (
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center' }}>
                                                    {t.noComments}
                                                </Typography>
                                            ) : (
                                                comments.map((comment, index) => (
                                                    <motion.div
                                                        key={comment.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                                            <Box sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: '50%',
                                                                bgcolor: 'rgba(255,215,0,0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px solid rgba(255,215,0,0.3)',
                                                                flexShrink: 0
                                                            }}>
                                                                <User size={20} color="#ffd700" />
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                                                    <Typography variant="subtitle2" sx={{ color: '#ffd700', fontWeight: 700, fontFamily: 'Cinzel' }}>
                                                                        {comment.username}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Crimson Text', fontSize: '1.1rem', lineHeight: 1.4 }}>
                                                                    {comment.content}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        {index < comments.length - 1 && <Divider sx={{ mt: 3, borderColor: 'rgba(255,255,255,0.05)' }} />}
                                                    </motion.div>
                                                ))
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Footer */}
                                    <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255, 215, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                        <ScrollText size={18} color="#ffd700" opacity={0.5} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', letterSpacing: 2, fontFamily: 'Cinzel', fontSize: '0.7rem', textAlign: 'center' }}>
                                            {t.footer}
                                        </Typography>
                                        <ScrollText size={18} color="#ffd700" opacity={0.5} />
                                    </Box>
                                </motion.div>
                            ) : (
                                // Estado cuando NO hay post seleccionado (pantalla derecha vacía)
                                <Box sx={{ height: '100%', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                    <Hexagon size={80} color="#ffd700" />
                                    <Typography variant="body2" sx={{ mt: 2, fontFamily: 'Cinzel', letterSpacing: 3 }}>
                                        {t.select}
                                    </Typography>
                                </Box>
                            )}
                        </AnimatePresence>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Blog;