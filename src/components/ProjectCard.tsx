import { useState } from "react";
import { ArrowUpRight, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MediaUpload from "./MediaUpload";
import { Field, Modal, Stack, btnPrimary, btnSecondary, fieldCls } from "./site/ui";

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
  editable: boolean;
  onChanged: () => void;
}

const ProjectCard = ({ project, editable, onChanged }: ProjectCardProps) => {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);

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

  const remove = async () => {
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
    const split = (s: string, sep: string | RegExp) => s.split(sep).map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase
      .from("projects")
      .update({
        title: form.title.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim(),
        link: form.link.trim() || null,
        tags: split(form.tags, ","),
        details: {
          problem: form.problem.trim(),
          solution: form.solution.trim(),
          features: split(form.features, "\n"),
          techStack: split(form.techStack, ","),
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

  const d = project.details;
  const stack = d?.techStack?.length ? d.techStack : project.tags;

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-150 hover:border-foreground/20">
        <button onClick={() => setOpen(true)} className="flex flex-1 flex-col text-left" aria-label={`Open details for ${project.title}`}>
          {project.image_url && (
            <img src={project.image_url} alt="" loading="lazy" className="aspect-[16/10] w-full border-b border-border bg-secondary object-cover" />
          )}
          <div className="flex flex-1 flex-col gap-3 p-5">
            <h3 className="text-[17px] font-medium leading-snug">{project.title}</h3>
            <p className="line-clamp-3 text-[14.5px] leading-relaxed text-muted-foreground">{project.tagline || project.description}</p>
            <Stack items={project.tags.slice(0, 4)} />
          </div>
        </button>

        {editable && (
          <div className="absolute right-2 top-2 flex gap-1">
            <button onClick={() => setEditing(true)} className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground" aria-label="Edit project">
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button onClick={remove} className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete project">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </article>

      {open && (
        <Modal onClose={() => setOpen(false)} wide>
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <h3 className="pr-8 text-[24px] font-medium tracking-[-0.01em]">{project.title}</h3>
          {project.tagline && <p className="mt-2 text-[15px] text-muted-foreground">{project.tagline}</p>}

          {project.video_url ? (
            <video src={project.video_url} controls playsInline preload="metadata" className="mt-6 w-full rounded-xl border border-border bg-secondary" />
          ) : (
            project.image_url && <img src={project.image_url} alt="" className="mt-6 w-full rounded-xl border border-border" />
          )}

          <div className="mt-6 flex flex-col gap-5 text-[15px] leading-relaxed">
            {d?.problem ? <Detail label="Problem">{d.problem}</Detail> : <p className="text-muted-foreground">{project.description}</p>}
            {d?.solution && <Detail label="Solution">{d.solution}</Detail>}
            {d?.features && d.features.length > 0 && (
              <div>
                <h4 className="mb-2 text-[13px] text-subtle">What it does</h4>
                <ul className="flex flex-col gap-1.5">
                  {d.features.map((f) => (
                    <li key={f} className="relative pl-4 text-muted-foreground">
                      <span className="absolute left-0 top-[0.75em] h-px w-2 bg-subtle" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Stack items={stack} />
          </div>

          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} mt-7`}>
              Open the app <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </a>
          )}
        </Modal>
      )}

      {editing && (
        <Modal onClose={() => setEditing(false)} wide>
          <h3 className="mb-5 text-[20px] font-medium">Edit project</h3>
          <div className="grid gap-4">
            <Field label="Title">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldCls} />
            </Field>
            <Field label="Tagline (one line, shown on the card)">
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={fieldCls} />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${fieldCls} resize-none`} />
            </Field>
            <Field label="App URL">
              <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={fieldCls} />
            </Field>
            <Field label="Tags (comma separated)">
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={fieldCls} />
            </Field>
            <Field label="Problem">
              <textarea rows={2} value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} className={`${fieldCls} resize-none`} />
            </Field>
            <Field label="Solution">
              <textarea rows={2} value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} className={`${fieldCls} resize-none`} />
            </Field>
            <Field label="Features (one per line)">
              <textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className={`${fieldCls} resize-none`} />
            </Field>
            <Field label="Tech stack (comma separated)">
              <input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} className={fieldCls} />
            </Field>
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[13px] text-muted-foreground">Cover image</p>
                <MediaUpload folder={`projects/${project.id}`} accept="image/*" onUploaded={(url) => updateMedia("image_url", url)} label="Upload image" />
              </div>
              <div>
                <p className="mb-2 text-[13px] text-muted-foreground">Demo video</p>
                <MediaUpload folder={`projects/${project.id}`} accept="video/*" onUploaded={(url) => updateMedia("video_url", url)} label="Upload video" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveEdits} className={btnPrimary}>
                Save changes
              </button>
              <button onClick={() => setEditing(false)} className={btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

const Detail = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <h4 className="mb-1.5 text-[13px] text-subtle">{label}</h4>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

export default ProjectCard;
