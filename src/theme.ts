import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00D4FF', // Electric Blue
            light: '#70E1FF',
            dark: '#00A3C2',
        },
        secondary: {
            main: '#FF4D00', // Rocket Orange
        },
        background: {
            default: '#050505',
            paper: 'rgba(20, 20, 20, 0.7)',
        },
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
    },
    typography: {
        fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0, 212, 255, 0.3)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                },
            },
        },
    },
});

export default theme;
