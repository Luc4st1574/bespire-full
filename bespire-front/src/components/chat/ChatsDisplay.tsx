"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
    Paperclip, MoreHorizontal, Phone, Video,
    Bold, Italic, Underline, AtSign, Smile,
    Link as LinkIcon
} from 'lucide-react';
import { Popover } from '@headlessui/react';

// --- LEXICAL IMPORTS START ---
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $createLinkNode, LinkNode } from '@lexical/link'; // MODIFIED
import { ListItemNode, ListNode } from '@lexical/list';
import { mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    $getRoot,
    $createTextNode, // ADDED
    FORMAT_TEXT_COMMAND,
    COMMAND_PRIORITY_LOW,
    SELECTION_CHANGE_COMMAND,
    EditorConfig,
    TextNode,
    SerializedTextNode,
    $applyNodeReplacement,
    KEY_DOWN_COMMAND,
    COMMAND_PRIORITY_NORMAL,
} from 'lexical';
// Assumed path for the EmojiPicker component
import EmojiPicker from '../ui/EmojiPicker';

interface ConversationMessage {
    sender: string;
    text: string;
    timestamp: string;
}

interface Chat {
    id: number;
    name: string;
    avatar: string;
    isOnline: boolean;
    conversation: ConversationMessage[];
}

interface ChatsDisplayProps {
    chat: Chat | null;
}

const currentUser = {
    name: "You",
    avatar: "/assets/icons/default_avatar.svg"
};

const people = [
    { id: '1', name: 'Gerard Santos', avatar: '/assets/avatars/gerard.png' },
    { id: '2', name: 'Nathaniel Co', avatar: '/assets/avatars/nathaniel.png' },
    { id: '3', name: 'Glinda B.', avatar: '/assets/avatars/glinda.png' },
    { id: '4', name: 'Iya M.', avatar: '/assets/avatars/iya.png' },
];

export class MentionNode extends TextNode {
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

export function $createMentionNode(text: string): MentionNode {
    const mentionNode = new MentionNode(text);
    mentionNode.setMode('segmented');
    return $applyNodeReplacement(mentionNode);
}

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

function ToolbarPlugin() {
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
    
    // --- THIS IS THE NEW, MORE ROBUST FUNCTION ---
    const handleInsertLink = () => {
        if (linkUrl.trim() === '') {
            return;
        }
        const url = /^(https?:\/\/)/i.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
        
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // 1. Create the link node with the URL
                const linkNode = $createLinkNode(url);
                // 2. Create a text node that will be the link's visible text
                const textNode = $createTextNode(url);
                // 3. Attach the text node to the link node
                linkNode.append(textNode);
                // 4. Insert the complete link node at the current cursor position
                selection.insertNodes([linkNode]);
            }
        });
    };

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                className={`p-1.5 rounded ${isBold ? 'bg-gray-200' : 'hover:bg-gray-200'} text-gray-600`}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                className={`p-1.5 rounded ${isItalic ? 'bg-gray-200' : 'hover:bg-gray-200'} text-gray-600`}
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                className={`p-1.5 rounded ${isUnderline ? 'bg-gray-200' : 'hover:bg-gray-200'} text-gray-600`}
                title="Underline"
            >
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
            
            <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Attach file">
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

type ErrorBoundaryProps = {
    children: React.ReactElement;
    onError: (error: Error) => void;
};
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

const formatDateSeparator = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDateString = messageDate.toDateString();
    const todayDateString = today.toDateString();
    const yesterdayDateString = yesterday.toDateString();
    const time = messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (messageDateString === todayDateString) { return `Today ${time}`; }
    if (messageDateString === yesterdayDateString) { return `Yesterday ${time}`; }
    return messageDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};


