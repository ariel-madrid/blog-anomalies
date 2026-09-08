import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, IconButton, Skeleton, useMediaQuery, useTheme, Button, TextField, Divider, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, BlogPost, BlogComment } from '../lib/supabase';
import { Radio, Eye, Satellite, ArrowLeft, MessageSquare, Send, User, Share2, Radar } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ufo } from '../theme';

interface BlogProps {
    selectedPost?: BlogPost | null;
    showAllPosts?: boolean;
}

// Retro flying saucer that drifts across the sky
const Saucer = ({ delay = 0, top = '12%' }: { delay?: number; top?: string }) => (
    <motion.div
        animate={{ x: ['-10vw', '30vw', '-25vw', '10vw', '-10vw'], y: [0, -18, 8, -12, 0], rotate: [-4, 4, -6, 5, -4] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay }}
        style={{ position: 'absolute', top, left: '50%', zIndex: 0, opacity: 0.55, pointerEvents: 'none', filter: 'drop-shadow(0 0 14px rgba(53,224,208,0.7))' }}
    >
        <svg width="90" height="46" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="34" rx="54" ry="15" fill={ufo.teal} opacity="0.85" />
            <ellipse cx="60" cy="30" rx="52" ry="12" fill="#0A0C13" opacity="0.35" />
            <path d="M38 26 Q60 6 82 26 Z" fill={ufo.amber} opacity="0.9" />
            <ellipse cx="60" cy="26" rx="22" ry="8" fill={ufo.amber} opacity="0.55" />
            <circle cx="30" cy="36" r="3" fill="#fff" />
            <circle cx="46" cy="40" r="3" fill={ufo.amber} />
            <circle cx="60" cy="41" r="3" fill="#fff" />
            <circle cx="74" cy="40" r="3" fill={ufo.amber} />
            <circle cx="90" cy="36" r="3" fill="#fff" />
            {/* tractor beam */}
            <path d="M48 44 L36 60 L84 60 L72 44 Z" fill={ufo.teal} opacity="0.12" />
        </svg>
    </motion.div>
);

