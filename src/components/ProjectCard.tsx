import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Modal, Backdrop, Fade, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Dynamic icons
import {
    Database,
    Code2,
    Cpu,
    Globe,
    Layers,
    Rocket,
    BrainCircuit,
    Server,
    Workflow,
    Cloud,
    Terminal,
    Activity
} from 'lucide-react';

export interface Project {
    id: string;
    title: string;
    description: string;
    details?: string;
    tags: string[];
    images?: string[];
}

interface ProjectCardProps {
    project: Project;
    onUpdate: (updatedProject: Project) => void;
}

const getIconForTag = (tag: string) => {
    const lowercaseTag = tag.toLowerCase();
    if (lowercaseTag.includes('python') || lowercaseTag.includes('golang') || lowercaseTag.includes('c++') || lowercaseTag.includes('react')) return <Code2 size={16} />;
    if (lowercaseTag.includes('fastapi') || lowercaseTag.includes('api') || lowercaseTag.includes('backend')) return <Terminal size={16} />;
    if (lowercaseTag.includes('db') || lowercaseTag.includes('sql') || lowercaseTag.includes('postgresql') || lowercaseTag.includes('mongodb') || lowercaseTag.includes('redis') || lowercaseTag.includes('pinecone')) return <Database size={16} />;
    if (lowercaseTag.includes('cloud') || lowercaseTag.includes('gcp') || lowercaseTag.includes('aws')) return <Cloud size={16} />;
    if (lowercaseTag.includes('ai') || lowercaseTag.includes('ml') || lowercaseTag.includes('model') || lowercaseTag.includes('neural') || lowercaseTag.includes('transformer')) return <BrainCircuit size={16} />;
    if (lowercaseTag.includes('ops') || lowercaseTag.includes('pipeline') || lowercaseTag.includes('langgraph')) return <Workflow size={16} />;
    if (lowercaseTag.includes('docker') || lowercaseTag.includes('kubernetes') || lowercaseTag.includes('hpc') || lowercaseTag.includes('slurm')) return <Layers size={16} />;
    if (lowercaseTag.includes('monitor') || lowercaseTag.includes('zabbix') || lowercaseTag.includes('diagnostics')) return <Activity size={16} />;
    return <Rocket size={16} />;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState(project);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const canEdit = import.meta.env.DEV;

    const handleSave = () => {
        onUpdate(editedProject);
        setIsEditing(false);
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project.images && project.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % project.images!.length);
        }
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project.images && project.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + project.images!.length) % project.images!.length);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setEditedProject(prev => ({
                        ...prev,
                        images: [...(prev.images || []), base64String]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setEditedProject(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => setOpenDetails(true)}
                style={{ cursor: 'pointer', height: '100%' }}
            >
                <Card
                    className="glass-card"
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover .edit-button': { opacity: 1 }
                    }}
                >
                    {canEdit && (
                        <IconButton
                            className="edit-button"
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                zIndex: 2,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                '&:hover': { bgcolor: 'primary.main', color: 'black' }
                            }}
                            size="small"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}

                    <Box
                        sx={{
                            height: '180px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {project.images && project.images.length > 0 ? (
                            <img
                                src={project.images[0]}
                                alt={project.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                            />
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0.1,
                                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}
                                />
                                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 300, opacity: 0.5 }}>
                                    {project.id}
                                </Typography>
                            </>
                        )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                            {project.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                            {project.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {project.tags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    icon={getIconForTag(tag)}
                                    size="small"
                                    sx={{
                                        borderRadius: '4px',
                                        background: 'rgba(0, 212, 255, 0.05)',
                                        color: 'primary.main',
                                        border: '1px solid rgba(0, 212, 255, 0.15)',
                                        fontFamily: 'Space Grotesk',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': { color: 'inherit' }
                                    }}
                                />
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Details Modal */}
            <Modal
                open={openDetails}
                onClose={() => setOpenDetails(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500, sx: { backdropFilter: 'blur(8px)' } }}
            >
                <Fade in={openDetails}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', md: '900px' },
                        bgcolor: '#050505',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        boxShadow: '0 0 100px rgba(0, 212, 255, 0.15)',
                        p: 0,
                        borderRadius: 4,
                        outline: 'none',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <Box sx={{ position: 'relative', height: { xs: '300px', md: '500px' }, bgcolor: '#000' }}>
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); setOpenDetails(false); }}
                                sx={{ position: 'absolute', top: 15, right: 15, zIndex: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.6)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                            >
                                <CloseIcon />
                            </IconButton>

                            {project.images && project.images.length > 0 ? (
                                <>
                                    <AnimatePresence mode='wait'>
                                        <motion.img
                                            key={currentImageIndex}
                                            src={project.images[currentImageIndex]}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    </AnimatePresence>
                                    {project.images.length > 1 && (
                                        <>
                                            <IconButton
                                                onClick={handlePrevImage}
                                                sx={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.4)', p: 2 }}
                                            >
                                                <ArrowBackIosNewIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={handleNextImage}
                                                sx={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.4)', p: 2 }}
                                            >
                                                <ArrowForwardIosIcon />
                                            </IconButton>
                                            <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
                                                {project.images.map((_, i) => (
                                                    <Box
                                                        key={i}
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: i === currentImageIndex ? 'primary.main' : 'rgba(255,255,255,0.3)',
                                                            transition: '0.3s'
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </>
                            ) : (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #1a1a2e 0%, #000 100%)' }}>
                                    <Typography variant="h3" sx={{ color: 'rgba(255,255,255,0.05)', fontWeight: 900, letterSpacing: 10 }}>OFFLINE</Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ p: { xs: 3, md: 5 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 3, fontWeight: 700 }}>
                                    DECRYPTED LOG: {project.id}
                                </Typography>
                            </Box>
                            <Typography variant="h2" sx={{ mb: 3, fontWeight: 800, fontFamily: 'Space Grotesk', fontSize: { xs: '2rem', md: '3rem' } }}>
                                {project.title}
                            </Typography>

                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, mb: 5, whiteSpace: 'pre-line', fontSize: '1.1rem' }}>
                                {project.details || project.description}
                            </Typography>

                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h6" sx={{ mb: 3, fontFamily: 'Space Grotesk', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Terminal size={20} color="#00D4FF" /> MISSION TECH STACK
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                    {project.tags.map(tag => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            icon={getIconForTag(tag)}
                                            variant="outlined"
                                            sx={{
                                                px: 1,
                                                color: 'white',
                                                borderColor: 'rgba(0, 212, 255, 0.3)',
                                                bgcolor: 'rgba(0, 212, 255, 0.05)',
                                                '& .MuiChip-icon': { color: 'primary.main' }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() => setOpenDetails(false)}
                                sx={{
                                    py: 2,
                                    fontSize: '1.1rem',
                                    background: 'linear-gradient(45deg, #00D4FF 0%, #00A3C2 100%)',
                                    color: 'black'
                                }}
                            >
                                Close Mission Log
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {/* Edit Dialog - DEV ONLY */}
            <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Space Grotesk', bgcolor: 'rgba(0, 212, 255, 0.1)', color: 'primary.main' }}>
                    Mission Configuration Terminal (DEV MODE)
                </DialogTitle>
                <DialogContent sx={{ pt: 3, bgcolor: '#050505' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Mission ID"
                                fullWidth
                                value={editedProject.id}
                                onChange={(e) => setEditedProject({ ...editedProject, id: e.target.value })}
                            />
                            <TextField
                                label="Mission Title"
                                fullWidth
                                value={editedProject.title}
                                onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                            />
                        </Box>
                        <TextField
                            label="Briefing (Card Description)"
                            fullWidth
                            multiline
                            rows={2}
                            value={editedProject.description}
                            onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                        />
                        <TextField
                            label="Full Mission Report (Modal Content)"
                            fullWidth
                            multiline
                            rows={8}
                            value={editedProject.details || ''}
                            onChange={(e) => setEditedProject({ ...editedProject, details: e.target.value })}
                        />
                        <TextField
                            label="Tech Stack (comma separated)"
                            fullWidth
                            value={editedProject.tags.join(', ')}
                            onChange={(e) => setEditedProject({ ...editedProject, tags: e.target.value.split(',').map(s => s.trim()) })}
                        />

                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Visual Assets (Carousel)</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                {editedProject.images?.map((img, idx) => (
                                    <Box key={idx} sx={{ position: 'relative', width: 100, height: 100 }}>
                                        <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeImage(idx)}
                                            sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ width: 100, height: 100, borderStyle: 'dashed' }}
                                >
                                    Add
                                    <input type="file" hidden accept="image/*" multiple onChange={handleFileUpload} />
                                </Button>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Images are saved to LocalStorage as Base64. For production, move files to /public/assets/projects/.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#050505' }}>
                    <Button onClick={() => setIsEditing(false)} color="inherit" sx={{ border: '1px solid rgba(255,255,255,0.2)' }}>Abort Mission</Button>
                    <Button onClick={handleSave} variant="contained" color="primary" sx={{ px: 4 }}>Commit Changes</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProjectCard;
