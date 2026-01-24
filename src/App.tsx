import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Background from './components/Background';
import Blog from './pages/Blog';
import Admin from './pages/Admin';
import BlogPostPage from './components/BlogPostPage';

function App() {
    return (
        <BrowserRouter>
            <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#050505' }}>
                <Background />

                <Routes>
                    <Route path="/" element={<Blog />} />
                    <Route path="/:id" element={<BlogPostPage />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </Box>
        </BrowserRouter>
    );
}

export default App;
