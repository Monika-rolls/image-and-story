import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProjectCard, { Project } from "./ProjectCard";

const ProjectsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const headingY = useTransform(scrollYProgress, [0, 1], [50, -30]);
  const blobY = useTransform(scrollYProgress, [0, 1], [50, -120]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    tags: "",
    link: "",
  });

  const load = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    else setProjects((data as unknown as Project[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description required");
      return;
    }
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("projects").insert({
      title: form.title.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim(),
      tags,
      link: form.link.trim() || null,
      display_order: projects.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Project added — click the pencil to add details & media");
      setForm({ title: "", tagline: "", description: "", tags: "", link: "" });
      setShowForm(false);
      load();
    }
  };

  return (
    <section id="projects" className="relative py-24 overflow-hidden" ref={ref}>
      <motion.div
        style={{ y: blobY }}
        className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-primary/4 blur-3xl pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div style={{ y: headingY }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// PROJECTS</h2>
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Output Layers
            </h3>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-heading text-sm hover:bg-primary/20 transition-all mb-8"
            >
              <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add project"}
            </button>
          </motion.div>
        </motion.div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={submit}
            className="mb-10 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm grid md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              maxLength={200}
              placeholder="Project title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="md:col-span-2 px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none"
            />
            <input
              type="text"
              maxLength={200}
              placeholder="Short tagline (one line, shown on back)"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="md:col-span-2 px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none"
            />
            <textarea
              maxLength={2000}
              rows={4}
              placeholder="Full description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="md:col-span-2 px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none resize-none"
            />
            <input
              type="text"
              maxLength={500}
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none"
            />
            <input
              type="url"
              maxLength={500}
              placeholder="App URL (optional)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none"
            />
            <p className="md:col-span-2 font-body text-xs text-muted-foreground">
              After saving, click the pencil icon on the card to upload images / video and add
              problem, solution, features, and tech stack.
            </p>
            <button
              type="submit"
              className="md:col-span-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading text-sm hover:bg-primary/90 transition-all"
            >
              Save project
            </button>
          </motion.form>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              isInView={isInView}
              onChanged={load}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
