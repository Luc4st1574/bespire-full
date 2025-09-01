"use client";

import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition, Listbox, Popover } from '@headlessui/react';
import { toast } from 'sonner';
import { Event } from '@/components/calendar/CalendarMain';
import EventSharedToast from '../ui/EventSharedToast';
import Image from 'next/image';
import {
    X, CheckIcon, ChevronDown, Bold, Italic, Underline, LinkIcon, Paperclip, AtSign, Smile
} from 'lucide-react';

// Lexical Editor Imports
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    COMMAND_PRIORITY_LOW,
    SELECTION_CHANGE_COMMAND,
    EditorConfig, 
    TextNode,
    SerializedTextNode,
    $applyNodeReplacement
} from 'lexical';
import EmojiPicker from '../ui/EmojiPicker';

// --- People Data for the Listbox ---
const people = [
    { id: '1', name: 'Gerard Santos', avatar: '/assets/avatars/gerard.png' },
    { id: '2', name: 'Nathaniel Co', avatar: '/assets/avatars/nathaniel.png' },
    { id: '3', name: 'Glinda B.', avatar: '/assets/avatars/glinda.png' },
    { id: '4', name: 'Iya M.', avatar: '/assets/avatars/iya.png' },
];

export class MentionNode extends TextNode {
    static getType(): string {
        return 'mention';
    }

    static clone(node: MentionNode): MentionNode {
        return new MentionNode(node.__text, node.__key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = super.createDOM(config);
        dom.className = config.theme.mention;
        return dom;
    }

    // These functions ensure the node can be correctly saved, loaded, and copied.
    static importJSON(serializedNode: SerializedTextNode): MentionNode {
        const node = $createMentionNode(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    exportJSON(): SerializedTextNode {
        return {
            ...super.exportJSON(),
            type: 'mention',
        };
    }
}

// This is a "factory" function to make it easy to create new MentionNodes.
export function $createMentionNode(text: string): MentionNode {
    const mentionNode = new MentionNode(text);
    mentionNode.setMode('segmented'); 
    return $applyNodeReplacement(mentionNode);
}

// --- Lexical Editor Configuration ---

const editorTheme = {
    ltr: 'text-left',
    rtl: 'text-right',
    paragraph: 'relative',
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
    },
    mention: 'text-blue-600',
};

const editorNodes = [
    MentionNode, // Must be included in this array
    HeadingNode, 
    QuoteNode, 
    ListItemNode, 
    ListNode, 
    CodeHighlightNode, 
    CodeNode, 
    AutoLinkNode, 
    LinkNode
];

const editorConfig = {
    namespace: 'ShareEventModalEditor',
    theme: editorTheme,
    nodes: editorNodes,
    onError: (error: Error) => {
        console.error(error);
    },
};

// A custom, correctly-typed Error Boundary to satisfy the RichTextPlugin's prop type.
class CustomErrorBoundary extends React.Component<{
    children: React.ReactElement;
    onError: (error: Error) => void;
}> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.props.onError(error);
        console.error("Uncaught error in Lexical editor:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

// --- FIX 2: A more robust Toolbar Plugin ---
function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const emojiButtonRef = useRef < HTMLButtonElement > (null);

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
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, updateToolbar]);

    const insertEmoji = (emoji: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.insertText(emoji);
            }
        });
    };

    // FIX 3: Update insertMention to use our new custom node.
    const insertMention = (name: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // Instead of inserting plain text, we insert our styled MentionNode.
                const mentionNode = $createMentionNode(`@${name}`);
                selection.insertNodes([mentionNode]);
            }
        });
    };

    return (
        <div className="flex items-center justify-between p-2 bg-white rounded-b-md">
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                    className={`p-1.5 rounded ${isBold ? 'bg-gray-200' : 'hover:bg-gray-200'} text-[#697d67] focus:outline-none focus:ring-0`}
                    title="Bold"
                    aria-label="Format text as bold"
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                    className={`p-1.5 rounded ${isItalic ? 'bg-gray-200' : 'hover:bg-gray-200'} text-[#697d67] focus:outline-none focus:ring-0`}
                    title="Italic"
                    aria-label="Format text as italics"
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                    className={`p-1.5 rounded ${isUnderline ? 'bg-gray-200' : 'hover:bg-gray-200'} text-[#697d67] focus:outline-none focus:ring-0`}
                    title="Underline"
                    aria-label="Format text to be underlined"
                >
                    <Underline size={18} />
                </button>
                <button type="button" title="Share" className="p-1.5 rounded hover:bg-gray-200 text-[#697d67] focus:outline-none focus:ring-0"><LinkIcon size={18} /></button>
                <button type="button" title="Attach file" className="p-1.5 rounded hover:bg-gray-200 text-[#697d67] focus:outline-none focus:ring-0"><Paperclip size={18} /></button>

                <Popover className="relative">
                    <Popover.Button className="p-1.5 rounded hover:bg-gray-200 text-[#697d67] focus:outline-none focus:ring-0" title="Mention">
                        <AtSign size={18} />
                    </Popover.Button>
                    <Popover.Panel className="absolute bottom-full right-0 z-20 mb-2 w-48 rounded-md bg-white shadow-lg focus:outline-none focus:ring-0">
                        <div className="p-1">
                            {people.map(person => (
                                <button key={person.id} onClick={() => insertMention(person.name)} className="flex w-full items-center gap-2 rounded p-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:ring-0">
                                    <Image src={person.avatar} alt={person.name} width={20} height={20} className="rounded-full focus:outline-none focus:ring-0" />
                                    <span>{person.name}</span>
                                </button>
                            ))}
                        </div>
                    </Popover.Panel>
                </Popover>

                <div className="relative">
                    <button ref={emojiButtonRef} type="button" onClick={() => setIsEmojiPickerOpen(prev => !prev)} className="p-1.5 rounded hover:bg-gray-200 text-[#697d67] focus:outline-none focus:ring-0" title="Emoji">
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
        </div>
    );
}


