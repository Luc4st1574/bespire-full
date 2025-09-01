/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import ToolbarPlugin from "../editor/ToolbarPlugin";
import { editorTheme } from "../editor/theme";
import { editorNodes } from "../editor/nodes";
import { useState } from "react";
import { $getRoot, EditorState, $createParagraphNode, $createTextNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef } from "react";
import Button from "../ui/Button";

const editorConfig: InitialConfigType = {
  namespace: "NoteEditor",
  theme: editorTheme,
  onError(error: Error) {
    throw error;
  },
  nodes: editorNodes,
};

interface NoteEditorLexicalProps {
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialContent?: string;
  isEditing?: boolean;
}

// Componente interno para los botones de acción
function NoteSubmitButtonPlugin({
  isEditorEmpty,
  title,
  onSave,
  onCancel,
  isEditing,
}: {
  isEditorEmpty: boolean;
  title: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  isEditing?: boolean;
}) {
  const [editor] = useLexicalComposerContext();

  const handleClearEditor = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
    });
    editor.focus();
  }, [editor]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    editor.update(() => {
      const editorState = editor.getEditorState();
      const textContent = editorState.read(() => $getRoot().getTextContent());
      
      if (textContent.trim()) {
        onSave(title.trim(), textContent.trim());
        handleClearEditor();
      }
    });
  };

  const isDisabled = !title.trim() || isEditorEmpty;

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onCancel}
        type="button"
        variant="outlineG"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSave}
        disabled={isDisabled}
        type="button"
        variant="green2"
      >
        {isEditing ? 'Save Note' : 'Add Note'}
      </Button>
    </div>
  );
}

export default function NoteEditorLexical({ 
  onSave, 
  onCancel, 
  initialTitle = '', 
  initialContent = '',
  isEditing = false
}: NoteEditorLexicalProps) {
  const [isEditorEmpty, setIsEditorEmpty] = useState(!initialContent);
  const [title, setTitle] = useState(initialTitle);

  const onChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      
      if (children.length > 1) {
        setIsEditorEmpty(false);
        return;
      }
      const firstChild = children[0];
      setIsEditorEmpty(firstChild ? root.getTextContent() === "" : true);
    });
  };

  const handleSaveComplete = (noteTitle: string, noteContent: string) => {
    onSave(noteTitle, noteContent);
    setTitle(''); // Limpiar el título también
  };

  // Plugin para inicializar contenido cuando estamos editando
  function InitialContentPlugin({ content }: { content: string }) {
    const [editor] = useLexicalComposerContext();
    const hasInitialized = useRef(false);
    
    useEffect(() => {
      if (content && isEditing && !hasInitialized.current) {
        hasInitialized.current = true;
        // Solo ejecutar una vez al montar cuando estamos editando
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(content);
          paragraph.append(textNode);
          root.append(paragraph);
        });
      }
    }, [editor, content]);

    return null;
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="comment-editor-container">
        {/* Campo de título */}
        <input
          type="text"
          placeholder="Title of the Note"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 text-base font-semibold  outline-none placeholder-gray-400  "
          style={{ borderRadius: '12px 12px 0 0' }}
        />
        <div className=" border-b border-green-gray-100 ml-4 mr-4">

        </div>
        
        {/* Editor de contenido */}
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">Write notes...</div>}
            //@ts-ignore
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {!isEditing && <AutoFocusPlugin />}
          <LinkPlugin />
          <OnChangePlugin onChange={onChange} />
          <InitialContentPlugin content={initialContent} />
        </div>
        
        {/* Toolbar y botones */}
        <div className="comment-toolbar-wrapper">
          <ToolbarPlugin />
          <NoteSubmitButtonPlugin
            isEditorEmpty={isEditorEmpty}
            title={title}
            onSave={handleSaveComplete}
            onCancel={onCancel}
            isEditing={isEditing}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}
