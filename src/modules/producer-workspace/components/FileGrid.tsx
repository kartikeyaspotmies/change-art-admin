import { FileText, Image as ImageIcon } from 'lucide-react';

export function FileGrid({
  imageFiles,
  imageUrls,
  otherFiles,
}: {
  imageFiles: { id: string; file_name: string }[];
  imageUrls: string[];
  otherFiles: { id: string; file_name: string }[];
}) {
  if (imageFiles.length === 0 && otherFiles.length === 0) {
    return <div className="text-[12px] text-text-faint italic">No files.</div>;
  }
  return (
    <div className="space-y-2">
      {imageFiles.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {imageFiles.map((f, i) => (
            <div key={f.id} className="rounded-lg overflow-hidden border border-border aspect-square bg-black/5">
              {imageUrls[i] ? (
                <img src={imageUrls[i]} alt={f.file_name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-text-faint" aria-hidden />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
      {otherFiles.length > 0 ? (
        <ul className="space-y-1">
          {otherFiles.map((f) => (
            <li key={f.id} className="flex items-center gap-1.5 text-[11.5px] text-text-muted">
              <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="truncate">{f.file_name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
