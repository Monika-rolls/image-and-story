import { motion } from "framer-motion";
import { useState } from "react";
import {
  ExternalLink,
  Bot,
  Trash2,
  Pencil,
  Image as ImageIcon,
  Video,
  ChevronDown,
  X,
  Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MediaUpload from "./MediaUpload";

export interface ProjectDetails {
  problem?: string;
  solution?: string;
  features?: string[];
  techStack?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tagline: string | null;
  tags: string[];
  link: string | null;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  details: ProjectDetails | null;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  isInView: boolean;
  onChanged: () => void;
}

const ProjectCard = ({ project, index, isInView, onChanged }: ProjectCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [form, setForm] = useState({
    title: project.title,
    tagline: project.tagline || "",
    description: project.description,
    link: project.link || "",
    tags: project.tags.join(", "),
    problem: project.details?.problem || "",
    solution: project.details?.solution || "",
    features: (project.details?.features || []).join("\n"),
    techStack: (project.details?.techStack || []).join(", "),
  });

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
    const update: { image_url?: string; video_url?: string } = { [field]: url };
    const { error } = await supabase.from("projects").update(update).eq("id", project.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Media updated");
      onChanged();
    }
  };

  const saveEdits = async () => {
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const features = form.features.split("\n").map((f) => f.trim()).filter(Boolean);
    const techStack = form.techStack.split(",").map((t) => t.trim()).filter(Boolean);

    const { error } = await supabase
      .from("projects")
      .update({
        title: form.title.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim(),
        link: form.link.trim() || null,
        tags,
        details: {
          problem: form.problem.trim(),
          solution: form.solution.trim(),
          features,
          techStack,
        },
      })
      .eq("id", project.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Project updated");
      setEditing(false);
      onChanged();
    }
  };

  const hasDetails =
    project.details &&
    (project.details.problem ||
      project.details.solution ||
      (project.details.features && project.details.features.length > 0) ||
      (project.details.techStack && project.details.techStack.length > 0));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, rotateY: -90 }}
        animate={isInView ? { opacity: 1, rotateY: 0 } : {}}
        transition={{ delay: 0.1 + index * 0.1, duration: 0.7, type: "spring", stiffness: 80 }}
        className="h-96 cursor-pointer relative group/card"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-xl border border-border bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden hover:border-primary/40 transition-all"
            style={{ backfaceVisibility: "hidden" }}
          >
            {project.image_url ? (
              <div className="relative h-36 overflow-hidden">
                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              </div>
            ) : (
              <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary/50" />
              </div>
            )}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <h4 className="font-heading text-lg font-semibold text-foreground mb-1 line-clamp-2">
                  {project.title}
                </h4>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-primary text-[11px] font-heading tracking-wider hover:underline truncate max-w-full"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{project.link.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-heading tracking-wider border border-primary/15 text-primary/70 bg-primary/5"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 4 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-heading text-muted-foreground">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>
                <span className="font-body text-[10px] text-muted-foreground tracking-wider">
                  CLICK TO FLIP →
                </span>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 p-5 rounded-xl border border-primary/30 bg-card/90 backdrop-blur-md flex flex-col glow-box overflow-hidden"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="overflow-y-auto flex-1 pr-1">
              <h4 className="font-heading text-base font-semibold text-foreground mb-2">
                {project.title}
              </h4>
              {project.tagline && (
                <p className="font-body text-xs text-foreground/90 leading-relaxed mb-3 italic">
                  “{project.tagline}”
                </p>
              )}
              {project.video_url && (
                <video
                  src={project.video_url}
                  controls
                  className="w-full rounded mb-3"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className="flex flex-wrap gap-2 items-center">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-primary font-heading text-xs tracking-wider hover:gap-2 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open app
                  </a>
                )}
                {hasDetails && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-primary/30 bg-primary/5 text-primary font-heading text-[11px] tracking-wider hover:bg-primary/10 transition-all"
                  >
                    <ChevronDown className="w-3 h-3" />
                    Show more
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin controls — visible buttons (no longer hover-only) */}
        <div
          className="absolute top-2 right-2 flex gap-1 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="p-1.5 rounded bg-background/90 backdrop-blur border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            aria-label="Edit project"
            title="Edit project"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={remove}
            className="p-1.5 rounded bg-background/90 backdrop-blur border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
            aria-label="Delete project"
            title="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Show-more modal */}
      {showDetails && hasDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-xl border border-primary/30 bg-card p-6 glow-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-3 right-3 p-1.5 rounded text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-1">{project.title}</h3>
            {project.tagline && (
              <p className="font-body text-sm text-muted-foreground mb-5">{project.tagline}</p>
            )}

            {project.details?.problem && (
              <DetailBlock label="Problem">{project.details.problem}</DetailBlock>
            )}
            {project.details?.solution && (
              <DetailBlock label="Solution">{project.details.solution}</DetailBlock>
            )}
            {project.details?.features && project.details.features.length > 0 && (
              <div className="mb-5">
                <h5 className="font-display text-xs tracking-[0.25em] text-primary mb-2">
                  // FEATURES
                </h5>
                <ul className="space-y-1.5">
                  {project.details.features.map((f, i) => (
                    <li key={i} className="font-body text-sm text-foreground/90 flex gap-2">
                      <span className="text-primary">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.details?.techStack && project.details.techStack.length > 0 && (
              <div className="mb-5">
                <h5 className="font-display text-xs tracking-[0.25em] text-primary mb-2">
                  // TECH STACK
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {project.details.techStack.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded text-[11px] font-heading tracking-wider border border-primary/20 text-primary bg-primary/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading text-sm hover:bg-primary/90 transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Open app
              </a>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setEditing(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-primary/30 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditing(false)}
              className="absolute top-3 right-3 p-1.5 rounded text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-heading text-xl font-bold text-foreground mb-4">Edit project</h3>

            <div className="grid gap-3">
              <Field label="Title">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Tagline (short note shown on back)">
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Full description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputCls + " resize-none"}
                />
              </Field>
              <Field label="App URL">
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Tags (comma separated)">
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Problem">
                <textarea
                  rows={2}
                  value={form.problem}
                  onChange={(e) => setForm({ ...form, problem: e.target.value })}
                  className={inputCls + " resize-none"}
                />
              </Field>
              <Field label="Solution">
                <textarea
                  rows={2}
                  value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  className={inputCls + " resize-none"}
                />
              </Field>
              <Field label="Features (one per line)">
                <textarea
                  rows={4}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className={inputCls + " resize-none"}
                />
              </Field>
              <Field label="Tech stack (comma separated)">
                <input
                  type="text"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <p className="font-display text-[10px] tracking-[0.25em] text-primary mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3" /> COVER IMAGE
                  </p>
                  <MediaUpload
                    folder={`projects/${project.id}`}
                    accept="image/*"
                    onUploaded={(url) => updateMedia("image_url", url)}
                    label="Upload image"
                  />
                  {project.image_url && (
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                      Current: {project.image_url.split("/").pop()}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-display text-[10px] tracking-[0.25em] text-primary mb-2 flex items-center gap-1.5">
                    <Video className="w-3 h-3" /> DEMO VIDEO
                  </p>
                  <MediaUpload
                    folder={`projects/${project.id}`}
                    accept="video/*"
                    onUploaded={(url) => updateMedia("video_url", url)}
                    label="Upload video"
                  />
                  {project.video_url && (
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                      Current: {project.video_url.split("/").pop()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={saveEdits}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading text-sm hover:bg-primary/90 transition-all"
                >
                  <Save className="w-4 h-4" /> Save changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-md border border-border text-foreground font-heading text-sm hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const inputCls =
  "w-full px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="font-display text-[10px] tracking-[0.25em] text-muted-foreground mb-1 block">
      {label.toUpperCase()}
    </span>
    {children}
  </label>
);

const DetailBlock = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <h5 className="font-display text-xs tracking-[0.25em] text-primary mb-2">// {label.toUpperCase()}</h5>
    <p className="font-body text-sm text-foreground/90 leading-relaxed">{children}</p>
  </div>
);

export default ProjectCard;
