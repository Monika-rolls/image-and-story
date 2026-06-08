
DROP POLICY IF EXISTS "Admins insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins delete projects" ON public.projects;
CREATE POLICY "Admins insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins insert blog" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins update blog" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins delete blog" ON public.blog_posts;
CREATE POLICY "Admins insert blog" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update blog" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete blog" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins insert events" ON public.events;
DROP POLICY IF EXISTS "Admins update events" ON public.events;
DROP POLICY IF EXISTS "Admins delete events" ON public.events;
CREATE POLICY "Admins insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update events" ON public.events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete events" ON public.events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Public upload portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Public update portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Public delete portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admins update portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete portfolio media" ON storage.objects;
CREATE POLICY "Admins upload portfolio media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update portfolio media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete portfolio media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));
