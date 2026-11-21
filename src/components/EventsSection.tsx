import { useEffect, useState } from "react";
import { ArrowUpRight, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import MediaUpload from "./MediaUpload";
import { Field, btnPrimary, btnSecondary, fieldCls, isEditMode } from "./site/ui";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  venue: string | null;
  image_url: string | null;
  link: string | null;
}

const emptyForm = { title: "", description: "", event_date: "", venue: "", link: "", image_url: "" };

/** Talks, workshops and buildathons, stored in Supabase. Rendered inside the open source section. */
const EventsList = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const editable = isEditMode();

  const load = async () => {
    const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false, nullsFirst: false });
    if (error) toast.error(error.message);
    else setEvents(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (ev: EventItem) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description || "",
      event_date: ev.event_date || "",
      venue: ev.venue || "",
      link: ev.link || "",
      image_url: ev.image_url || "",
    });
    setShowForm(true);
  };

  const cancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date || null,
      venue: form.venue.trim() || null,
      link: form.link.trim() || null,
      image_url: form.image_url || null,
    };
    const { error } = editingId
      ? await supabase.from("events").update(payload).eq("id", editingId)
      : await supabase.from("events").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editingId ? "Event updated" : "Event added");
      cancel();
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  if (!events.length && !editable) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-[15px] font-medium">Talks and events</h3>
        {editable && (
          <button onClick={() => (showForm ? cancel() : setShowForm(true))} className={`${btnSecondary} h-8 px-3 text-[13px]`}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> {showForm ? "Cancel" : "Add event"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label={editingId ? "Title (editing)" : "Title"}>
              <input maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldCls} />
            </Field>
          </div>
          <Field label="Date">
            <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className={fieldCls} />
          </Field>
          <Field label="Venue or platform">
            <input maxLength={200} value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={fieldCls} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea maxLength={1000} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${fieldCls} resize-none`} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Link">
              <input type="url" maxLength={500} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={fieldCls} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <MediaUpload folder="events" accept="image/*" onUploaded={(url) => setForm({ ...form, image_url: url })} label={form.image_url ? "Replace image" : "Add image"} />
            {form.image_url && (
              <>
                <img src={form.image_url} alt="" className="h-12 rounded border border-border" />
                <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="text-[13px] text-muted-foreground hover:text-destructive">
                  Remove
                </button>
              </>
            )}
          </div>
          <div className="md:col-span-2">
            <button type="submit" className={btnPrimary}>
              {editingId ? "Update event" : "Save event"}
            </button>
          </div>
        </form>
      )}

      <ul className="flex flex-col gap-4">
        {events.map((ev) => (
          <li key={ev.id} className="relative grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            {ev.image_url && <img src={ev.image_url} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-xl border border-border object-cover" />}
            <div className={ev.image_url ? "" : "sm:col-span-2"}>
              <p className="font-mono text-[12.5px] text-subtle">
                {[ev.event_date && format(new Date(`${ev.event_date}T00:00:00`), "MMM yyyy"), ev.venue].filter(Boolean).join(" · ")}
              </p>
              <h4 className="mt-1 pr-16 text-[16px] font-medium">{ev.title}</h4>
              {ev.description && (
                <p className="mt-2 line-clamp-4 whitespace-pre-line text-[14.5px] leading-relaxed text-muted-foreground">{ev.description}</p>
              )}
              {ev.link && (
                <a href={ev.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium underline decoration-border underline-offset-4 hover:decoration-primary">
                  Details <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              )}
            </div>
            {editable && (
              <div className="absolute right-3 top-3 flex gap-1">
                <button onClick={() => startEdit(ev)} aria-label="Edit event" className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button onClick={() => remove(ev.id)} aria-label="Delete event" className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventsList;
