"use client";

import { useState, useMemo, useRef, useEffect, useCallback, ChangeEvent } from "react";
import Image from "next/image";
import { Folder, X } from "lucide-react";
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Range as QuillRange } from 'quill/core';

import { useAppContext } from "@/context/AppContext";
import { MockFile } from "@/data/mock-files";
import TagSelectPopover from "../ui/TagSelectPopover";
import TagsData from '@/data/tags.json';
import { EditorToolbar } from "./Toolbar";

// --- Custom hook for history management ---
const useHistory = <T,>(initialState: T) => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const state = history[currentIndex];
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const setState = useCallback((value: T | ((prevState: T) => T)) => {
        const newValue = typeof value === 'function' ? (value as (prevState: T) => T)(history[currentIndex]) : value;
        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(newValue);
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
    }, [currentIndex, history]);

    const undo = useCallback(() => { if (canUndo) { setCurrentIndex((i) => i - 1); } }, [canUndo]);
    const redo = useCallback(() => { if (canRedo) { setCurrentIndex((i) => i + 1); } }, [canRedo]);

    return { state, setState, undo, redo, canUndo, canRedo };
};

// --- Quill Customization ---
const Parchment = Quill.import('parchment');
const fontNames = ['arial', 'verdana', 'times-new-roman', 'georgia', 'courier-new'];

const FontAttribute = new Parchment.StyleAttributor('font', 'font-family', {
    scope: Parchment.Scope.INLINE,
    whitelist: fontNames
});
Quill.register(FontAttribute, true);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Size = Quill.import('attributors/style/size') as any;
Size.whitelist = ['8px', '10px', '12px', '14px', '18px', '24px', '36px', '48px'];
Quill.register(Size, true);

const availableTags = TagsData.map((tag) => ({ value: tag, label: tag }));

// --- Component ---
interface DocumentEditorProps {
    allFiles: MockFile[];
    currentFolderId: string | null;
}

