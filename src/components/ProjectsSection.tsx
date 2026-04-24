import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ExternalLink, Bot, Plus, Trash2, Pencil, Image as ImageIcon, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MediaUpload from "./MediaUpload";

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string | null;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
}

const FlipCard = ({ project, index, isInView, onChanged }: { project: Project; index: number; isInView: boolean; onChanged: () => void }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [editing, setEditing] = useState(false);

  const remove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${project.title}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      onChanged();
    }
  };

  const updateMedia = async (field: "image_url" | "video_url", url: string) => {
    const { error } = await supabase.from("projects").update({ [field]: url }).eq("id", project.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Media updated");
      onChanged();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90 }}
      animate={isInView ? { opacity: 1, rotateY: 0 } : {}}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.7, type: "spring", stiffness: 80 }}
      className="h-80 cursor-pointer relative group/card"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        onClick={() => !editing && setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl border border-border bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden hover:border-primary/40 transition-all"
          style={{ backfaceVisibility: "hidden" }}
        >
          {project.image_url ? (
            <div className="relative h-32 overflow-hidden">
              <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
              <Bot className="w-10 h-10 text-primary/50" />
            </div>
          )}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-2">{project.title}</h4>
              <span className="font-body text-[10px] text-muted-foreground tracking-wider">CLICK TO FLIP →</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-heading tracking-wider border border-primary/15 text-primary/70 bg-primary/5">
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-heading text-muted-foreground">+{project.tags.length - 3}</span>
              )}
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 p-5 rounded-xl border border-primary/30 bg-card/90 backdrop-blur-md flex flex-col justify-between glow-box overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="overflow-y-auto flex-1">
            <h4 className="font-heading text-base font-semibold text-foreground mb-2">{project.title}</h4>
            <p className="font-body text-xs text-foreground/90 leading-relaxed mb-3">{project.description}</p>
            {project.video_url && (
              <video src={project.video_url} controls className="w-full rounded mb-2" onClick={(e) => e.stopPropagation()} />
            )}
          </div>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-primary font-heading text-xs tracking-wider hover:gap-3 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Project
            </a>
          )}
        </div>
      </motion.div>

      {/* Admin controls */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
        <button onClick={(e) => { e.stopPropagation(); setEditing(!editing); }} className="p-1.5 rounded bg-background/80 backdrop-blur text-muted-foreground hover:text-primary" aria-label="Edit media">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={remove} className="p-1.5 rounded bg-background/80 backdrop-blur text-muted-foreground hover:text-destructive" aria-label="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {editing && (
        <div className="absolute -bottom-2 left-0 right-0 translate-y-full p-3 rounded-lg bg-card border border-primary/30 z-20 flex flex-col gap-2 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <MediaUpload folder={`projects/${project.id}`} accept="image/*" onUploaded={(url) => updateMedia("image_url", url)} label="Upload image" />
          </div>
          <div className="flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-primary" />
            <MediaUpload folder={`projects/${project.id}`} accept="video/*" onUploaded={(url) => updateMedia("video_url", url)} label="Upload video" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ProjectsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const headingY = useTransform(scrollYProgress, [0, 1], [50, -30]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "", link: "" });

  const load = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    else setProjects((data as Project[]) || []);
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
      description: form.description.trim(),
      tags,
      link: form.link.trim() || null,
      display_order: projects.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Project added");
      setForm({ title: "", description: "", tags: "", link: "" });
      setShowForm(false);
      load();
    }
  };

  return (
    <section id="projects" className="relative py-24 overflow-hidden" ref={ref}>
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [50, -120]) }}
        className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-primary/4 blur-3xl pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div style={{ y: headingY }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
            <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// PROJECTS</h2>
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Output Layers</h3>
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
            <input type="text" maxLength={200} placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none" />
            <textarea maxLength={2000} rows={4} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none resize-none" />
            <input type="text" maxLength={500} placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none" />
            <input type="url" maxLength={500} placeholder="Project URL (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none" />
            <p className="md:col-span-2 font-body text-xs text-muted-foreground">Save the project, then hover the card to upload an image or video.</p>
            <button type="submit" className="md:col-span-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading text-sm hover:bg-primary/90 transition-all">
              Save project
            </button>
          </motion.form>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <FlipCard key={project.id} project={project} index={i} isInView={isInView} onChanged={load} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
