"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
    Paperclip, Bold, Italic, Underline, AtSign, Smile, Link as LinkIcon, X
} from 'lucide-react';
import { Popover } from '@headlessui/react';
import { getFileIcon } from '@/utils/getFileIcon';

// --- LEXICAL IMPORTS ---
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $createLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { mergeRegister } from '@lexical/utils';
import {
    $getSelection, $isRangeSelection, $getRoot, $createTextNode, FORMAT_TEXT_COMMAND,
    COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND, EditorConfig, TextNode,
    SerializedTextNode, $applyNodeReplacement, KEY_DOWN_COMMAND, COMMAND_PRIORITY_NORMAL,
} from 'lexical';

// Assumed path for the EmojiPicker component
import EmojiPicker from '../../ui/EmojiPicker';

// --- TYPE DEFINITIONS (Self-contained) ---
interface Attachment {
    id: string;
    file: File;
    preview?: string;
    status: 'uploading' | 'completed';
}

interface Person {
    id: string;
    name: string;
    avatar: string;
}

// --- LEXICAL CONFIGURATION (Self-contained) ---
class MentionNode extends TextNode {
    static getType(): string { return 'mention'; }
    static clone(node: MentionNode): MentionNode { return new MentionNode(node.__text, node.__key); }
    createDOM(config: EditorConfig): HTMLElement {
        const dom = super.createDOM(config);
        dom.className = 'text-blue-600 font-semibold';
        return dom;
    }
    static importJSON(serializedNode: SerializedTextNode): MentionNode {
        const node = $createMentionNode(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }
    exportJSON(): SerializedTextNode {
        return { ...super.exportJSON(), type: 'mention' };
    }
}

function $createMentionNode(text: string): MentionNode {
    const mentionNode = new MentionNode(text);
    mentionNode.setMode('segmented');
    return $applyNodeReplacement(mentionNode);
}

const people: Person[] = [
    { id: '1', name: 'Gerard Santos', avatar: '/assets/avatars/gerard.png' },
    { id: '2', name: 'Nathaniel Co', avatar: '/assets/avatars/nathaniel.png' },
    { id: '3', name: 'Glinda B.', avatar: '/assets/avatars/glinda.png' },
    { id: '4', name: 'Iya M.', avatar: '/assets/avatars/iya.png' },
];

const editorTheme = {
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
    },
    link: 'text-blue-600 underline',
};

const editorNodes = [MentionNode, LinkNode, ListNode, ListItemNode];

const editorConfig = {
    namespace: 'ChatEditor',
    theme: editorTheme,
    nodes: editorNodes,
    onError: (error: Error) => { console.error(error); },
};

type ErrorBoundaryProps = { children: React.ReactElement; onError: (error: Error) => void; };
class CustomErrorBoundary extends React.Component<ErrorBoundaryProps> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.props.onError(error);
        console.error("Uncaught error in Lexical editor:", error, errorInfo);
    }
    render() {
        return this.state.hasError ? null : this.props.children;
    }
}

