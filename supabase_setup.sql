-- ============================================================
-- Esquema para "The Anomaly Index" (blog-anomalies)
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- Extensión para gen_random_uuid() (normalmente ya activa en Supabase)
create extension if not exists pgcrypto;

-- ---------- Tabla: blogs ----------
create table if not exists public.blogs (
    id             uuid primary key default gen_random_uuid(),
    title          text not null default '',
    title_en       text not null default '',
    summary        text not null default '',
    summary_en     text not null default '',
    content        text not null default '',
    content_en     text not null default '',
    main_image     text not null default '',
    gallery_images text[] not null default '{}',
    tags           text[] not null default '{}',
    author         text not null default '',
    views          integer not null default 0,
    created_at     timestamptz not null default now()
);

-- ---------- Tabla: blog_comments ----------
create table if not exists public.blog_comments (
    id         uuid primary key default gen_random_uuid(),
    post_id    uuid not null references public.blogs(id) on delete cascade,
    username   text not null default '',
    content    text not null default '',
    created_at timestamptz not null default now()
);

create index if not exists blog_comments_post_id_idx on public.blog_comments(post_id);

-- ============================================================
-- RLS / Políticas
-- NOTA: esta app NO usa Supabase Auth. El login de /admin es una
-- comprobación en el cliente (VITE_ADMIN_*), y TODAS las escrituras
-- van con la anon key. Por eso las políticas permiten acceso público.
-- Es el diseño actual de la app; no es seguro para datos sensibles.
-- ============================================================

alter table public.blogs enable row level security;
alter table public.blog_comments enable row level security;

-- blogs: lectura y escritura pública (anon)
drop policy if exists "blogs public read"   on public.blogs;
drop policy if exists "blogs public write"  on public.blogs;
create policy "blogs public read"  on public.blogs for select using (true);
create policy "blogs public write" on public.blogs for all    using (true) with check (true);

-- blog_comments: lectura y escritura pública (anon)
drop policy if exists "comments public read"  on public.blog_comments;
drop policy if exists "comments public write" on public.blog_comments;
create policy "comments public read"  on public.blog_comments for select using (true);
create policy "comments public write" on public.blog_comments for all    using (true) with check (true);

-- ============================================================
-- Storage: bucket público 'blog-images'
-- ============================================================
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- Políticas de storage para el bucket blog-images
drop policy if exists "blog-images public read"   on storage.objects;
drop policy if exists "blog-images public upload"  on storage.objects;
drop policy if exists "blog-images public update"  on storage.objects;
drop policy if exists "blog-images public delete"  on storage.objects;

create policy "blog-images public read"
    on storage.objects for select
    using (bucket_id = 'blog-images');

create policy "blog-images public upload"
    on storage.objects for insert
    with check (bucket_id = 'blog-images');

create policy "blog-images public update"
    on storage.objects for update
    using (bucket_id = 'blog-images');

create policy "blog-images public delete"
    on storage.objects for delete
    using (bucket_id = 'blog-images');
