-- Blog posts (LinkedIn-style)
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  link text,
  image_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Projects (extended)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  tags text[] not null default '{}',
  link text,
  image_url text,
  video_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Events & Workshops
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date,
  venue text,
  image_url text,
  link text,
  created_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;
alter table public.projects enable row level security;
alter table public.events enable row level security;

-- Public read, public write (portfolio owner-managed; no auth set up yet)
create policy "Public read blog" on public.blog_posts for select using (true);
create policy "Public write blog" on public.blog_posts for insert with check (true);
create policy "Public update blog" on public.blog_posts for update using (true);
create policy "Public delete blog" on public.blog_posts for delete using (true);

create policy "Public read projects" on public.projects for select using (true);
create policy "Public write projects" on public.projects for insert with check (true);
create policy "Public update projects" on public.projects for update using (true);
create policy "Public delete projects" on public.projects for delete using (true);

create policy "Public read events" on public.events for select using (true);
create policy "Public write events" on public.events for insert with check (true);
create policy "Public update events" on public.events for update using (true);
create policy "Public delete events" on public.events for delete using (true);

-- Storage bucket for media
insert into storage.buckets (id, name, public) values ('portfolio-media', 'portfolio-media', true);

create policy "Public read portfolio media" on storage.objects for select using (bucket_id = 'portfolio-media');
create policy "Public upload portfolio media" on storage.objects for insert with check (bucket_id = 'portfolio-media');
create policy "Public update portfolio media" on storage.objects for update using (bucket_id = 'portfolio-media');
create policy "Public delete portfolio media" on storage.objects for delete using (bucket_id = 'portfolio-media');

-- Seed initial projects
insert into public.projects (title, description, tags, link, display_order) values
  ('HR Agent', 'End-to-end AI recruitment system using CrewAI with multi-agent reasoning, automated email, calendar scheduling, and AI-led interviews.', ARRAY['CrewAI','Gmail API','Google Calendar','Multi-Agent'], null, 1),
  ('Resume Optimization Agent', 'LLM-based scoring and feedback engine for ATS compliance using Hugging Face and OpenAI models with structured evaluation.', ARRAY['Hugging Face','OpenAI','ATS Scoring'], null, 2),
  ('RAG Assistant', 'Retrieval-augmented generation system for intelligent document querying and knowledge extraction.', ARRAY['RAG','LangChain','Vector DB'], null, 3),
  ('Crayon Cafe — Comic App', 'Interactive comic experience for cafes with active users. Built for in-cafe entertainment with a playful, illustrated UI.', ARRAY['React','UX','Live Users'], 'https://crayoncafe-bv0p7qd4p-kusumonika033gmailcoms-projects.vercel.app', 4),
  ('RestaBot — FlavorAI', 'AI-driven restaurant management platform with dual chatbots (customer + manager). Real-time SSE streaming, multi-agent orchestration with Agno, dynamic cart, reservations, and a manager analytics dashboard with matplotlib charts.', ARRAY['FastAPI','Agno','GPT-4','MongoDB','React','SSE'], null, 5),
  ('Nirvana — Personal Glow-up', 'Daily habit + goal tracker with AI day-analysis, LLM wiki about you, and OpenClaw integration: day summary, task plan, next-day prep, email triage and draft replies.', ARRAY['LLM','Habits','Email Agent','OpenClaw'], 'https://daily-glow-up-44.lovable.app/habits', 6);