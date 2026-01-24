import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BlogPost = {
    id: string;
    title: string;
    title_en: string;
    summary: string;
    summary_en: string;
    content: string;
    content_en: string;
    main_image: string;
    gallery_images?: string[]; // URLs de imágenes para la galería estilo true crime
    tags: string[];
    author: string;
    created_at: string;
};

export type BlogComment = {
    id: string;
    post_id: string;
    username: string;
    content: string;
    created_at: string;
};
