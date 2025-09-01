"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useRef, useEffect, RefObject } from "react";
import Image from "next/image";
import { X, Plus, MoreHorizontal, Trash2, Link, Share2 } from "lucide-react";
import SpinnerSmall from "@/components/ui/Spinner";

// Helper hook to detect clicks outside an element
const useOnClickOutside = (ref: RefObject<HTMLDivElement | null>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

function isValidUrl(url: string): boolean {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === "http:" || newUrl.protocol === "https:";
  } catch {
    return false;
  }
}

interface Link {
  id?: string;
  url: string;
  title?: string;
  favicon?: string;
}

export function LinkInputList({ name = "links" }: { name?: string }) {
  const { control, register, getValues } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({ control, name });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorIndexes, setErrorIndexes] = useState<number[]>([]);
  
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(menuRef, () => setOpenMenuIndex(null));

  const handleAdd = () => {
    setIsEditing(true);
    if (fields.length === 0) {
      append({ url: "", title: "", favicon: "" });
    }
  };

  const handleDone = async () => {
    setIsLoading(true);
    const errors: number[] = [];
    
    const currentFields = getValues(name) || [];

    const validLinks = currentFields
      .map((field: Link, idx: number) => {
        if (!field.url || !isValidUrl(field.url)) {
          if (field.url) errors.push(idx);
          return null;
        }
        
        const hostname = new URL(field.url).hostname;
        const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
        
        return { url: field.url, title: hostname, favicon };
      })
      .filter(Boolean) as Link[];

    replace(validLinks);
    setErrorIndexes(errors);
    setIsLoading(false);

    if (errors.length === 0) {
      setIsEditing(false);
    }
  };
  
  const handleRemove = (idx: number) => {
    remove(idx);
    setOpenMenuIndex(null);
  };

  // --- ADDED BACK: Handlers for copy and share ---
  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!"); // Or use a more subtle toast notification
    } catch {
      alert("Failed to copy link.");
    }
    setOpenMenuIndex(null);
  };
  
  const handleShare = async (link: Link) => {
    if (navigator.share && link.url && link.title) {
      try {
        await navigator.share({
          title: link.title,
          url: link.url,
        });
      } catch (err) {
        console.error("Sharing failed", err);
      }
    } else {
      alert("Web Share API is not supported in your browser.");
    }
    setOpenMenuIndex(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Links</span>
        {!isEditing ? (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <span>Add</span>
            <Plus size={16} />
          </button>
        ) : (
          <button type="button" className="text-xs text-white bg-[#697d67] rounded-full px-4 py-2 focus:outline-none focus:ring-0" onClick={handleDone} disabled={isLoading}>
            {isLoading ? <SpinnerSmall /> : "Done"}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <input {...register(`${name}.${idx}.url`)} placeholder="Enter link" disabled={isLoading} className={`flex-1 border p-2 rounded-md text-sm outline-none focus:ring-0 ${errorIndexes.includes(idx) ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-500"}`} />
              <button type="button" className="text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-0" onClick={() => remove(idx)} title="Remove link"><X size={20} /></button>
            </div>
          ))}
          <button type="button" className="flex items-center gap-2 text-gray-600 mt-2 text-sm hover:text-black focus:outline-none focus:ring-0" onClick={() => append({ url: "" })}>
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-400"><Plus size={12} /></div>
            <span>Add more</span>
          </button>
          {errorIndexes.length > 0 && <div className="text-red-500 text-xs pt-1">Please enter valid URLs for the highlighted fields.</div>}
        </div>
      )}

      {!isEditing && fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, idx) => {
            const link = field as unknown as Link;
            return (
              <div key={field.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Image src={link.favicon || "/default-favicon.png"} alt={`${link.title || 'link'} favicon`} className="rounded flex-shrink-0" width={20} height={20} onError={(e) => (e.currentTarget.src = "/default-favicon.png")} />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate" title={link.title || ''}>
                    {link.title || link.url}
                  </a>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {/* ADDED: Copy button */}
                  <button type="button" onClick={() => handleCopy(link.url)} className="text-gray-500 hover:text-gray-800" title="Copy link">
                    <Link size={18} />
                  </button>
                  <div className="relative" ref={openMenuIndex === idx ? menuRef : null}>
                    <button type="button" onClick={() => setOpenMenuIndex(openMenuIndex === idx ? null : idx)} className="text-gray-500 hover:text-gray-800" title="More options">
                      <MoreHorizontal size={20} />
                    </button>
                    {openMenuIndex === idx && (
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <ul>
                          {!!navigator.share && (
                            <li><button onClick={() => handleShare(link)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Share2 size={16} className="mr-2" />Share</button></li>
                          )}
                          <li><button onClick={() => handleRemove(idx)} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"><Trash2 size={16} className="mr-2" />Delete</button></li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}