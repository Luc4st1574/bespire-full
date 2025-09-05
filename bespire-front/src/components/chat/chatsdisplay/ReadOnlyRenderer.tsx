"use client";

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { editorConfig } from './ChatInput';

interface ReadOnlyRendererProps {
    // The type is now more specific for clarity
    editorState: { root: object };
}

// 👇 FIX: Changed 'obj: any' to 'obj: unknown' for type safety
const isLexicalState = (obj: unknown): obj is { root: object } => {
    return !!obj && typeof obj === 'object' && 'root' in obj;
};

export default function ReadOnlyRenderer({ editorState }: ReadOnlyRendererProps) {
    if (!isLexicalState(editorState)) {
        return null; 
    }

    const initialConfig = {
        ...editorConfig,
        editable: false,
        editorState: JSON.stringify(editorState),
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="relative">
                <RichTextPlugin
                    contentEditable={<ContentEditable className="outline-none" />}
                    placeholder={null}
                    ErrorBoundary={() => <></>}
                />
            </div>
        </LexicalComposer>
    );
}