// --- HELPER COMPONENTS ---
const UploadingSpinner = () => (
    <svg className="animate-spin h-8 w-8 text-[#697d67]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const AttachmentPreviewArea = ({ attachments, onRemove }: { attachments: Attachment[]; onRemove: (id: string) => void; }) => {
    return (
        <div className="flex flex-wrap items-start gap-2 p-3 border-b border-gray-200">
            {attachments.map(att => {
                const isImage = att.preview && att.file.type.startsWith('image/');

                return (
                    <div
                        key={att.id}
                        // Base styles for all attachments
                        className={`relative flex items-center bg-white border border-gray-200 rounded-lg shadow-sm group transition-all duration-300 ease-in-out
                                    ${isImage ? 'h-16 w-16 hover:w-28' : 'h-16 w-60'}`}
                    >
                        {att.status === 'uploading' ? (
                            <div className="w-full h-full flex items-center justify-center rounded-lg">
                                <UploadingSpinner />
                            </div>
                        ) : (
                            <>
                                {/* Image Preview (now absolutely positioned to prevent stretching) / File Icon */}
                                <div className={`flex-shrink-0 flex items-center justify-center
                                                ${isImage ? 'absolute top-1 left-1 h-14 w-14 rounded-md overflow-hidden' : 'w-12 h-full pl-3'}`}>
                                    {isImage ? (
                                        <Image src={att.preview!} alt={att.file.name} layout="fill" objectFit="cover" />
                                    ) : (
                                        <Image src={getFileIcon(att.file.name)} alt="file icon" width={32} height={32} />
                                    )}
                                </div>

                                {/* File Details (renders ONLY for non-images) */}
                                {!isImage && (
                                    <div className="flex-1 px-3 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {att.file.name.split('.')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {att.file.name.split('.').pop()?.toUpperCase()} file
                                        </p>
                                    </div>
                                )}

                                {/* Remove Button (icon only, no background) */}
                                <button
                                    onClick={() => onRemove(att.id)}
                                    className="absolute top-1/2 -translate-y-1/2 right-2 z-10 p-1
                                                flex items-center justify-center
                                                text-gray-400 opacity-0 group-hover:opacity-100
                                                group-hover:text-gray-700 transition-opacity"
                                    title="Remove file"
                                >
                                    <X size={28} strokeWidth={2.5} />
                                </button>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// --- EDITOR PLUGINS ---
function ToolbarPlugin({ onAttachClick }: { onAttachClick: () => void }) {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const [linkUrl, setLinkUrl] = useState('');

    const updateToolbar = React.useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
        }
    }, []);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => { updateToolbar(); });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => { updateToolbar(); return false; },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, updateToolbar]);

    const insertMention = (name: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const mentionNode = $createMentionNode(`@${name}`);
                selection.insertNodes([mentionNode]);
            }
        });
    };

    const insertEmoji = (emoji: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.insertText(emoji);
            }
        });
    };
    
    const handleInsertLink = () => {
        if (linkUrl.trim() === '') return;
        const url = /^(https?:\/\/)/i.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
        
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const linkNode = $createLinkNode(url);
                const textNode = $createTextNode(url);
                linkNode.append(textNode);
                selection.insertNodes([linkNode]);
            }
        });
    };

    return (
        <div className="flex items-center gap-1">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={`p-1.5 rounded ${isBold ? 'bg-gray-200' : 'hover:bg-gray-200'} text-gray-600`} title="Bold">
                <Bold size={18} />
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={`p-1.5 rounded ${isItalic ? 'bg-gray-200' : 'hover:bg-gray-200'} text-gray-600`} title="Italic">
                <Italic size={18} />
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={`p-1.5 rounded ${isUnderline ? 'bg-gray-200' : 'hover:bg-gray-200'} text-gray-600`} title="Underline">
                <Underline size={18} />
            </button>

            <Popover className="relative">
                {({ close }) => (
                <>
                    <Popover.Button type="button" className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Add Link">
                        <LinkIcon size={18} />
                    </Popover.Button>
                    <Popover.Panel className="absolute bottom-full left-0 z-10 mb-2 w-max rounded-md bg-white shadow-lg p-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-48 p-1.5 border border-gray-300 rounded-md text-sm focus:ring-0 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    handleInsertLink();
                                    setLinkUrl('');
                                    close(); 
                                }}
                                className={`px-4 py-1.5 text-white text-sm font-semibold rounded-full transition-colors bg-[#697d67] hover:bg-[#556654]`}
                            >
                                Send
                            </button>
                        </div>
                    </Popover.Panel>
                </>
                )}
            </Popover>
            
            <button type="button" onClick={onAttachClick} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Attach file">
                <Paperclip size={18} />
            </button>

            <Popover className="relative">
                <Popover.Button type="button" className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Mention">
                    <AtSign size={18} />
                </Popover.Button>
                <Popover.Panel className="absolute bottom-full left-0 z-10 mb-2 w-48 rounded-md bg-white shadow-lg">
                    <div className="p-1">
                        {people.map(person => (
                            <button key={person.id} onClick={() => insertMention(person.name)} className="flex w-full items-center gap-2 rounded p-2 text-left text-sm hover:bg-gray-100">
                                <Image src={person.avatar} alt={person.name} width={20} height={20} className="rounded-full" />
                                <span>{person.name}</span>
                            </button>
                        ))}
                    </div>
                </Popover.Panel>
            </Popover>

            <div className="relative">
                <button
                    ref={emojiButtonRef}
                    type="button"
                    onClick={() => setIsEmojiPickerOpen(prev => !prev)}
                    className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                    title="Emoji"
                >
                    <Smile size={18} />
                </button>
                <EmojiPicker
                    isOpen={isEmojiPickerOpen}
                    onClose={() => setIsEmojiPickerOpen(false)}
                    onEmojiSelect={insertEmoji}
                    buttonRef={emojiButtonRef}
                />
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
interface ChatInputProps {
    onSendMessage: (text: string, attachments: Attachment[]) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const newAttachments: Attachment[] = files.map(file => {
            const id = `${file.name}-${Date.now()}`;
            const newAttachment: Attachment = { id, file, status: 'uploading' };
            if (file.type.startsWith('image/')) {
                newAttachment.preview = URL.createObjectURL(file);
            }
            setTimeout(() => {
                setAttachments(prev => prev.map(att => att.id === id ? { ...att, status: 'completed' } : att));
            }, 1500);
            return newAttachment;
        });

