import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { supabase, BlogPost, BlogComment } from '../lib/supabase';
import { Lock, Plus, Edit, Trash2, LogOut, Save, Image as ImageIcon, Languages, MessageSquare, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin';
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'pass';

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Editor State
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [newTag, setNewTag] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);

    // Comments State
    const [openCommentsDialog, setOpenCommentsDialog] = useState(false);
    const [selectedPostComments, setSelectedPostComments] = useState<BlogComment[]>([]);
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);

    useEffect(() => {
        const auth = localStorage.getItem('admin_auth');
        if (auth === 'true') {
            setIsLoggedIn(true);
            fetchPosts();
        }
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching posts:', error);
        else setPosts(data || []);
        setLoading(false);
    };

    const fetchComments = async (postId: string) => {
        const { data, error } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching comments:', error);
        else setSelectedPostComments(data || []);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm('Erase this transmission signal permanently?')) {
            const { error } = await supabase.from('blog_comments').delete().eq('id', commentId);
            if (error) alert('Error: ' + error.message);
            else if (currentPostId) fetchComments(currentPostId);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginData.username === ADMIN_USER && loginData.password === ADMIN_PASS) {
            setIsLoggedIn(true);
            localStorage.setItem('admin_auth', 'true');
            fetchPosts();
        } else {
            alert('Invalid credentials, seeker of truth.');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('admin_auth');
    };

    const handleSavePost = async () => {
        if (!editingPost?.title || !editingPost?.content) {
            alert('At least Spanish content is required.');
            return;
        }

        // Clean object to avoid sending primary keys or protected fields in the UPDATE body
        const { id, created_at, ...updateData } = editingPost as any;

        const postToSave = {
            ...updateData,
            author: ADMIN_USER,
            tags: editingPost.tags || []
        };

        let error;
        if (id) {
            const { error: err } = await supabase
                .from('blogs')
                .update(postToSave)
                .eq('id', id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('blogs')
                .insert([postToSave]);
            error = err;
        }

        if (error) {
            alert('System failure during transmission: ' + error.message);
        } else {
            setOpenDialog(false);
            fetchPosts();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to erase this knowledge?')) {
            const { error } = await supabase.from('blogs').delete().eq('id', id);
            if (error) alert('Error: ' + error.message);
            else fetchPosts();
        }
    };

    const openEditor = (post: BlogPost | null = null) => {
        setEditingPost(post || {
            title: '',
            title_en: '',
            summary: '',
            summary_en: '',
            content: '',
            content_en: '',
            main_image: '',
            gallery_images: [],
            tags: []
        });
        setOpenDialog(true);
    };

    const openComments = (postId: string) => {
        setCurrentPostId(postId);
        fetchComments(postId);
        setOpenCommentsDialog(true);
    };

    const addTag = () => {
        if (newTag && editingPost && !editingPost.tags?.includes(newTag)) {
            setEditingPost({ ...editingPost, tags: [...(editingPost.tags || []), newTag] });
            setNewTag('');
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploadingImages(true);
        const uploadedUrls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `blog-gallery/${fileName}`;

                const { data, error } = await supabase.storage
                    .from('blog-images')
                    .upload(filePath, file);

                if (error) {
                    console.error('Upload error:', error);
                    alert(`Error uploading ${file.name}: ${error.message}`);
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('blog-images')
                        .getPublicUrl(filePath);

                    uploadedUrls.push(publicUrl);
                }
            }

            // Add uploaded URLs to gallery_images
            setEditingPost({
                ...editingPost,
                gallery_images: [...(editingPost?.gallery_images || []), ...uploadedUrls]
            });

        } catch (err) {
            console.error('Fatal upload error:', err);
            alert('Error uploading images');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        const newGallery = [...(editingPost?.gallery_images || [])];
        newGallery.splice(index, 1);
        setEditingPost({ ...editingPost, gallery_images: newGallery });
    };

    if (!isLoggedIn) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Paper className="glass-card" sx={{ p: 6, width: 400, textAlign: 'center' }}>
                        <Lock size={48} color="#ffd700" style={{ marginBottom: '24px' }} />
                        <Typography variant="h5" sx={{ mb: 4, color: '#ffd700', fontFamily: 'Cinzel' }}>
                            Sanctum Access
                        </Typography>
                        <form onSubmit={handleLogin}>
                            <TextField
                                fullWidth
                                label="Identity"
                                variant="outlined"
                                sx={{ mb: 3 }}
                                value={loginData.username}
                                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                label="Cipher"
                                type="password"
                                variant="outlined"
                                sx={{ mb: 4 }}
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            />
                            <Button fullWidth variant="contained" type="submit" sx={{ bgcolor: '#ffd700', color: '#000', '&:hover': { bgcolor: '#ccae00' } }}>
                                Authenticate
                            </Button>
                        </form>
                    </Paper>
                </motion.div>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', pt: '120px', pb: 10, bgcolor: '#050505' }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                    <Typography variant="h3" sx={{ color: '#ffd700', fontFamily: 'Cinzel' }}>
                        Archives Control
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<Plus />} onClick={() => openEditor()} sx={{ borderColor: '#ffd700', color: '#ffd700' }}>
                            New Record
                        </Button>
                        <Button variant="text" startIcon={<LogOut />} onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Depart
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {posts.map((post) => (
                        <Grid item xs={12} sm={6} md={4} key={post.id}>
                            <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.1)' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ color: '#ffd700', mb: 1 }}>{post.title}</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>{post.summary}</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Tooltip title="Manage Signals">
                                            <IconButton size="small" sx={{ color: '#ffd700' }} onClick={() => openComments(post.id)}>
                                                <MessageSquare size={18} />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton size="small" sx={{ color: '#00ffaa' }} onClick={() => openEditor(post)}>
                                            <Edit size={18} />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: '#ff4d00' }} onClick={() => handleDelete(post.id)}>
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Editor Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ bgcolor: '#0a0a0b', color: '#ffd700', fontFamily: 'Cinzel', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Languages size={24} /> {editingPost?.id ? 'Bilingual Decryption' : 'New Trans-Lingual Mystery'}
                </DialogTitle>
                <DialogContent sx={{ bgcolor: '#0a0a0b', pt: 2 }}>
                    <Grid container spacing={4} sx={{ mt: 1 }}>
                        {/* Common metadata */}
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="Main Image URL"
                                value={editingPost?.main_image || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, main_image: e.target.value })}
                                InputProps={{ startAdornment: <ImageIcon size={20} style={{ marginRight: 8, opacity: 0.5 }} /> }}
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                {editingPost?.tags?.map((tag) => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onDelete={() => setEditingPost({ ...editingPost, tags: editingPost.tags?.filter(t => t !== tag) })}
                                        sx={{ bgcolor: 'rgba(0, 255, 170, 0.1)', color: '#00ffaa' }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    label="Add Tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                />
                                <Button onClick={addTag} variant="outlined">Add</Button>
                            </Box>
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ borderStyle: 'dashed', opacity: 0.2 }} /></Grid>

                        {/* SPANISH SECTION */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="overline" sx={{ color: '#ffd700', display: 'block', mb: 2 }}>Español (Principal)</Typography>
                            <TextField
                                fullWidth
                                label="Título (ES)"
                                value={editingPost?.title || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                sx={{ mb: 3 }}
                            />
                            <TextField
                                fullWidth
                                label="Resumen (ES)"
                                multiline
                                rows={2}
                                value={editingPost?.summary || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, summary: e.target.value })}
                                sx={{ mb: 3 }}
                            />
                            <TextField
                                fullWidth
                                label="Contenido (ES)"
                                multiline
                                rows={12}
                                value={editingPost?.content || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                            />
                        </Grid>

                        {/* ENGLISH SECTION */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="overline" sx={{ color: '#00D4FF', display: 'block', mb: 2 }}>English Version</Typography>
                            <TextField
                                fullWidth
                                label="Title (EN)"
                                value={editingPost?.title_en || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, title_en: e.target.value })}
                                sx={{ mb: 3 }}
                            />
                            <TextField
                                fullWidth
                                label="Summary (EN)"
                                multiline
                                rows={2}
                                value={editingPost?.summary_en || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, summary_en: e.target.value })}
                                sx={{ mb: 3 }}
                            />
                            <TextField
                                fullWidth
                                label="Content (EN)"
                                multiline
                                rows={12}
                                value={editingPost?.content_en || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, content_en: e.target.value })}
                            />
                        </Grid>

                        {/* GALLERY IMAGES SECTION */}
                        <Grid item xs={12}><Divider sx={{ borderStyle: 'dashed', opacity: 0.2 }} /></Grid>

                        <Grid item xs={12}>
                            <Typography variant="overline" sx={{ color: '#00ffaa', display: 'block', mb: 2 }}>
                                📸 Galería True Crime (Imágenes Superpuestas)
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="gallery-upload"
                                    multiple
                                    type="file"
                                    onChange={handleImageUpload}
                                />
                                <label htmlFor="gallery-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        disabled={uploadingImages}
                                        startIcon={<ImageIcon />}
                                        sx={{ borderColor: '#00ffaa', color: '#00ffaa' }}
                                    >
                                        {uploadingImages ? 'Subiendo...' : 'Subir Imágenes de Galería'}
                                    </Button>
                                </label>
                            </Box>

                            {/* Gallery Preview */}
                            {editingPost?.gallery_images && editingPost.gallery_images.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    {editingPost.gallery_images.map((url, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                position: 'relative',
                                                width: 120,
                                                height: 120,
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                border: '2px solid rgba(0, 255, 170, 0.3)'
                                            }}
                                        >
                                            <img
                                                src={url}
                                                alt={`Gallery ${index + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => removeGalleryImage(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    bgcolor: 'rgba(0,0,0,0.7)',
                                                    color: '#ff4d00',
                                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                                                }}
                                            >
                                                <X size={16} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ bgcolor: '#0a0a0b', p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSavePost}
                        sx={{ bgcolor: '#ffd700', color: '#000', '&:hover': { bgcolor: '#ccae00' } }}
                    >
                        Archive Record
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Comments Dialog */}
            <Dialog open={openCommentsDialog} onClose={() => setOpenCommentsDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#0a0a0b', color: '#ffd700', fontFamily: 'Cinzel', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MessageSquare size={24} /> Transmission Logs
                    </Box>
                    <IconButton onClick={() => setOpenCommentsDialog(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ bgcolor: '#0a0a0b', minHeight: '300px' }}>
                    {selectedPostComments.length === 0 ? (
                        <Box sx={{ display: 'flex', height: '200px', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                            <Typography variant="body1">No signals intercepted for this record.</Typography>
                        </Box>
                    ) : (
                        <List>
                            {selectedPostComments.map((comment) => (
                                <React.Fragment key={comment.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                                        <Box sx={{ mr: 2, mt: 0.5 }}>
                                            <User size={20} color="#ffd700" opacity={0.5} />
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ color: '#ffd700', fontWeight: 700 }}>
                                                        {comment.username}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                                                    {comment.content}
                                                </Typography>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" size="small" sx={{ color: '#ff4d00', opacity: 0.5, '&:hover': { opacity: 1 } }} onClick={() => handleDeleteComment(comment.id)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Admin;
