import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, IconButton, Skeleton, useMediaQuery, useTheme, Button, TextField, Divider, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, BlogPost, BlogComment } from '../lib/supabase';
import { Radio, Eye, Satellite, ArrowLeft, MessageSquare, Send, User, Share2, Radar } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ufo } from '../theme';

interface BlogProps {
    selectedPost?: BlogPost | null;
    showAllPosts?: boolean;
}

// Reusable retro saucer SVG
const SaucerSVG = ({ size = 90 }: { size?: number }) => (
    <svg width={size} height={size * 0.5} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <path d="M48 46 L34 62 L86 62 L72 46 Z" fill={ufo.teal} opacity="0.14" />
        <ellipse cx="60" cy="34" rx="54" ry="15" fill={ufo.teal} opacity="0.9" />
        <ellipse cx="60" cy="30" rx="52" ry="12" fill="#0A0C13" opacity="0.35" />
        <path d="M38 26 Q60 6 82 26 Z" fill={ufo.amber} opacity="0.9" />
        <ellipse cx="60" cy="26" rx="22" ry="8" fill={ufo.amber} opacity="0.55" />
        <circle cx="30" cy="36" r="3" fill="#fff" />
        <circle cx="46" cy="40" r="3" fill={ufo.amber} />
        <circle cx="60" cy="41" r="3" fill="#fff" />
        <circle cx="74" cy="40" r="3" fill={ufo.amber} />
        <circle cx="90" cy="36" r="3" fill="#fff" />
    </svg>
);

// Saucer that drifts back and forth across the sky
const Saucer = ({ delay = 0, top = '12%', size = 90 }: { delay?: number; top?: string; size?: number }) => (
    <motion.div
        animate={{ x: ['-12vw', '32vw', '-28vw', '12vw', '-12vw'], y: [0, -18, 8, -12, 0], rotate: [-4, 4, -6, 5, -4] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay }}
        style={{ position: 'absolute', top, left: '50%', zIndex: 0, opacity: 0.5, pointerEvents: 'none', filter: 'drop-shadow(0 0 14px rgba(53,224,208,0.7))' }}
    >
        <SaucerSVG size={size} />
    </motion.div>
);

// Saucer that flies in a full circular orbit ("dando vueltas")
const OrbitingSaucer = ({ top = '40%', left = '50%', radius = 160, size = 60, duration = 20, reverse = false, opacity = 0.4 }:
    { top?: string; left?: string; radius?: number; size?: number; duration?: number; reverse?: boolean; opacity?: number }) => (
    <motion.div
        animate={{ rotate: reverse ? [360, 0] : [0, 360] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top, left, width: 0, height: 0, zIndex: 0, pointerEvents: 'none' }}
    >
        <motion.div
            animate={{ rotate: reverse ? [0, 360] : [360, 0] }}
            transition={{ duration, repeat: Infinity, ease: 'linear' }}
            style={{ transform: `translateX(${radius}px)`, opacity, filter: 'drop-shadow(0 0 12px rgba(255,182,39,0.6))' }}
        >
            <SaucerSVG size={size} />
        </motion.div>
    </motion.div>
);

