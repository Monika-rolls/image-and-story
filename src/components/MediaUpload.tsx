import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaUploadProps {
  folder: string;
  accept?: string;
  onUploaded: (url: string) => void;
  label?: string;
}

const MediaUpload = ({ folder, accept = "image/*,video/*", onUploaded, label = "Upload media" }: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("portfolio-media").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
      onUploaded(data.publicUrl);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-border bg-card px-3 text-[13px] font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-secondary">
      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
      {uploading ? "Uploading..." : label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
};

export default MediaUpload;
