// app/components/editor/ToolbarPlugin.tsx
"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $isTextNode,
  $getRoot,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";

import BoldIcon from "@/components/editor/icons/bold.svg";
import ItalicIcon from "@/components/editor/icons/italic.svg";
import UnderlineIcon from "@/components/editor/icons/underline.svg";
import LinkIcon from "@/components/editor/icons/link.svg";
import PaperclipIcon from "@/components/editor/icons/attach-outline.svg";
import AtIcon from "@/components/editor/icons/at.svg";
import SmileIcon from "@/components/editor/icons/face-smile.svg";
import EmojiPicker from "@/components/ui/EmojiPicker";



// (La función getSelectedNode se mantiene igual que antes)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSelectedNode(selection: any) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isTextNode(focusNode) ? focusNode : focus.getNode();
  } else {
    return $isTextNode(anchorNode) ? anchorNode : anchor.getNode();
  }
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
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
        1
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt("Enter the URL:");
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const handleAttachment = () => {
    alert("Lógica para adjuntar un archivo no implementada.");
  };

  const insertEmoji = (emoji: string) => {
    console.log('Inserting emoji:', emoji); // Debug
    
    // Primero asegurar que el editor tenga foco
    editor.focus();
    
    editor.update(() => {
      const selection = $getSelection();
      console.log('Selection:', selection); // Debug
      
      if ($isRangeSelection(selection)) {
        selection.insertText(emoji);
        console.log('Inserted via selection'); // Debug
      } else {
        console.log('No range selection, creating one'); // Debug
        // Si no hay selección, crear una al final del documento
        const root = $getRoot();
        const lastChild = root.getLastChild();
        if (lastChild) {
          lastChild.selectEnd();
          const newSelection = $getSelection();
          if ($isRangeSelection(newSelection)) {
            newSelection.insertText(emoji);
            console.log('Inserted via new selection'); // Debug
          }
        }
      }
    });
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={"toolbar-item " + (isBold ? "active" : "")}
        aria-label="Format Bold"
      >
       <BoldIcon />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={"toolbar-item " + (isItalic ? "active" : "")}
        aria-label="Format Italic"
      >
        <ItalicIcon />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={"toolbar-item " + (isUnderline ? "active" : "")}
        aria-label="Format Underline"
      >
        <UnderlineIcon />
      </button>
      <button
        onClick={insertLink}
        className={"toolbar-item " + (isLink ? "active" : "")}
        aria-label="Insert Link"
      >
        <LinkIcon />
      </button>
      <button
        onClick={handleAttachment}
        className="toolbar-item"
        aria-label="Attach File"
      >
        <PaperclipIcon />
      </button>
       <button
        onClick={() => alert("Escribe '@' para probar las menciones.")}
        className="toolbar-item"
        aria-label="Mention"
      >
        <AtIcon />
      </button>
      <div className="relative">
        <button
          ref={emojiButtonRef}
          onClick={toggleEmojiPicker}
          className={"toolbar-item " + (isEmojiPickerOpen ? "active" : "")}
          aria-label="Insert Emoji"
        >
          <SmileIcon />
        </button>
        <EmojiPicker
          isOpen={isEmojiPickerOpen}
          onEmojiSelect={insertEmoji}
          onClose={() => setIsEmojiPickerOpen(false)}
          buttonRef={emojiButtonRef}
        />
      </div>
    </div>
  );
}