// Classic grey alien waving hello
const AlienGrey = ({ size = 150 }: { size?: number }) => {
    const grey = '#A9BBB0';
    const greyDark = '#7E9084';
    return (
        <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: [0, -6, 0], opacity: 1 }}
            transition={{ y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 1 } }}
            style={{ width: size, filter: 'drop-shadow(0 0 16px rgba(53,224,208,0.5))', pointerEvents: 'none' }}
        >
            <svg viewBox="0 0 150 210" width={size} height={size * 1.4} xmlns="http://www.w3.org/2000/svg">
                {/* body */}
                <path d="M58 128 Q75 122 92 128 L98 190 Q75 204 52 190 Z" fill={grey} />
                <path d="M58 128 Q75 122 92 128 L94 150 Q75 158 56 150 Z" fill={greyDark} opacity="0.5" />
                {/* legs */}
                <path d="M66 196 L64 208" stroke={greyDark} strokeWidth="7" strokeLinecap="round" />
                <path d="M84 196 L86 208" stroke={greyDark} strokeWidth="7" strokeLinecap="round" />
                {/* static arm (down, left) */}
                <path d="M60 136 Q42 154 46 184" stroke={grey} strokeWidth="9" fill="none" strokeLinecap="round" />
                <circle cx="46" cy="186" r="6" fill={grey} />
                {/* waving arm (right) */}
                <motion.g
                    animate={{ rotate: [-12, 22, -12] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: '90px 134px' }}
                >
                    <path d="M90 134 Q112 120 116 92" stroke={grey} strokeWidth="9" fill="none" strokeLinecap="round" />
                    <circle cx="116" cy="90" r="8" fill={grey} />
                </motion.g>
                {/* head */}
                <ellipse cx="72" cy="68" rx="46" ry="56" fill={grey} />
                <ellipse cx="72" cy="60" rx="40" ry="48" fill={greyDark} opacity="0.25" />
                {/* eyes — blink + look around */}
                <motion.g
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.82, 0.87, 0.92, 1] }}
                    style={{ transformBox: 'view-box', transformOrigin: '72px 72px' }}
                >
                    <ellipse cx="53" cy="72" rx="11" ry="19" fill="#05070a" transform="rotate(24 53 72)" />
                    <ellipse cx="91" cy="72" rx="11" ry="19" fill="#05070a" transform="rotate(-24 91 72)" />
                    <motion.g
                        animate={{ x: [0, 5, -4, 2, 0], y: [0, 2, -2, 3, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <circle cx="50" cy="66" r="3.2" fill="#fff" opacity="0.9" />
                        <circle cx="88" cy="66" r="3.2" fill="#fff" opacity="0.9" />
                        <circle cx="55" cy="78" r="1.6" fill={ufo.teal} opacity="0.7" />
                        <circle cx="93" cy="78" r="1.6" fill={ufo.teal} opacity="0.7" />
                    </motion.g>
                </motion.g>
                {/* nostrils + mouth */}
                <circle cx="68" cy="96" r="1.6" fill={greyDark} />
                <circle cx="76" cy="96" r="1.6" fill={greyDark} />
                <path d="M64 106 Q72 111 80 106" stroke={greyDark} strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
        </motion.div>
    );
};

// Retro HUD corner brackets for panels
const Corners = ({ color = ufo.amber, opacity = 0.5, inset = 8 }: { color?: string; opacity?: number; inset?: number }) => {
    const base = { position: 'absolute' as const, width: 14, height: 14, zIndex: 3, pointerEvents: 'none' as const, opacity };
    return (
        <>
            <Box sx={{ ...base, top: inset, left: inset, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
            <Box sx={{ ...base, top: inset, right: inset, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
            <Box sx={{ ...base, bottom: inset, left: inset, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
            <Box sx={{ ...base, bottom: inset, right: inset, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
        </>
    );
};

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
            announcement: 'Nuevo avistamiento cada semana',
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
            announcement: 'New sighting every week',
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
                position: 'fixed', top: 0, left: 0, width: '100%', py: 1, pl: 2, pr: 8, zIndex: 1300,
                minHeight: 48, borderBottom: `1px solid ${ufo.line}`,
                background: 'rgba(10,12,19,0.85)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
            }}>
                <Radio size={15} color={ufo.teal} style={{ flexShrink: 0 }} />
                <Typography variant="body2" sx={{ ...monoLabel, fontWeight: 700, fontSize: { xs: '0.62rem', sm: '0.78rem' }, opacity: 0.9, textAlign: 'center', lineHeight: 1.3 }}>
                    {t.announcement} <span style={{ color: ufo.amber }}>🛸</span>
                </Typography>
                <IconButton
                    onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
                    size="small"
                    sx={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        color: ufo.teal, border: `1px solid ${ufo.lineTeal}`, borderRadius: '3px',
                        ...monoLabel, fontSize: '0.6rem', px: 0.8,
                        '&:hover': { bgcolor: 'rgba(53,224,208,0.1)' },
                    }}
                >
                    {lang === 'ES' ? 'ES-01' : 'EN-01'}
                </IconButton>
            </Box>

            {/* CRT scanlines + vignette */}
            <div className="crt-scanlines" />
            <div className="crt-vignette" />

            {/* Fleet of saucers */}
            <Saucer top="8%" size={95} />
            <Saucer delay={9} top="16%" size={70} />
            <Saucer delay={4} top="24%" size={55} />
            <OrbitingSaucer top="30%" left="18%" radius={130} size={58} duration={22} />
            <OrbitingSaucer top="62%" left="82%" radius={170} size={68} duration={30} reverse opacity={0.32} />
            <OrbitingSaucer top="78%" left="30%" radius={110} size={46} duration={18} opacity={0.28} />
            <OrbitingSaucer top="45%" left="55%" radius={230} size={40} duration={38} reverse opacity={0.22} />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pb: 12 }}>
                {/* HERO / COVER */}
                <Box className="halftone" sx={{
                    position: 'relative', width: '100%', height: { xs: '300px', md: '380px' },
                    mb: { xs: 4, md: 6 }, borderRadius: 2, overflow: 'hidden',
                    border: `1px solid ${ufo.line}`, boxShadow: '0 0 50px rgba(0,0,0,0.7)',
                    background: `
                        radial-gradient(ellipse at 50% 120%, rgba(53,224,208,0.18) 0%, transparent 55%),
                        radial-gradient(ellipse at 50% 30%, rgba(255,182,39,0.12) 0%, transparent 60%),
                        linear-gradient(180deg, #0d1120 0%, #0A0C13 100%)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: { xs: 'flex-start', md: 'center' }, pt: { xs: 4, md: 0 },
                }}>
                    <Corners color={ufo.amber} opacity={0.45} inset={10} />
                    {/* horizon grid */}
                    <Box sx={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
                        background: `repeating-linear-gradient(90deg, transparent 0 38px, rgba(53,224,208,0.10) 38px 39px),
                                     repeating-linear-gradient(0deg, transparent 0 38px, rgba(53,224,208,0.10) 38px 39px)`,
                        transform: 'perspective(300px) rotateX(60deg)', transformOrigin: 'bottom', opacity: 0.6, pointerEvents: 'none',
                    }} />
                    {/* Rotating radar sweep */}
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', top: '50%', left: '50%', width: '160%', height: '260%',
                            transform: 'translate(-50%,-50%)',
                            background: 'conic-gradient(from 0deg, rgba(53,224,208,0.16), transparent 25%, transparent 100%)',
                            pointerEvents: 'none', opacity: 0.6,
                        }}
                    />
                    {/* Retro starburst behind title */}
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%', width: 520, height: 520, transform: 'translate(-50%,-50%)',
                        background: 'repeating-conic-gradient(from 0deg, rgba(255,182,39,0.06) 0deg 6deg, transparent 6deg 12deg)',
                        borderRadius: '50%', maskImage: 'radial-gradient(circle, #000 30%, transparent 62%)',
                        WebkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 62%)', pointerEvents: 'none',
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

                    {/* Waving grey alien */}
                    <Box sx={{ position: 'absolute', right: { xs: 4, md: 28 }, bottom: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <motion.div
                            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }}
                            style={{ display: isMobile ? 'none' : 'block' }}
                        >
                            <Box sx={{
                                position: 'relative', px: 1.5, py: 0.5, borderRadius: 1, bgcolor: ufo.amber, color: '#0A0C13',
                                fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: { xs: '0.6rem', md: '0.72rem' }, letterSpacing: '0.08em',
                                boxShadow: '0 0 14px rgba(255,182,39,0.6)',
                                '&::after': { content: '""', position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${ufo.amber}` },
                            }}>
                                {lang === 'ES' ? '¡HOLA, TERRÍCOLA!' : 'GREETINGS, EARTHLING!'}
                            </Box>
                        </motion.div>
                        <Box sx={{ width: { xs: 84, md: 130 } }}>
                            <AlienGrey size={isMobile ? 84 : 130} />
                        </Box>
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
                        flex: { xs: '1', md: '0 0 280px' }, overflowY: { xs: 'visible', md: 'auto' }, pr: { xs: 0, md: 1.5 },
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
                            posts.map((post, i) => {
                                const active = selectedPost?.id === post.id;
                                return (
                                    <motion.div key={post.id} whileHover={{ x: 4 }} onClick={() => handlePostSelect(post)}>
                                        <Card sx={{
                                            display: 'flex', alignItems: 'stretch', mb: 1.25, cursor: 'pointer', borderRadius: 1, overflow: 'hidden', minHeight: 74,
                                            background: active ? 'rgba(255,182,39,0.08)' : 'rgba(16,20,31,0.7)',
                                            border: `1px solid ${active ? ufo.amber : ufo.line}`,
                                            borderLeft: `3px solid ${active ? ufo.amber : 'transparent'}`,
                                            backdropFilter: 'blur(12px)', transition: 'all 0.25s ease',
                                            boxShadow: active ? '0 0 18px rgba(255,182,39,0.3)' : 'none',
                                            '&:hover': { borderLeftColor: ufo.teal, boxShadow: '0 6px 16px rgba(53,224,208,0.18)' },
                                        }}>
                                            {/* thumbnail */}
                                            <Box sx={{
                                                width: 70, flexShrink: 0, position: 'relative',
                                                backgroundImage: post.main_image ? `url(${post.main_image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center',
                                                bgcolor: '#05070a', opacity: active ? 1 : 0.78,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRight: `1px solid ${ufo.line}`,
                                            }}>
                                                {!post.main_image && <Satellite size={18} color={ufo.muted as string} />}
                                            </Box>
                                            {/* body */}
                                            <Box sx={{ flex: 1, minWidth: 0, px: 1.25, py: 0.9, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                                                    <Typography sx={{ ...monoLabel, color: ufo.teal, fontSize: '0.55rem' }}>EXP-{String(i + 1).padStart(3, '0')}</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                                        <Eye size={12} color={ufo.teal} />
                                                        <Typography sx={{ ...monoLabel, color: ufo.teal, fontSize: '0.58rem' }}>{post.views || 0}</Typography>
                                                    </Box>
                                                </Box>
                                                <Typography sx={{
                                                    color: active ? ufo.amber : ufo.cream, fontFamily: '"Audiowide", sans-serif', fontSize: '0.72rem', lineHeight: 1.2,
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                }}>
                                                    {lang === 'EN' ? post.title_en || post.title : post.title}
                                                </Typography>
                                                {(post.tags || []).length > 0 && (
                                                    <Typography noWrap sx={{ ...monoLabel, color: ufo.muted, fontSize: '0.55rem', mt: 0.4 }}>
                                                        {(post.tags || []).slice(0, 3).join(' · ')}
                                                    </Typography>
                                                )}
                                            </Box>
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
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, px: 1, py: 0.3, border: `1px solid ${ufo.coral}`, borderRadius: 0.5 }}>
                                                <motion.span
                                                    animate={{ opacity: [1, 0.15, 1] }}
                                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                                                    style={{ width: 7, height: 7, borderRadius: '50%', background: ufo.coral, display: 'inline-block' }}
                                                />
                                                <Typography sx={{ ...monoLabel, color: ufo.coral, fontSize: '0.58rem' }}>LIVE</Typography>
                                            </Box>
                                            <IconButton size="small" sx={{ color: ufo.teal, border: `1px solid ${ufo.lineTeal}`, borderRadius: 1 }} onClick={handleShare} title="Compartir">
                                                <Share2 size={18} />
                                            </IconButton>
                                        </Box>
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