export default function ChatsDisplay({ chat }: ChatsDisplayProps) {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chat) {
            setMessages(chat.conversation);
        }
    }, [chat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    function ActionsPlugin() {
        const [editor] = useLexicalComposerContext();
        const [canSend, setCanSend] = useState(false);
        const editorStateRef = useRef<string>('');
        
        const onSend = React.useCallback(() => {
            const currentEditorState = editorStateRef.current;
            if (!canSend || !currentEditorState || currentEditorState.trim() === '' || currentEditorState.trim() === '<p><br></p>') {
                return;
            }

            const newMessage: ConversationMessage = {
                sender: 'You',
                text: currentEditorState,
                timestamp: new Date().toISOString(),
            };

            setMessages(prevMessages => [...prevMessages, newMessage]);
            
            editor.update(() => {
                const root = $getRoot();
                root.clear();
            });
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
                            return true; // Command was handled
                        }
                        return false; // Command was not handled
                    },
                    COMMAND_PRIORITY_NORMAL,
                )
            );
            return () => unregister();
        }, [editor, onSend]);
        

        return (
            <button
                type="button" 
                onClick={onSend}
                disabled={!canSend}
                className={`px-4 py-1.5 text-white text-sm font-semibold rounded-full transition-colors ${
                    !canSend
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#697d67] hover:bg-[#556654]'
                }`}
            >
                Send
            </button>
        )
    }

    if (!chat) return null;

    return (
        <div className="flex flex-col h-full w-full border border-gray-200 rounded-md shadow-sm overflow-hidden bg-white">

            <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Image src={chat.avatar} alt={chat.name} width={40} height={40} className="rounded-full" />
                        <span className={`absolute bottom-0 right-0 block w-3 h-3 ${chat.isOnline ? 'bg-green-400' : 'bg-gray-400'} rounded-full border-2 border-white`}></span>
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-800">{chat.name}</h2>
                        <p className="text-sm text-gray-500">
                            {chat.isOnline ? 'Active now' : 'Not active'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-[#496d74] rounded-full hover:bg-gray-100" title="Start video call">
                        <Video className="w-6 h-6" fill="#496d74" />
                    </button>
                    <button className="p-2 text-[#496d74] rounded-full hover:bg-gray-100" title="Start voice call">
                        <Phone className="w-5 h-5" fill="#496d74" />
                    </button>
                    <button className="p-2 text-[#496d74] rounded-full hover:bg-gray-100" title="More options">
                        <MoreHorizontal className="w-5 h-5" fill="#496d74"/>
                    </button>
                </div>
            </div>

            <div className="h-[calc(100vh-300px)] overflow-y-auto p-6 bg-white no-scrollbar">
                {messages.length > 0 ? (
                    <div className="space-y-6">
                        {messages.map((msg, index) => {
                            const prevMsg = messages[index - 1];
                            const showDateSeparator = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
                            const isCurrentUser = msg.sender === 'You';
                            const senderName = isCurrentUser ? currentUser.name : chat.name;
                            const senderAvatar = isCurrentUser ? currentUser.avatar : chat.avatar;

                            return (
                                <React.Fragment key={index}>
                                    {showDateSeparator && (
                                        <div className="text-center my-2">
                                            <span className="text-xs text-gray-500">
                                                {formatDateSeparator(msg.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <Image src={senderAvatar} alt={senderName} width={40} height={40} className="rounded-full mt-1" />
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-2">
                                                <h4 className="font-semibold text-gray-900">{senderName}</h4>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: msg.text }} />
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-center pb-24">
                        <div className="text-gray-500">
                            <p>This is your first conversation</p>
                            <p>with {chat.name}. Say hi!</p>
                        </div>
                        <span className="text-5xl">👋</span>
                    </div>
                )}
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="px-6 -mt-8 pb-6 bg-white">
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <LexicalComposer initialConfig={editorConfig}>
                        <div className="relative">
                            <RichTextPlugin
                                contentEditable={<ContentEditable className="w-full min-h-[40px] p-3 text-sm text-gray-800 resize-none focus:outline-none" />}
                                placeholder={<div className="absolute top-3 left-3 text-sm text-gray-400 pointer-events-none">Type a message...</div>}
                                ErrorBoundary={CustomErrorBoundary}
                            />
                        </div>
                        <HistoryPlugin />
                        <LinkPlugin />
                        <div className="flex items-center justify-between p-2">
                            <ToolbarPlugin />
                            <ActionsPlugin />
                        </div>
                    </LexicalComposer>
                </div>
            </form>
        </div>
    );
};