// --- Main Modal Component ---
interface ShareEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
}

const customGreen = "#697d67";

export default function ShareEventModal({ isOpen, onClose, event }: ShareEventModalProps) {
    const [selectedPerson, setSelectedPerson] = useState(people[0]);

    if (!event) return null;

    const handleShare = () => {
        toast.custom((t) => (
            <EventSharedToast toastId={t} onGoToChat={() => console.log('Go to Chat clicked!')} />
        ), { duration: 6000 });
        onClose();
    };

    const formatDate = (isoDate: string, startTime?: string, endTime?: string) => {
        const date = new Date(isoDate.replace(/-/g, '/'));
        const dateString = date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (startTime && endTime) {
            return `${dateString}, ${startTime} - ${endTime}`;
        }
        return dateString;
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[70]" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1 text-gray-500 transition-colors hover:bg-gray-100 rounded-full focus:outline-none focus:ring-0"
                                    aria-label="Close modal"
                                >
                                    <X className="h-10 w-10" />
                                </button>

                                <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-gray-900 mt-4">
                                    Share this Event to Chat
                                </Dialog.Title>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Share to</label>
                                        <Listbox value={selectedPerson} onChange={setSelectedPerson}>
                                            <div className="relative">
                                                <Listbox.Button className="relative h-[50px] w-full cursor-default rounded-md border border-gray-200 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none sm:text-sm focus:ring-0 focus:border-gray-400">
                                                    <span className="flex items-center gap-3">
                                                        <Image src={selectedPerson.avatar} alt={selectedPerson.name} width={24} height={24} className="rounded-full" />
                                                        <span className="block truncate">{selectedPerson.name}</span>
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" /></span>
                                                </Listbox.Button>
                                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm border border-gray-300">
                                                        {people.map((person) => (
                                                            <Listbox.Option key={person.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={person}>
                                                                {({ selected }) => (
                                                                    <>
                                                                        <span className={`flex items-center gap-3 truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                            <Image src={person.avatar} alt={person.name} width={24} height={24} className="rounded-full" />
                                                                            {person.name}
                                                                        </span>
                                                                        {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span> : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </Listbox>
                                    </div>

                                    <LexicalComposer initialConfig={editorConfig}>
                                        <div className="relative border border-gray-200 rounded-md shadow-sm">
                                            <RichTextPlugin
                                                contentEditable={<ContentEditable className="w-full p-3 min-h-[100px] text-sm text-gray-800 rounded-t-md focus:outline-none focus:ring-0 resize-none overflow-y-auto" />}
                                                placeholder={<div className="absolute top-3 left-3 text-sm text-gray-400 pointer-events-none">Add a message...</div>}
                                                ErrorBoundary={CustomErrorBoundary}
                                            />
                                            <HistoryPlugin />
                                            <ToolbarPlugin />
                                        </div>
                                    </LexicalComposer>

                                </div>

                                <div className={`flex items-stretch gap-x-4 p-4 rounded-lg my-6 ${event.bgColor}`}>
                                    <div className={`w-1 rounded-full ${event.rectColor}`}></div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
                                        <p className="text-sm text-gray-700">{formatDate(event.date, event.startTime, event.endTime)}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex w-full gap-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className={`flex w-full justify-center px-4 py-2.5 text-sm font-medium text-[${customGreen}] bg-white border border-[${customGreen}] rounded-full hover:bg-gray-50 focus:outline-none transition-colors`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className={`flex w-full justify-center px-4 py-2.5 text-sm font-medium text-white bg-[${customGreen}] rounded-full hover:bg-[#556654] focus:outline-none transition-colors`}
                                    >
                                        Forward
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}