import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, MapPin, Plus, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import MediaUpload from "./MediaUpload";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  venue: string | null;
  image_url: string | null;
  link: string | null;
}

const EventsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", venue: "", link: "", image_url: "" });

  const load = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false, nullsFirst: false });
    if (error) toast.error(error.message);
    else setEvents(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title required");
      return;
    }
    if (form.title.length > 200) {
      toast.error("Title too long");
      return;
    }
    const { error } = await supabase.from("events").insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date || null,
      venue: form.venue.trim() || null,
      link: form.link.trim() || null,
      image_url: form.image_url || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Event added");
      setForm({ title: "", description: "", event_date: "", venue: "", link: "", image_url: "" });
      setShowForm(false);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <section id="events" className="relative py-24 overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// EVENTS & WORKSHOPS</h2>
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">Speaking Layers</h3>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-heading text-sm hover:bg-primary/20 transition-all mb-8"
          >
            <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add event"}
          </button>
        </motion.div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={submit}
            className="mb-10 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm grid md:grid-cols-2 gap-4"
          >
            <input type="text" maxLength={200} placeholder="Event / workshop title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none" />
            <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none" />
            <input type="text" maxLength={200} placeholder="Venue / platform" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none" />
            <textarea maxLength={1000} rows={3} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none resize-none" />
            <input type="url" maxLength={500} placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none" />
            <div className="md:col-span-2 flex items-center gap-3 flex-wrap">
              <MediaUpload folder="events" accept="image/*" onUploaded={(url) => setForm({ ...form, image_url: url })} label="Add image" />
              {form.image_url && <img src={form.image_url} alt="" className="h-12 rounded border border-border" />}
            </div>
            <button type="submit" className="md:col-span-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading text-sm hover:bg-primary/90 transition-all">
              Save event
            </button>
          </motion.form>
        )}

        {events.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <Calendar className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">No events yet. Click "Add event" to share a workshop or talk.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/40 transition-all"
              >
                {ev.image_url && (
                  <img src={ev.image_url} alt={ev.title} className="w-full h-44 object-cover" />
                )}
                <div className="p-5">
                  <h4 className="font-heading text-lg font-semibold text-foreground mb-2">{ev.title}</h4>
                  <div className="flex flex-wrap gap-3 text-xs font-display tracking-wider text-muted-foreground mb-3">
                    {ev.event_date && (
                      <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" />{format(new Date(ev.event_date), "MMM d, yyyy")}</span>
                    )}
                    {ev.venue && (
                      <span className="inline-flex items-center gap-1.5"><MapPin className="w-3 h-3" />{ev.venue}</span>
                    )}
                  </div>
                  {ev.description && <p className="font-body text-sm text-foreground/80 mb-3 line-clamp-3">{ev.description}</p>}
                  {ev.link && (
                    <a href={ev.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary font-heading text-xs tracking-wider hover:gap-2 transition-all">
                      <ExternalLink className="w-3 h-3" /> Details
                    </a>
                  )}
                </div>
                <button onClick={() => remove(ev.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-background/80 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