export default function DocumentEditor({ allFiles, currentFolderId }: DocumentEditorProps) {
    const { state: content, setState: setContent, undo, redo, canUndo, canRedo } = useHistory<string>("");
    const [zoom, setZoom] = useState('100%');
    const { editorTags = [], setEditorTags } = useAppContext();
    const [activeStyles, setActiveStyles] = useState<Record<string, unknown>>({});
    const [currentStyle, setCurrentStyle] = useState('Paragraph');
    const [currentFont, setCurrentFont] = useState('arial');
    const [currentSize, setCurrentSize] = useState('18px'); // Changed default size to 18px

    const imageInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const transformContainerRef = useRef<HTMLDivElement>(null);
    const isQuillUpdating = useRef(false);
    
    // 1. Add a ref to store the last valid selection.
    const savedRangeRef = useRef<QuillRange | null>(null);

    const scale = useMemo(() => parseFloat(zoom) / 100, [zoom]);
    
    const updateToolbarState = useCallback(() => {
        const quill = quillRef.current;
        if (!quill) return;
        
        // Use the saved range to get format, ensuring toolbar updates correctly.
        const range = savedRangeRef.current;
        const format = range ? quill.getFormat(range) : {};
        setActiveStyles(format);

        const header = format.header;
        if (header === 1) setCurrentStyle('Heading 1');
        else if (header === 2) setCurrentStyle('Heading 2');
        else if (header === 3) setCurrentStyle('Heading 3');
        else setCurrentStyle('Paragraph');

        setCurrentFont(typeof format.font === 'string' ? format.font : 'arial');
        setCurrentSize(typeof format.size === 'string' ? format.size : '18px'); // Changed default size to 18px
    }, []);
    
    // 4. Update action handlers to restore the selection before executing.
    const handleFormat = (command: string, value?: string | number | boolean) => {
        const quill = quillRef.current;
        if (quill && savedRangeRef.current) {
            quill.setSelection(savedRangeRef.current);
            quill.format(command, value);
            updateToolbarState();
        }
    };
    
    const handleInsertLink = useCallback((url: string) => {
        const quill = quillRef.current;
        const range = savedRangeRef.current;

        // Safety check
        if (!quill || !range) return;

        // Sanitize the URL
        let sanitizedUrl = url.trim();
        if (sanitizedUrl && !/^https?:\/\//i.test(sanitizedUrl)) {
            sanitizedUrl = `https://${sanitizedUrl}`;
        }

        // Always restore the last known selection
        quill.setSelection(range);

        // Check if the user has highlighted any text
        if (range.length > 0) {
            // If text is selected, just apply the format as before.
            quill.format('link', sanitizedUrl);
        } else {
            // If no text is selected (just a cursor), insert the URL as the link's text.
            quill.insertText(range.index, sanitizedUrl, 'link', sanitizedUrl);
            // Optional: Move cursor to the end of the newly inserted link
            quill.setSelection(range.index + sanitizedUrl.length, 0);
        }
    }, []);

    const handleCodeBlockClick = () => {
        const quill = quillRef.current;
        const range = savedRangeRef.current;
        if (quill && range) {
            quill.setSelection(range);
            const format = quill.getFormat(range);
            quill.format('code-block', !format['code-block']);
        }
    };

    const handleImageClick = () => { imageInputRef.current?.click(); };
    const handleImageFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) { insertImage(file); }
        if(event.target) event.target.value = '';
    };

    const insertImage = useCallback((file: File) => {
        const quill = quillRef.current;
        if (!quill) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target?.result;
            if (typeof base64Image === 'string') {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', base64Image, 'user');
                quill.setSelection(range.index + 1, 0);
            }
        };
        reader.readAsDataURL(file);
    }, []);
    
    useEffect(() => {
        if (quillRef.current || !editorRef.current) return; 

        const quill = new Quill(editorRef.current, {
            modules: { toolbar: null, history: { userOnly: true } },
            theme: 'snow',
            placeholder: 'Untitled Document',
        });
        quillRef.current = quill;

        if (content) { quill.clipboard.dangerouslyPasteHTML(content); }
        
        quill.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user') {
                isQuillUpdating.current = true;
                setContent(quill.root.innerHTML);
            }
        });

        // 3. Update the selection-change listener to save the range.
        quill.on('selection-change', (range) => {
            if (range) {
                savedRangeRef.current = range;
            }
            updateToolbarState();
        });

        quill.root.addEventListener('paste', (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                            event.preventDefault();
                            insertImage(file);
                        }
                        break;
                    }
                }
            }
        });
    }, [content, setContent, updateToolbarState, insertImage]);

    useEffect(() => {
        if (isQuillUpdating.current) {
            isQuillUpdating.current = false;
            return;
        }

        const quill = quillRef.current;
        if (quill && quill.root.innerHTML !== content) {
            const selection = quill.getSelection();
            quill.clipboard.dangerouslyPasteHTML(content);
            if (selection) { quill.setSelection(selection.index, selection.length); }
        }
    }, [content]);

    useEffect(() => {
        const editorNode = editorRef.current?.querySelector('.ql-editor');
        const transformNode = transformContainerRef.current;
        if (!editorNode || !transformNode) return;
        const updateLayout = () => {
            const contentHeight = editorNode.scrollHeight;
            const extraSpaceNeeded = scale > 1 ? contentHeight * (scale - 1) : 0;
            transformNode.style.paddingBottom = `${extraSpaceNeeded}px`;
        };
        const observer = new ResizeObserver(updateLayout);
        observer.observe(editorNode);
        updateLayout();
        return () => observer.disconnect();
    }, [content, scale]);

    const path = useMemo(() => {
        const breadcrumbs = [{ id: null, name: "All Files" }];
        if (!currentFolderId) return breadcrumbs;
        let currentId: string | null = currentFolderId;
        const pathParts: { id: string | null; name: string }[] = [];
        while (currentId) {
            const folder = allFiles.find((f) => f.id === currentId);
            if (folder) { pathParts.unshift({ id: folder.id, name: folder.name }); currentId = folder.parentId; } else { break; }
        }
        return [...breadcrumbs, ...pathParts];
    }, [currentFolderId, allFiles]);
    
    const creationDate = useMemo(() => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Lima' }).replace(',', ''), []);
    
    const handleAddTag = (tag: string) => { if (setEditorTags && !editorTags.includes(tag)) setEditorTags([...editorTags, tag]); };
    const handleRemoveTag = (tag: string) => { if (setEditorTags) setEditorTags(editorTags.filter((t) => t !== tag)); };

    return (
        <div className="h-full flex flex-col gap-2 animate-fadeIn pt-0 px-2 pb-2 sm:px-4 sm:pb-4">
            <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageFileSelected}
                accept="image/*"
                style={{ display: 'none' }}
                title="Upload image file"
            />
            
            <div className="flex justify-between items-center flex-shrink-0 px-2 -mt-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Folder className="w-5 h-5 text-gray-500" />
                        {path.map((crumb, index) => (
                            <div key={crumb.id ?? 'root'} className="flex items-center gap-2">
                                <span>{crumb.name}</span>
                                {index < path.length - 1 && <span className="text-gray-400">&gt;</span>}
                            </div>
                        ))}
                    </div>
                    <div className="w-px h-6 bg-gray-300 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Tags:</span>
                        {editorTags.map((tag) => (
                            <div key={tag} className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-black">
                                <span>{tag}</span>
                                <button onClick={() => handleRemoveTag(tag)} className="text-black/60 hover:text-red-600" title={`Remove ${tag} tag`}><X size={12} strokeWidth={3} /></button>
                            </div>
                        ))}
                        <TagSelectPopover availableTags={availableTags.filter(t => !editorTags.includes(t.value))} onSelectTag={handleAddTag} onClose={() => { }} />
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
                    <Image className="h-8 w-8 rounded-full" src="https://avatar.vercel.sh/me" alt="User avatar" width={32} height={32} />
                    <span>Created: {creationDate}</span>
                </div>
            </div>

            <div>
                <EditorToolbar 
                    undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} 
                    onFormat={handleFormat} 
                    activeStyles={activeStyles}
                    zoom={zoom} 
                    onZoomChange={setZoom}
                    currentStyle={currentStyle}
                    currentFont={currentFont}
                    currentSize={currentSize}
                    onInsertLink={handleInsertLink}
                    onImageClick={handleImageClick}
                    onCodeBlockClick={handleCodeBlockClick}
                />
            </div>
            
            <div className="flex-grow rounded-lg overflow-auto">
                <div className="p-4 sm:p-8">
                    <div 
                        ref={transformContainerRef}
                        className="max-w-4xl mx-auto transition-transform duration-200 origin-top"
                        style={{ transform: `scale(${scale})`, willChange: 'transform' }}
                    >
                        <div className="bg-white shadow-lg rounded-lg p-8 sm:p-16 flex-grow" style={{ minHeight: '11in' }}>
                            <div ref={editorRef} className="document-editor" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}