        setAttachments(prev => [...prev, ...newAttachments]);
        if (event.target) event.target.value = '';
    };

    const handleRemoveAttachment = (id: string) => {
        const attachmentToRemove = attachments.find(att => att.id === id);
        if (attachmentToRemove?.preview) {
            URL.revokeObjectURL(attachmentToRemove.preview);
        }
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    function ActionsPlugin() {
        const [editor] = useLexicalComposerContext();
        const [canSend, setCanSend] = useState(false);
        const editorStateRef = useRef<string>('');
        
        const onSend = React.useCallback(() => {
            const currentEditorState = editorStateRef.current;
            const hasText = canSend && currentEditorState.trim() !== '' && currentEditorState.trim() !== '<p><br></p>';
            const hasAttachments = attachments.length > 0;

            if (!hasText && !hasAttachments) return;

            onSendMessage(
                currentEditorState,
                attachments.filter(a => a.status === 'completed')
            );

            setAttachments([]);
            editor.update(() => { $getRoot().clear(); });
            editor.focus();
        }, [canSend, editor]);

        useEffect(() => {
        const unregister = mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    const rootElement = editor.getRootElement();
                    const textContent = $getRoot().getTextContent();
                    editorStateRef.current = rootElement ? rootElement.innerHTML : '';
                    setCanSend(textContent.trim() !== '');
                });
            }),
            editor.registerCommand(
                KEY_DOWN_COMMAND,
                (event: KeyboardEvent) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        onSend();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_NORMAL,
            )
        );
        return () => unregister();
        }, [editor, onSend]);
        
        const isSendDisabled = !canSend && attachments.length === 0;

        return (
            <button type="button" onClick={onSend} disabled={isSendDisabled} className={`px-4 py-1.5 text-white text-sm font-semibold rounded-full transition-colors ${isSendDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#697d67] hover:bg-[#556654]'}`}>
                Send
            </button>
        );
    }

    return (
        <div className={`px-6 bg-white transition-all duration-300 ease-in-out ${attachments.length > 0 ? '-mt-28' : '-mt-8'}`}>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                {attachments.length > 0 && (
                    <AttachmentPreviewArea attachments={attachments} onRemove={handleRemoveAttachment} />
                )}
                <div className="relative bg-white">
                    <LexicalComposer initialConfig={editorConfig}>
                        <div className="relative">
                            <RichTextPlugin
                                contentEditable={<ContentEditable className="w-full min-h-[40px] p-3 text-sm text-gray-800 resize-none focus:outline-none" />}
                                placeholder={<div className="absolute top-3 left-3 text-sm text-gray-400 pointer-events-none">Type a message...</div>}
                                ErrorBoundary={(props) => <CustomErrorBoundary {...props} />}
                            />
                        </div>
                        <HistoryPlugin />
                        <LinkPlugin />
                        <div className="flex items-center justify-between p-2">
                            <ToolbarPlugin onAttachClick={() => fileInputRef.current?.click()} />
                            <ActionsPlugin />
                        </div>
                    </LexicalComposer>
                </div>
            </div>
            <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" title="Attach files" />
        </div>
    );
}