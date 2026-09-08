import { createTheme } from '@mui/material/styles';

// ============================================================
// RETRO-UFO / ATOMIC-AGE THEME
// Amber beam + turquoise glow over deep-space black, CRT vibe.
// Shared color tokens (kept in sync with CSS vars in index.css).
// ============================================================
export const ufo = {
    bg: '#0A0C13',
    bg2: '#10141F',
    panel: 'rgba(17, 21, 32, 0.72)',
    amber: '#FFB627',        // primary beam
    amberDim: '#C98A1E',
    teal: '#35E0D0',         // secondary glow
    tealDim: '#1FA99B',
    coral: '#FF5D5D',        // danger / delete
    cream: '#EDE4CF',        // primary text
    muted: 'rgba(237, 228, 207, 0.60)',
    line: 'rgba(255, 182, 39, 0.20)',
    lineTeal: 'rgba(53, 224, 208, 0.25)',
};

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: ufo.amber, light: '#FFD37A', dark: ufo.amberDim },
        secondary: { main: ufo.teal, dark: ufo.tealDim },
        error: { main: ufo.coral },
        background: { default: ufo.bg, paper: ufo.bg2 },
        text: { primary: ufo.cream, secondary: ufo.muted },
    },
    typography: {
        fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontFamily: '"Audiowide", sans-serif', letterSpacing: '0.02em' },
        h2: { fontFamily: '"Audiowide", sans-serif', letterSpacing: '0.02em' },
        h3: { fontFamily: '"Audiowide", sans-serif', letterSpacing: '0.02em' },
        h4: { fontFamily: '"Audiowide", sans-serif' },
        h5: { fontFamily: '"Audiowide", sans-serif' },
        h6: { fontFamily: '"Audiowide", sans-serif' },
        button: { textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', fontFamily: '"Space Mono", monospace' },
        overline: { fontFamily: '"Space Mono", monospace', letterSpacing: '0.18em' },
    },
    shape: { borderRadius: 4 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: ufo.bg },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 2,
                    padding: '9px 22px',
                    transition: 'all 0.25s ease',
                },
                containedPrimary: {
                    color: '#0A0C13',
                    boxShadow: '0 0 18px rgba(255,182,39,0.35)',
                    '&:hover': { boxShadow: '0 0 26px rgba(255,182,39,0.55)', transform: 'translateY(-1px)' },
                },
                outlined: {
                    borderColor: ufo.line,
                    '&:hover': { borderColor: ufo.amber, background: 'rgba(255,182,39,0.06)' },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: ufo.panel,
                    backdropFilter: 'blur(14px)',
                    border: `1px solid ${ufo.line}`,
                    borderRadius: 6,
                },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined' },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    fontFamily: '"Rajdhani", sans-serif',
                    '& fieldset': { borderColor: 'rgba(237,228,207,0.18)' },
                    '&:hover fieldset': { borderColor: ufo.lineTeal },
                    '&.Mui-focused fieldset': { borderColor: ufo.amber, boxShadow: '0 0 0 1px rgba(255,182,39,0.3)' },
                },
                input: { fontSize: '1.05rem' },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: { fontFamily: '"Space Mono", monospace', fontSize: '0.85rem', letterSpacing: '0.05em' },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontFamily: '"Space Mono", monospace', letterSpacing: '0.05em' },
            },
        },
    },
});

export default theme;