const Blog: React.FC<BlogProps> = ({ selectedPost: externalPost }) => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(externalPost || null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState<'ES' | 'EN'>(() => (localStorage.getItem('app_lang') as 'ES' | 'EN') || 'ES');
    const [showContentOnMobile, setShowContentOnMobile] = useState(false);

    // Comments State
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [newCommentUser, setNewCommentUser] = useState('');
    const [newCommentContent, setNewCommentContent] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
        const handleLang = (e: any) => setLang(e.detail);
        window.addEventListener('langChange', handleLang);
        return () => window.removeEventListener('langChange', handleLang);
    }, []);

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    useEffect(() => {
        if (selectedPost) fetchComments(selectedPost.id);
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
                if (data && data.length > 0) {
                    if (id) {
                        const postById = data.find(p => p.id === id);
                        if (postById) setSelectedPost(postById);
                        else navigate('/');
                    } else if (!selectedPost) {
                        setSelectedPost(data[0]);
                    }
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
        if (!error) setComments(data || []);
    };

    const handlePostComment = async () => {
        if (!selectedPost || !newCommentUser || !newCommentContent) return;
        setSubmittingComment(true);
        const { error } = await supabase
            .from('blog_comments')
            .insert([{ post_id: selectedPost.id, username: newCommentUser, content: newCommentContent }]);
        if (!error) {
            setNewCommentContent('');
            fetchComments(selectedPost.id);
        }
        setSubmittingComment(false);
    };

    const handlePostSelect = (post: BlogPost) => {
        setSelectedPost(post);
        if (typeof window !== 'undefined') window.history.pushState({}, '', `/${post.id}`);
        if (isMobile) setShowContentOnMobile(true);
        incrementViews(post.id);
    };

    const incrementViews = async (postId: string) => {
        const { data: post, error } = await supabase.from('blogs').select('views').eq('id', postId).single();
        if (!error && post) {
            await supabase.from('blogs').update({ views: (post.views || 0) + 1 }).eq('id', postId);
        }
    };

    const t = {
        ES: {
            footer: 'FIN DE TRANSMISIÓN · LA VERDAD ESTÁ AHÍ FUERA',
            select: 'SINTONIZA UNA FRECUENCIA',
            back: 'Volver al registro',
            comments: 'REGISTRO DE TRANSMISIONES',
            commentLabel: 'Tu identidad (alias)',
            contentLabel: 'Tu mensaje',
            submit: 'Transmitir',
            noComments: 'Aún no se interceptan señales...',
            announcement: 'Nuevo avistamiento cada semana — no olvides dejar tu señal',
            channel: 'CANAL',
            evidence: 'EVIDENCIA',
        },
        EN: {
            footer: 'END OF TRANSMISSION · THE TRUTH IS OUT THERE',
            select: 'TUNE INTO A FREQUENCY',
            back: 'Back to log',
            comments: 'TRANSMISSION LOG',
            commentLabel: 'Your identity (alias)',
            contentLabel: 'Your message',
            submit: 'Transmit',
            noComments: 'No signals intercepted yet...',
            announcement: 'New sighting every week — don\'t forget to leave your signal',
            channel: 'CHANNEL',
            evidence: 'EVIDENCE',
        }
    }[lang];

    const handleShare = () => {
        if (!selectedPost) return;
        const postUrl = window.location.href;
        const postTitle = lang === 'EN' ? selectedPost.title_en || '' : selectedPost.title || '';
        if (navigator.share) {
            navigator.share({ title: postTitle, url: postUrl }).catch(() => { });
        } else {
            const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
            window.open(facebook, '_blank');
        }
    };

    const monoLabel = { fontFamily: '"Space Mono", monospace', letterSpacing: '0.12em' };

    return (
        <Box sx={{
            minHeight: '100vh',
            pt: { xs: '84px', md: '96px' },
            color: ufo.cream,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Top announcement / control bar */}
            <Box sx={{
                position: 'fixed', top: 0, left: 0, width: '100%', py: 1, px: 2, zIndex: 1300,
                borderBottom: `1px solid ${ufo.line}`,
                background: 'rgba(10,12,19,0.82)', backdropFilter: 'blur(8px)',
                display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 1,
            }}>
                <Radio size={16} color={ufo.teal} />
                <Typography variant="body2" sx={{ ...monoLabel, fontWeight: 700, fontSize: { xs: '0.65rem', sm: '0.78rem' }, opacity: 0.9, textAlign: 'center' }}>
                    {t.announcement} <span style={{ color: ufo.amber }}>🛸</span>
                </Typography>
                <IconButton
                    onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
                    size="small"
                    sx={{
                        color: ufo.teal, border: `1px solid ${ufo.lineTeal}`, borderRadius: '3px',
                        ...monoLabel, fontSize: '0.62rem', px: 1, ml: { xs: 0, sm: 1 },
                        '&:hover': { bgcolor: 'rgba(53,224,208,0.1)' },
                    }}
                >
                    {lang === 'ES' ? 'ES-01' : 'EN-01'}
                </IconButton>
            </Box>

            {/* CRT scanlines */}
            <div className="crt-scanlines" />
            <Saucer top="10%" />
            <Saucer delay={9} top="18%" />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pb: 12 }}>
                {/* HERO / COVER */}
                <Box className="halftone" sx={{
                    position: 'relative', width: '100%', height: { xs: '240px', md: '380px' },
                    mb: { xs: 4, md: 6 }, borderRadius: 2, overflow: 'hidden',
                    border: `1px solid ${ufo.line}`, boxShadow: '0 0 50px rgba(0,0,0,0.7)',
                    background: `
                        radial-gradient(ellipse at 50% 120%, rgba(53,224,208,0.18) 0%, transparent 55%),
                        radial-gradient(ellipse at 50% 30%, rgba(255,182,39,0.12) 0%, transparent 60%),
                        linear-gradient(180deg, #0d1120 0%, #0A0C13 100%)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    {/* horizon grid */}
                    <Box sx={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
                        background: `repeating-linear-gradient(90deg, transparent 0 38px, rgba(53,224,208,0.10) 38px 39px),
                                     repeating-linear-gradient(0deg, transparent 0 38px, rgba(53,224,208,0.10) 38px 39px)`,
                        transform: 'perspective(300px) rotateX(60deg)', transformOrigin: 'bottom', opacity: 0.6, pointerEvents: 'none',
                    }} />
                    <motion.div
                        animate={{ opacity: [0.35, 0.6, 0.35] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 35%, rgba(53,224,208,0.16), transparent 70%)', pointerEvents: 'none' }}
                    />
                    <Typography sx={{ ...monoLabel, color: ufo.teal, fontSize: { xs: '0.6rem', md: '0.75rem' }, mb: 1, zIndex: 1 }}>
                        {t.channel} 01 · {lang === 'ES' ? 'ARCHIVO DE ANOMALÍAS' : 'ANOMALY ARCHIVE'}
                    </Typography>
                    <Typography component="h1" className="neon-sign" sx={{
                        fontSize: { xs: '2rem', sm: '3.2rem', md: '4.4rem' }, lineHeight: 1, textAlign: 'center', px: 2, zIndex: 1,
                    }}>
                        The Anomaly Index
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, zIndex: 1 }}>
                        <Box sx={{ width: 40, height: 1, background: ufo.amber, opacity: 0.5 }} />
                        <Radar size={16} color={ufo.amber} />
                        <Box sx={{ width: 40, height: 1, background: ufo.amber, opacity: 0.5 }} />
                    </Box>
                </Box>

                {/* Mobile back button */}
                {isMobile && showContentOnMobile && (
                    <Button startIcon={<ArrowLeft size={18} />} onClick={() => setShowContentOnMobile(false)} sx={{ color: ufo.amber, mb: 2 }}>
                        {t.back}
                    </Button>
                )}

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, height: { xs: 'auto', md: 'calc(100vh - 220px)' } }}>
                    {/* LEFT: post list */}
                    <Box sx={{
                        display: { xs: showContentOnMobile ? 'none' : 'block', md: 'block' },
                        flex: { xs: '1', md: '0 0 340px' }, overflowY: { xs: 'visible', md: 'auto' }, pr: { xs: 0, md: 1.5 },
                    }}>
                        <Typography sx={{ ...monoLabel, color: ufo.amber, fontSize: '0.7rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Satellite size={14} /> {lang === 'ES' ? 'FRECUENCIAS DETECTADAS' : 'DETECTED FREQUENCIES'} [{posts.length}]
                        </Typography>

                        {loading ? (
                            Array.from(new Array(3)).map((_, i) => (
                                <Skeleton key={i} variant="rectangular" height={150} sx={{ mb: 2, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.04)' }} />
                            ))
                        ) : posts.length === 0 ? (
                            <Typography sx={{ color: ufo.muted, fontStyle: 'italic', mt: 4 }}>
                                {lang === 'ES' ? 'Sin transmisiones aún. Vuelve pronto.' : 'No transmissions yet. Check back soon.'}
                            </Typography>
                        ) : (
                            posts.map((post) => {
                                const active = selectedPost?.id === post.id;
                                return (
                                    <motion.div key={post.id} whileHover={{ x: 5 }} onClick={() => handlePostSelect(post)}>
                                        <Card sx={{
                                            mb: 2, cursor: 'pointer', borderRadius: 1, overflow: 'hidden',
                                            background: active ? 'rgba(255,182,39,0.08)' : 'rgba(16,20,31,0.7)',
                                            border: `1px solid ${active ? ufo.amber : ufo.line}`,
                                            borderLeft: `4px solid ${active ? ufo.amber : 'transparent'}`,
                                            backdropFilter: 'blur(12px)', transition: 'all 0.3s ease',
                                            boxShadow: active ? '0 0 22px rgba(255,182,39,0.35)' : '0 2px 10px rgba(0,0,0,0.3)',
                                            '&:hover': { borderLeftColor: ufo.teal, boxShadow: '0 8px 22px rgba(53,224,208,0.22)' },
                                        }}>
                                            {post.main_image && (
                                                <CardMedia component="img" height="110" image={post.main_image}
                                                    alt={lang === 'EN' ? post.title_en : post.title}
                                                    sx={{ opacity: active ? 1 : 0.6, transition: 'opacity 0.3s', filter: 'saturate(1.1) contrast(1.05)' }} />
                                            )}
                                            <CardContent sx={{ p: 2 }}>
                                                <Typography sx={{ color: ufo.amber, fontFamily: '"Audiowide", sans-serif', fontSize: '0.95rem', lineHeight: 1.25, mb: 1 }}>
                                                    {lang === 'EN' ? post.title_en || post.title : post.title}
                                                </Typography>
                                                <Typography sx={{
                                                    color: ufo.muted, mb: 1.5, fontSize: '0.95rem',
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                }}>
                                                    {lang === 'EN' ? post.summary_en || post.summary : post.summary}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {(post.tags || []).slice(0, 3).map(tag => (
                                                        <Chip key={tag} label={tag} size="small" sx={{
                                                            bgcolor: 'rgba(53,224,208,0.08)', color: ufo.teal,
                                                            border: `1px solid ${ufo.lineTeal}`, fontSize: '0.62rem', height: 20,
                                                        }} />
                                                    ))}
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1, gap: 0.5 }}>
                                                    <Eye size={15} color={ufo.teal} />
                                                    <Typography variant="caption" sx={{ ...monoLabel, color: ufo.teal, fontSize: '0.7rem' }}>{post.views || 0}</Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </Box>

                    {/* RIGHT: reader */}
                    <Box sx={{
                        display: { xs: showContentOnMobile ? 'block' : 'none', md: 'block' }, flex: 1,
                        bgcolor: 'rgba(12,15,24,0.72)', borderRadius: 2, border: `1px solid ${ufo.line}`,
                        p: { xs: 2.5, md: 6 }, overflowY: { xs: 'visible', md: 'auto' }, position: 'relative', backdropFilter: 'blur(20px)',
                    }}>
                        <AnimatePresence mode="wait">
                            {selectedPost ? (
                                <motion.div key={selectedPost.id + lang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                                    {/* Header */}
                                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                        <Box>
                                            <Typography sx={{ ...monoLabel, color: ufo.teal, fontSize: '0.65rem', mb: 1 }}>
                                                {t.channel} · {new Date(selectedPost.created_at).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="h4" sx={{
                                                fontFamily: '"Audiowide", sans-serif', color: ufo.amber, mb: 1,
                                                textShadow: '0 0 22px rgba(255,182,39,0.3)', fontSize: { xs: '1.5rem', md: '2.2rem' }, lineHeight: 1.15,
                                            }}>
                                                {lang === 'EN' ? selectedPost.title_en || selectedPost.title : selectedPost.title}
                                            </Typography>
                                            <Typography sx={{ ...monoLabel, color: ufo.teal, fontWeight: 700, fontSize: '0.72rem' }}>
                                                ▸ {(selectedPost.author || 'ANÓNIMO').toUpperCase()}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" sx={{ color: ufo.teal, border: `1px solid ${ufo.lineTeal}`, borderRadius: 1 }} onClick={handleShare} title="Compartir">
                                            <Share2 size={18} />
                                        </IconButton>
                                    </Box>

                                    {/* Main image */}
                                    {selectedPost.main_image && (
                                        <Box sx={{
                                            width: '100%', height: { xs: '200px', md: '360px' }, borderRadius: 2, overflow: 'hidden', mb: 4,
                                            border: `1px solid ${ufo.line}`, boxShadow: '0 0 34px rgba(0,0,0,0.55)', backgroundColor: '#000',
                                        }}>
                                            <img src={selectedPost.main_image} alt={selectedPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }} />
                                        </Box>
                                    )}

                                    {/* Content */}
                                    <Box sx={{ fontSize: { xs: '1.08rem', md: '1.2rem' }, lineHeight: 1.8, color: 'rgba(237,228,207,0.9)', mb: 6 }}>
                                        <Typography sx={{ whiteSpace: 'pre-line', fontFamily: '"Rajdhani", sans-serif', fontSize: 'inherit', lineHeight: 'inherit', fontWeight: 400 }}>
                                            {lang === 'EN' ? selectedPost.content_en || selectedPost.content : selectedPost.content}
                                        </Typography>
                                    </Box>

                                    {/* Evidence gallery (retro polaroid) */}
                                    {selectedPost.gallery_images && selectedPost.gallery_images.length > 0 && (
                                        <Box sx={{ position: 'relative', minHeight: { xs: '380px', md: '480px' }, mb: 10, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '82%', height: '72%', border: `1px dashed ${ufo.line}`, borderRadius: 1, pointerEvents: 'none' }} />
                                            {selectedPost.gallery_images.slice(0, 5).map((imageUrl, index) => {
                                                const POSITIONS = [
                                                    { x: '-90%', rotate: -16 }, { x: '-55%', rotate: -9 }, { x: '0%', rotate: 0 }, { x: '55%', rotate: 9 }, { x: '90%', rotate: 16 },
                                                ];
                                                const { x, rotate } = POSITIONS[index];
                                                return (
                                                    <motion.div key={index}
                                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, x, rotate }}
                                                        transition={{ delay: index * 0.1, duration: 0.45, ease: 'easeOut' }}
                                                        whileHover={{ scale: 1.12, rotate: 0, zIndex: 100 }}
                                                        style={{ position: 'absolute', top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', zIndex: 10 + index, cursor: 'pointer' }}>
                                                        <Box sx={{
                                                            width: { xs: '150px', md: '215px' }, height: { xs: '200px', md: '270px' }, bgcolor: '#f3ecda',
                                                            p: '10px 10px 30px 10px', boxShadow: '0 12px 34px rgba(0,0,0,0.85)', position: 'relative',
                                                            '&::before': { content: '""', position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: 54, height: 18, bgcolor: 'rgba(255,182,39,0.4)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
                                                        }}>
                                                            <Box sx={{ width: '100%', height: '100%', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'sepia(0.25) contrast(1.1) brightness(0.92)' }} />
                                                            <Typography sx={{ position: 'absolute', bottom: 8, left: 0, width: '100%', textAlign: 'center', fontFamily: '"Space Mono", monospace', fontSize: '0.62rem', color: '#222', fontWeight: 700, letterSpacing: '1px' }}>
                                                                {t.evidence} #{index + 1}
                                                            </Typography>
                                                        </Box>
                                                    </motion.div>
                                                );
                                            })}
                                        </Box>
                                    )}

                                    {/* Comments */}
                                    <Box sx={{ mt: 10, mb: 4 }}>
                                        <Typography variant="h5" sx={{ fontFamily: '"Audiowide", sans-serif', color: ufo.amber, display: 'flex', alignItems: 'center', gap: 2, fontSize: { xs: '1.1rem', md: '1.4rem' } }}>
                                            <MessageSquare size={22} /> {t.comments}
                                        </Typography>

                                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 1, mt: 3, border: `1px solid ${ufo.line}` }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField fullWidth placeholder={t.commentLabel} value={newCommentUser} onChange={(e) => setNewCommentUser(e.target.value)} variant="standard"
                                                        InputProps={{ startAdornment: <User size={18} style={{ marginRight: 8, opacity: 0.5 }} />, disableUnderline: true, style: { color: ufo.cream, fontFamily: 'Rajdhani', fontSize: '1.1rem' } }}
                                                        sx={{ borderBottom: `1px solid ${ufo.lineTeal}`, pb: 1 }} />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField fullWidth multiline placeholder={t.contentLabel} value={newCommentContent} onChange={(e) => setNewCommentContent(e.target.value)} variant="standard"
                                                        InputProps={{ disableUnderline: true, style: { color: ufo.cream, fontFamily: 'Rajdhani', fontSize: '1.1rem' } }}
                                                        sx={{ borderBottom: `1px solid ${ufo.lineTeal}`, pb: 1, mt: 2 }} />
                                                </Grid>
                                                <Grid item xs={12} sx={{ textAlign: 'right', mt: 2 }}>
                                                    <Button variant="text" endIcon={<Send size={18} />} disabled={submittingComment || !newCommentUser || !newCommentContent} onClick={handlePostComment}
                                                        sx={{ color: ufo.teal, '&:hover': { bgcolor: 'rgba(53,224,208,0.1)' } }}>
                                                        {t.submit}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                                            {comments.length === 0 ? (
                                                <Typography sx={{ color: ufo.muted, fontStyle: 'italic', textAlign: 'center' }}>{t.noComments}</Typography>
                                            ) : (
                                                comments.map((comment, index) => (
                                                    <motion.div key={comment.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>
                                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                                            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,182,39,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${ufo.line}`, flexShrink: 0 }}>
                                                                <User size={20} color={ufo.amber} />
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                                                    <Typography sx={{ color: ufo.amber, fontWeight: 700, fontFamily: '"Space Mono", monospace', fontSize: '0.9rem' }}>{comment.username}</Typography>
                                                                    <Typography variant="caption" sx={{ color: ufo.muted }}>{new Date(comment.created_at).toLocaleDateString()}</Typography>
                                                                </Box>
                                                                <Typography sx={{ color: 'rgba(237,228,207,0.8)', fontFamily: 'Rajdhani', fontSize: '1.08rem', lineHeight: 1.5 }}>{comment.content}</Typography>
                                                            </Box>
                                                        </Box>
                                                        {index < comments.length - 1 && <Divider sx={{ mt: 3, borderColor: 'rgba(255,255,255,0.06)' }} />}
                                                    </motion.div>
                                                ))
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Footer */}
                                    <Box sx={{ mt: 8, pt: 4, borderTop: `1px solid ${ufo.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                        <Radar size={16} color={ufo.amber} opacity={0.6} />
                                        <Typography sx={{ ...monoLabel, color: ufo.muted, fontSize: '0.68rem', textAlign: 'center' }}>{t.footer}</Typography>
                                        <Radar size={16} color={ufo.amber} opacity={0.6} />
                                    </Box>
                                </motion.div>
                            ) : (
                                <Box sx={{ height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.25 }}>
                                    <Satellite size={72} color={ufo.amber} />
                                    <Typography sx={{ ...monoLabel, mt: 2, fontSize: '0.8rem' }}>{t.select}</Typography>
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
