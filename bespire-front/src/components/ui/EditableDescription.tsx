import { useEffect, useRef, useState } from "react";

export default function EditableDescription({
  value,
  onSave,
  loading = false,
  canEdit = false,
  minRows = 6,
  placeholder = "Add a description...",
}: {
  value: string;
  onSave: (newValue: string) => void;
  loading?: boolean;
  canEdit?: boolean;
  minRows?: number;
  placeholder?: string;
}) {
  const [desc, setDesc] = useState(value || "");
  const [lastSaved, setLastSaved] = useState(value || "");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Si cambia el prop value externo, actualizar estado local
  useEffect(() => {
    setDesc(value || "");
    setLastSaved(value || "");
  }, [value]);

  // Guardar al salir del foco si cambió el texto
  const handleBlur = () => {
    if (desc !== lastSaved) {
      onSave(desc);
      setLastSaved(desc);
    }
  };

  // Debounce para guardar después de 1s sin escribir
  useEffect(() => {
    if (desc !== lastSaved) {
      if (timer) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          onSave(desc);
          setLastSaved(desc);
        }, 1000)
      );
    }
    // Cleanup al desmontar
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desc]);

  if (!canEdit) {
    // Solo lectura
    return <div className="border-1 border-[#C4CCC8] rounded-lg p-4">{value}</div>;
  }

  return (
    <textarea
      ref={textareaRef}
      className="border-1 border-[#C4CCC8] rounded-lg p-4 w-full resize-none text-base"
      value={desc}
      rows={minRows}
      onChange={(e) => setDesc(e.target.value)}
      onBlur={handleBlur}
      disabled={loading}
      placeholder={placeholder}
      spellCheck={true}
      style={{ minHeight: 72 }}
    />
  );
}
