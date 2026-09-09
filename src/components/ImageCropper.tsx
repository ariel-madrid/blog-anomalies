import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Box, Dialog, DialogContent, Typography, Button, Slider, IconButton } from '@mui/material';
import { Crop, ZoomIn, RotateCw, X, Check } from 'lucide-react';
import { ufo } from '../theme';

const mono = { fontFamily: '"Space Mono", monospace', letterSpacing: '0.1em' };

interface Area { x: number; y: number; width: number; height: number; }

// Produce a cropped JPEG blob from the source image + crop area (in pixels)
async function getCroppedBlob(src: string, area: Area, rotation = 0): Promise<Blob> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

    const rad = (rotation * Math.PI) / 180;
    // Bounding box big enough to hold the rotated image
    const bBoxW = Math.abs(Math.cos(rad) * image.width) + Math.abs(Math.sin(rad) * image.height);
    const bBoxH = Math.abs(Math.sin(rad) * image.width) + Math.abs(Math.cos(rad) * image.height);

    const canvas = document.createElement('canvas');
    canvas.width = bBoxW;
    canvas.height = bBoxH;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(bBoxW / 2, bBoxH / 2);
    ctx.rotate(rad);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    const data = ctx.getImageData(0, 0, bBoxW, bBoxH);

    canvas.width = Math.round(area.width);
    canvas.height = Math.round(area.height);
    ctx.putImageData(
        data,
        Math.round(-bBoxW / 2 + image.width / 2 - area.x),
        Math.round(-bBoxH / 2 + image.height / 2 - area.y),
    );

    return new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92));
}

interface Props {
    open: boolean;
    src: string | null;
    aspect: number;         // e.g. 16/9 for cover, 3/4 for gallery
    label?: string;
    onCancel: () => void;
    onCropped: (blob: Blob) => void | Promise<void>;
}

const ImageCropper: React.FC<Props> = ({ open, src, aspect, label = 'Encuadra la imagen', onCancel, onCropped }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [areaPixels, setAreaPixels] = useState<Area | null>(null);
    const [working, setWorking] = useState(false);

    const onComplete = useCallback((_: Area, pixels: Area) => setAreaPixels(pixels), []);

    const reset = () => { setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); setAreaPixels(null); };

    const apply = async () => {
        if (!src || !areaPixels) return;
        setWorking(true);
        try {
            const blob = await getCroppedBlob(src, areaPixels, rotation);
            await onCropped(blob);
            reset();
        } catch (e) {
            console.error('crop error', e);
            alert('No se pudo recortar la imagen.');
        } finally {
            setWorking(false);
        }
    };

    const handleCancel = () => { reset(); onCancel(); };

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth
            PaperProps={{ sx: { bgcolor: ufo.bg2, backgroundImage: 'none', border: `1px solid ${ufo.line}` } }}>
            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${ufo.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Crop size={20} color={ufo.amber} />
                    <Typography sx={{ color: ufo.amber, fontFamily: '"Audiowide", sans-serif', fontSize: '1rem' }}>{label}</Typography>
                </Box>
                <IconButton onClick={handleCancel} sx={{ color: ufo.muted }}><X size={20} /></IconButton>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ position: 'relative', width: '100%', height: 360, bgcolor: '#000' }}>
                    {src && (
                        <Cropper
                            image={src}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onComplete}
                            showGrid
                        />
                    )}
                </Box>

                <Box sx={{ p: 3 }}>
                    <Typography sx={{ ...mono, color: ufo.teal, fontSize: '0.62rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ZoomIn size={14} /> ZOOM
                    </Typography>
                    <Slider value={zoom} min={1} max={4} step={0.01} onChange={(_, v) => setZoom(v as number)}
                        sx={{ color: ufo.amber, mb: 2 }} />

                    <Typography sx={{ ...mono, color: ufo.teal, fontSize: '0.62rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RotateCw size={14} /> ROTACIÓN
                    </Typography>
                    <Slider value={rotation} min={0} max={360} step={1} onChange={(_, v) => setRotation(v as number)}
                        sx={{ color: ufo.teal }} />

                    <Typography sx={{ color: ufo.muted, fontSize: '0.8rem', mt: 1 }}>
                        Arrastra para mover · pellizca o usa el slider para acercar.
                    </Typography>
                </Box>
            </DialogContent>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${ufo.line}`, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: ufo.bg }}>
                <Button onClick={handleCancel} sx={{ color: ufo.muted }}>Cancelar</Button>
                <Button variant="contained" startIcon={<Check size={18} />} onClick={apply} disabled={working || !areaPixels}>
                    {working ? 'Recortando...' : 'Aplicar recorte'}
                </Button>
            </Box>
        </Dialog>
    );
};

export default ImageCropper;
