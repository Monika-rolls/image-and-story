import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProjectCard, { type Project } from "./ProjectCard";
import { Field, Section, btnPrimary, btnSecondary, fieldCls, isEditMode } from "./site/ui";

const empty = { title: "", tagline: "", description: "", tags: "", link: "" };

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const editable = isEditMode();

  const load = async () => {
    const { data, error } = await supabase.from("projects").select("*").order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    else setProjects((data as unknown as Project[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    const { error } = await supabase.from("projects").insert({
      title: form.title.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      link: form.link.trim() || null,
      display_order: projects.length + 1,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Project added. Use the pencil on its card to add media and details.");
      setForm(empty);
      setShowForm(false);
      load();
    }
  };

  if (!projects.length && !editable) return null;

  return (
    <Section id="projects" title="More projects" intro="Agents and apps built for clients, hackathons and myself.">
      {editable && (
        <div className="mb-6">
          <button onClick={() => setShowForm((s) => !s)} className={btnSecondary}>
            <Plus className="h-4 w-4" strokeWidth={1.5} /> {showForm ? "Cancel" : "Add project"}
          </button>
          {showForm && (
            <form onSubmit={submit} className="mt-4 grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Title">
                  <input maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldCls} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Tagline">
                  <input maxLength={200} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={fieldCls} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${fieldCls} resize-none`} />
                </Field>
              </div>
              <Field label="Tags (comma separated)">
                <input maxLength={500} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={fieldCls} />
              </Field>
              <Field label="App URL (optional)">
                <input type="url" maxLength={500} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={fieldCls} />
              </Field>
              <div className="md:col-span-2">
                <button type="submit" className={btnPrimary}>
                  Save project
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} editable={editable} onChanged={load} />
        ))}
      </div>
    </Section>
  );
};

export default ProjectsSection;
