import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, TextField, Button, Paper, Grid, Card, CardContent, CardMedia,
    IconButton, Dialog, DialogContent, Chip, Divider, List, ListItem, ListItemText,
    ListItemSecondaryAction, Tooltip, Tabs, Tab, InputAdornment, CircularProgress, LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { supabase, BlogPost, BlogComment } from '../lib/supabase';
import {
    Lock, Plus, Edit, Trash2, LogOut, Save, Image as ImageIcon, MessageSquare, User, X,
    Radar, Eye, Copy, UploadCloud, Link as LinkIcon, Radio, ArrowLeft, Tag as TagIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ufo } from '../theme';

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin';
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'pass';

const mono = { fontFamily: '"Space Mono", monospace', letterSpacing: '0.1em' };
const wordCount = (s?: string) => (s || '').trim() ? (s || '').trim().split(/\s+/).length : 0;

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState(false);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Editor
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [newTag, setNewTag] = useState('');
    const [tab, setTab] = useState(0);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [saving, setSaving] = useState(false);

    // Comments
    const [openCommentsDialog, setOpenCommentsDialog] = useState(false);
    const [selectedPostComments, setSelectedPostComments] = useState<BlogComment[]>([]);
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);

    useEffect(() => {
        if (localStorage.getItem('admin_auth') === 'true') {
            setIsLoggedIn(true);
            fetchPosts();
        }
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching posts:', error);
        else setPosts(data || []);
        setLoading(false);
    };

    const fetchComments = async (postId: string) => {
        const { data, error } = await supabase.from('blog_comments').select('*').eq('post_id', postId).order('created_at', { ascending: false });
        if (error) console.error(error);
        else setSelectedPostComments(data || []);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm('¿Borrar esta señal de transmisión permanentemente?')) {
            const { error } = await supabase.from('blog_comments').delete().eq('id', commentId);
            if (error) alert('Error: ' + error.message);
            else if (currentPostId) fetchComments(currentPostId);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginData.username === ADMIN_USER && loginData.password === ADMIN_PASS) {
            setIsLoggedIn(true);
            setLoginError(false);
            localStorage.setItem('admin_auth', 'true');
            fetchPosts();
        } else {
            setLoginError(true);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('admin_auth');
    };

    const handleSavePost = async () => {
        if (!editingPost?.title || !editingPost?.content) {
            setTab(0);
            alert('Se requiere al menos título y contenido en español.');
            return;
        }
        setSaving(true);
        const { id, created_at, views, ...updateData } = editingPost as any;
        const postToSave = { ...updateData, author: ADMIN_USER, tags: editingPost.tags || [] };

        let error;
        if (id) {
            ({ error } = await supabase.from('blogs').update(postToSave).eq('id', id));
        } else {
            ({ error } = await supabase.from('blogs').insert([postToSave]));
        }
        setSaving(false);
        if (error) alert('Fallo en la transmisión: ' + error.message);
        else { setOpenDialog(false); fetchPosts(); }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Seguro que deseas borrar este registro?')) {
            const { error } = await supabase.from('blogs').delete().eq('id', id);
            if (error) alert('Error: ' + error.message);
            else fetchPosts();
        }
    };

    const openEditor = (post: BlogPost | null = null) => {
        setEditingPost(post || { title: '', title_en: '', summary: '', summary_en: '', content: '', content_en: '', main_image: '', gallery_images: [], tags: [] });
        setTab(0);
        setOpenDialog(true);
    };

    const openComments = (postId: string) => {
        setCurrentPostId(postId);
        fetchComments(postId);
        setOpenCommentsDialog(true);
    };

    const addTag = () => {
        const clean = newTag.trim();
        if (clean && editingPost && !editingPost.tags?.includes(clean)) {
            setEditingPost({ ...editingPost, tags: [...(editingPost.tags || []), clean] });
            setNewTag('');
        }
    };

    // Generic uploader → returns public URLs
    const uploadFiles = async (files: FileList): Promise<string[]> => {
        const urls: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop();
            const path = `blog-gallery/${Math.random().toString(36).substring(2)}-${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('blog-images').upload(path, file);
            if (error) { alert(`Error subiendo ${file.name}: ${error.message}`); continue; }
            const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(path);
            urls.push(publicUrl);
        }
        return urls;
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingGallery(true);
        const urls = await uploadFiles(files);
        setEditingPost(p => ({ ...p, gallery_images: [...(p?.gallery_images || []), ...urls] }));
        setUploadingGallery(false);
        e.target.value = '';
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingCover(true);
        const urls = await uploadFiles(files);
        if (urls[0]) setEditingPost(p => ({ ...p, main_image: urls[0] }));
        setUploadingCover(false);
        e.target.value = '';
    };

    const removeGalleryImage = (index: number) => {
        const g = [...(editingPost?.gallery_images || [])];
        g.splice(index, 1);
        setEditingPost({ ...editingPost, gallery_images: g });
    };

    const copyEsToEn = () => {
        if (!editingPost) return;
        setEditingPost({
            ...editingPost,
            title_en: editingPost.title || '',
            summary_en: editingPost.summary || '',
            content_en: editingPost.content || '',
        });
    };

    // ---------- LOGIN ----------
    if (!isLoggedIn) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                <div className="crt-scanlines" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Paper sx={{ p: { xs: 4, sm: 6 }, width: 400, maxWidth: '100%', textAlign: 'center', border: `1px solid ${ufo.line}` }}>
                        <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', border: `1px solid ${ufo.line}`, mb: 2, boxShadow: '0 0 24px rgba(255,182,39,0.25)' }}>
                            <Lock size={36} color={ufo.amber} />
                        </Box>
                        <Typography sx={{ ...mono, color: ufo.teal, fontSize: '0.7rem', mb: 0.5 }}>ACCESO RESTRINGIDO</Typography>
                        <Typography variant="h5" sx={{ mb: 4, color: ufo.amber, fontFamily: '"Audiowide", sans-serif', fontSize: '1.4rem' }}>
                            Sala de Control
                        </Typography>
                        <form onSubmit={handleLogin}>
                            <TextField fullWidth label="Identidad" sx={{ mb: 3 }} value={loginData.username}
                                onChange={(e) => { setLoginData({ ...loginData, username: e.target.value }); setLoginError(false); }} />
                            <TextField fullWidth label="Clave" type="password" sx={{ mb: loginError ? 1.5 : 4 }} value={loginData.password}
                                onChange={(e) => { setLoginData({ ...loginData, password: e.target.value }); setLoginError(false); }} />
                            {loginError && (
                                <Typography sx={{ ...mono, color: ufo.coral, fontSize: '0.72rem', mb: 3 }}>
                                    ⚠ Credenciales inválidas, buscador de la verdad.
                                </Typography>
                            )}
                            <Button fullWidth variant="contained" type="submit" endIcon={<Radar size={18} />}>
                                Autenticar
                            </Button>
                        </form>
                        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/')} sx={{ mt: 3, color: ufo.muted, fontSize: '0.7rem' }}>
                            Volver al blog
                        </Button>
                    </Paper>
                </motion.div>
            </Box>
        );
    }

    // ---------- DASHBOARD ----------
    return (
        <Box sx={{ minHeight: '100vh', pt: { xs: '90px', md: '110px' }, pb: 10 }}>
            <div className="crt-scanlines" />
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                    <Box>
                        <Typography sx={{ ...mono, color: ufo.teal, fontSize: '0.7rem', mb: 0.5 }}>PANEL DE CONTROL · {posts.length} REGISTROS</Typography>
                        <Typography variant="h4" sx={{ color: ufo.amber, fontFamily: '"Audiowide", sans-serif' }}>Archivo de Anomalías</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => openEditor()}>Nuevo registro</Button>
                        <Button variant="text" startIcon={<Radio size={16} />} onClick={() => navigate('/')} sx={{ color: ufo.muted }}>Ver blog</Button>
                        <Button variant="text" startIcon={<LogOut size={16} />} onClick={handleLogout} sx={{ color: ufo.muted }}>Salir</Button>
                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: ufo.amber }} /></Box>
                ) : posts.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center', border: `1px dashed ${ufo.line}` }}>
                        <Satellite />
                        <Typography sx={{ color: ufo.muted, mb: 2 }}>No hay transmisiones archivadas todavía.</Typography>
                        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => openEditor()}>Crear el primero</Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {posts.map((post) => (
                            <Grid item xs={12} sm={6} md={4} key={post.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all .25s', '&:hover': { borderColor: ufo.amber, transform: 'translateY(-3px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' } }}>
                                    <Box sx={{ position: 'relative', height: 140, bgcolor: '#000' }}>
                                        {post.main_image
                                            ? <CardMedia component="img" height="140" image={post.main_image} alt={post.title} sx={{ opacity: 0.85 }} />
                                            : <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={28} color={ufo.muted as string} /></Box>}
                                        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(10,12,19,0.8)', px: 1, py: 0.3, borderRadius: 1, border: `1px solid ${ufo.lineTeal}` }}>
                                            <Eye size={13} color={ufo.teal} />
                                            <Typography sx={{ ...mono, color: ufo.teal, fontSize: '0.65rem' }}>{post.views || 0}</Typography>
                                        </Box>
                                    </Box>
                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography sx={{ ...mono, color: ufo.muted, fontSize: '0.62rem', mb: 0.5 }}>{new Date(post.created_at).toLocaleDateString()}</Typography>
                                        <Typography sx={{ color: ufo.amber, fontFamily: '"Audiowide", sans-serif', fontSize: '0.95rem', lineHeight: 1.25, mb: 1 }}>{post.title}</Typography>
                                        <Typography sx={{ color: ufo.muted, fontSize: '0.92rem', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{post.summary}</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${ufo.line}`, pt: 1 }}>
                                            <Chip label={`${(post.tags || []).length} tags`} size="small" sx={{ bgcolor: 'rgba(53,224,208,0.08)', color: ufo.teal, border: `1px solid ${ufo.lineTeal}`, fontSize: '0.6rem', height: 20 }} />
                                            <Box>
                                                <Tooltip title="Comentarios"><IconButton size="small" sx={{ color: ufo.amber }} onClick={() => openComments(post.id)}><MessageSquare size={17} /></IconButton></Tooltip>
                                                <Tooltip title="Editar"><IconButton size="small" sx={{ color: ufo.teal }} onClick={() => openEditor(post)}><Edit size={17} /></IconButton></Tooltip>
                                                <Tooltip title="Borrar"><IconButton size="small" sx={{ color: ufo.coral }} onClick={() => handleDelete(post.id)}><Trash2 size={17} /></IconButton></Tooltip>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* ---------- EDITOR ---------- */}
            <Dialog open={openDialog} onClose={() => !saving && setOpenDialog(false)} maxWidth="lg" fullWidth
                PaperProps={{ sx: { bgcolor: ufo.bg2, backgroundImage: 'none', border: `1px solid ${ufo.line}`, height: { xs: '100%', md: '92vh' }, m: { xs: 0, md: 2 } } }}
                fullScreen={typeof window !== 'undefined' && window.innerWidth < 900}>
                {/* Editor header */}
                <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${ufo.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Radar size={22} color={ufo.amber} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ ...mono, color: ufo.teal, fontSize: '0.62rem' }}>{editingPost?.id ? 'EDITANDO REGISTRO' : 'NUEVO REGISTRO'}</Typography>
                            <Typography noWrap sx={{ color: ufo.amber, fontFamily: '"Audiowide", sans-serif', fontSize: '1rem' }}>
                                {editingPost?.title || 'Sin título'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => setOpenDialog(false)} sx={{ color: ufo.muted }}><X size={20} /></IconButton>
                </Box>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                    sx={{ px: 2, borderBottom: `1px solid ${ufo.line}`, flexShrink: 0, '& .MuiTab-root': { ...mono, fontSize: '0.72rem', color: ufo.muted, minHeight: 48 }, '& .Mui-selected': { color: `${ufo.amber} !important` }, '& .MuiTabs-indicator': { bgcolor: ufo.amber } }}>
                    <Tab label="① Español" />
                    <Tab label="② English" />
                    <Tab label="③ Portada · Galería · Tags" />
                    <Tab label="④ Vista previa" />
                </Tabs>

                <DialogContent sx={{ p: { xs: 2, md: 4 }, flex: 1, overflowY: 'auto' }}>
                    {/* --- TAB 0: Spanish --- */}
                    {tab === 0 && (
                        <Box>
                            <TextField fullWidth label="Título" value={editingPost?.title || ''} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} sx={{ mb: 3 }} />
                            <TextField fullWidth label="Resumen (aparece en la lista)" multiline rows={2} value={editingPost?.summary || ''} onChange={(e) => setEditingPost({ ...editingPost, summary: e.target.value })} sx={{ mb: 3 }} />
                            <TextField fullWidth label="Contenido" multiline rows={16} value={editingPost?.content || ''} onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                helperText={`${wordCount(editingPost?.content)} palabras · los saltos de línea se respetan`} />
                        </Box>
                    )}

                    {/* --- TAB 1: English --- */}
                    {tab === 1 && (
                        <Box>
                            <Button startIcon={<Copy size={16} />} onClick={copyEsToEn} variant="outlined" sx={{ mb: 3, color: ufo.teal, borderColor: ufo.lineTeal }}>
                                Copiar desde español
                            </Button>
                            <TextField fullWidth label="Title" value={editingPost?.title_en || ''} onChange={(e) => setEditingPost({ ...editingPost, title_en: e.target.value })} sx={{ mb: 3 }} />
                            <TextField fullWidth label="Summary" multiline rows={2} value={editingPost?.summary_en || ''} onChange={(e) => setEditingPost({ ...editingPost, summary_en: e.target.value })} sx={{ mb: 3 }} />
                            <TextField fullWidth label="Content" multiline rows={16} value={editingPost?.content_en || ''} onChange={(e) => setEditingPost({ ...editingPost, content_en: e.target.value })}
                                helperText={`${wordCount(editingPost?.content_en)} words`} />
                        </Box>
                    )}

                    {/* --- TAB 2: Media & tags --- */}
                    {tab === 2 && (
                        <Grid container spacing={4}>
                            {/* Cover */}
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ ...mono, color: ufo.amber, fontSize: '0.72rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><ImageIcon size={15} /> PORTADA</Typography>
                                <Box sx={{ width: '100%', height: 200, borderRadius: 1, border: `1px dashed ${ufo.line}`, mb: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
                                    {editingPost?.main_image
                                        ? <img src={editingPost.main_image} alt="portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <Typography sx={{ color: ufo.muted, fontSize: '0.85rem' }}>Sin portada</Typography>}
                                </Box>
                                <input accept="image/*" style={{ display: 'none' }} id="cover-upload" type="file" onChange={handleCoverUpload} />
                                <label htmlFor="cover-upload">
                                    <Button component="span" variant="contained" fullWidth disabled={uploadingCover} startIcon={uploadingCover ? <CircularProgress size={16} /> : <UploadCloud size={18} />} sx={{ mb: 2 }}>
                                        {uploadingCover ? 'Subiendo...' : 'Subir portada'}
                                    </Button>
                                </label>
                                <TextField fullWidth size="small" label="...o pega una URL" value={editingPost?.main_image || ''} onChange={(e) => setEditingPost({ ...editingPost, main_image: e.target.value })}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon size={15} /></InputAdornment> }} />
                            </Grid>

                            {/* Tags */}
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ ...mono, color: ufo.amber, fontSize: '0.72rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><TagIcon size={15} /> ETIQUETAS</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField size="small" fullWidth placeholder="ej. Avistamiento, Abducción..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                    <Button onClick={addTag} variant="outlined">Añadir</Button>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: 40 }}>
                                    {(editingPost?.tags || []).length === 0 && <Typography sx={{ color: ufo.muted, fontSize: '0.85rem' }}>Aún sin etiquetas.</Typography>}
                                    {editingPost?.tags?.map((t) => (
                                        <Chip key={t} label={t} onDelete={() => setEditingPost({ ...editingPost, tags: editingPost.tags?.filter(x => x !== t) })}
                                            sx={{ bgcolor: 'rgba(53,224,208,0.1)', color: ufo.teal, border: `1px solid ${ufo.lineTeal}` }} />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12}><Divider sx={{ borderStyle: 'dashed', borderColor: ufo.line }} /></Grid>

                            {/* Gallery */}
                            <Grid item xs={12}>
                                <Typography sx={{ ...mono, color: ufo.teal, fontSize: '0.72rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ImageIcon size={15} /> GALERÍA DE EVIDENCIA (hasta 5 se muestran como polaroids)
                                </Typography>
                                <input accept="image/*" style={{ display: 'none' }} id="gallery-upload" multiple type="file" onChange={handleGalleryUpload} />
                                <label htmlFor="gallery-upload">
                                    <Button component="span" variant="outlined" disabled={uploadingGallery} startIcon={uploadingGallery ? <CircularProgress size={16} /> : <UploadCloud size={18} />} sx={{ color: ufo.teal, borderColor: ufo.lineTeal, mb: 2 }}>
                                        {uploadingGallery ? 'Subiendo...' : 'Subir imágenes'}
                                    </Button>
                                </label>
                                {uploadingGallery && <LinearProgress sx={{ mb: 2, '& .MuiLinearProgress-bar': { bgcolor: ufo.teal } }} />}
                                {editingPost?.gallery_images && editingPost.gallery_images.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {editingPost.gallery_images.map((url, i) => (
                                            <Box key={i} sx={{ position: 'relative', width: 110, height: 110, borderRadius: 1, overflow: 'hidden', border: `1px solid ${ufo.lineTeal}` }}>
                                                <img src={url} alt={`g${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <IconButton size="small" onClick={() => removeGalleryImage(i)} sx={{ position: 'absolute', top: 3, right: 3, bgcolor: 'rgba(10,12,19,0.85)', color: ufo.coral, '&:hover': { bgcolor: 'rgba(10,12,19,0.95)' } }}>
                                                    <X size={15} />
                                                </IconButton>
                                                {i < 5 && <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', bgcolor: 'rgba(10,12,19,0.7)', ...mono, color: ufo.teal, fontSize: '0.55rem', py: 0.2 }}>#{i + 1}</Box>}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    )}

                    {/* --- TAB 3: Preview --- */}
                    {tab === 3 && (
                        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
                            <Typography sx={{ ...mono, color: ufo.teal, fontSize: '0.62rem', mb: 1 }}>CANAL · {new Date().toLocaleDateString()}</Typography>
                            <Typography variant="h4" sx={{ fontFamily: '"Audiowide", sans-serif', color: ufo.amber, mb: 2, textShadow: '0 0 22px rgba(255,182,39,0.3)' }}>
                                {editingPost?.title || 'Sin título'}
                            </Typography>
                            {editingPost?.main_image && (
                                <Box sx={{ width: '100%', height: 300, borderRadius: 2, overflow: 'hidden', mb: 3, border: `1px solid ${ufo.line}` }}>
                                    <img src={editingPost.main_image} alt="portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                                {editingPost?.tags?.map(t => <Chip key={t} label={t} size="small" sx={{ bgcolor: 'rgba(53,224,208,0.08)', color: ufo.teal, border: `1px solid ${ufo.lineTeal}` }} />)}
                            </Box>
                            <Typography sx={{ whiteSpace: 'pre-line', fontFamily: 'Rajdhani', fontSize: '1.15rem', lineHeight: 1.8, color: 'rgba(237,228,207,0.9)' }}>
                                {editingPost?.content || 'El contenido aparecerá aquí...'}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                {/* Sticky action bar */}
                <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${ufo.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexShrink: 0, bgcolor: ufo.bg }}>
                    <Typography sx={{ ...mono, color: ufo.muted, fontSize: '0.65rem', display: { xs: 'none', sm: 'block' } }}>
                        {editingPost?.title && editingPost?.content ? '✓ Listo para archivar' : '⚠ Requiere título y contenido (ES)'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
                        <Button onClick={() => setOpenDialog(false)} sx={{ color: ufo.muted }}>Cancelar</Button>
                        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <Save size={18} />} onClick={handleSavePost} disabled={saving}>
                            {saving ? 'Archivando...' : 'Archivar registro'}
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* ---------- COMMENTS ---------- */}
            <Dialog open={openCommentsDialog} onClose={() => setOpenCommentsDialog(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { bgcolor: ufo.bg2, backgroundImage: 'none', border: `1px solid ${ufo.line}` } }}>
                <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${ufo.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <MessageSquare size={20} color={ufo.amber} />
                        <Typography sx={{ color: ufo.amber, fontFamily: '"Audiowide", sans-serif', fontSize: '1rem' }}>Registro de transmisiones</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenCommentsDialog(false)} sx={{ color: ufo.muted }}><X size={20} /></IconButton>
                </Box>
                <DialogContent sx={{ minHeight: 260 }}>
                    {selectedPostComments.length === 0 ? (
                        <Box sx={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                            <Typography sx={mono}>Sin señales interceptadas.</Typography>
                        </Box>
                    ) : (
                        <List>
                            {selectedPostComments.map((c) => (
                                <React.Fragment key={c.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                                        <Box sx={{ mr: 2, mt: 0.5 }}><User size={20} color={ufo.amber} /></Box>
                                        <ListItemText
                                            primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography sx={{ color: ufo.amber, fontWeight: 700, ...mono, fontSize: '0.85rem' }}>{c.username}</Typography>
                                                <Typography variant="caption" sx={{ color: ufo.muted }}>{new Date(c.created_at).toLocaleDateString()}</Typography>
                                            </Box>}
                                            secondary={<Typography sx={{ color: 'rgba(237,228,207,0.75)', mt: 0.5, fontFamily: 'Rajdhani', fontSize: '1.05rem' }}>{c.content}</Typography>}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" size="small" sx={{ color: ufo.coral, opacity: 0.6, '&:hover': { opacity: 1 } }} onClick={() => handleDeleteComment(c.id)}><Trash2 size={16} /></IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

// small inline icon used in empty-state
const Satellite = () => <Radar size={40} color={ufo.muted as string} style={{ marginBottom: 12 }} />;

export default Admin;
