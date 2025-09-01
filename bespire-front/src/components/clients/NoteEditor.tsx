import React, { useState, useRef } from 'react';
import { Bold, Italic, Underline, Link, Paperclip, AtSign, Smile } from 'lucide-react';

interface NoteEditorProps {
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    const titleText = title.trim();
    const contentText = contentRef.current?.textContent?.trim() || '';
    
    if (titleText && contentText) {
      onSave(titleText, contentText);
      setTitle('');
      setContent('');
      if (contentRef.current) {
        contentRef.current.innerHTML = '';
      }
    }
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      const textContent = contentRef.current.textContent || '';
      setContent(textContent);
    }
  };

  const applyFormat = (command: string) => {
    document.execCommand(command, false);
    contentRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      contentRef.current?.focus();
    }
  };

  return (
    <div className="comment-editor-container">
      {/* Title Input */}
      <input
        type="text"
        placeholder="Title of the Note"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="px-4 py-3 text-base font-medium border-none outline-none placeholder-gray-400 border-b border-gray-200"
        style={{ borderRadius: '12px 12px 0 0' }}
      />
      
      {/* Content Editor */}
      <div className="editor-inner">
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning={true}
          onInput={handleContentChange}
          className="editor-input"
          style={{ minHeight: '100px' }}
        />
        {!content && (
          <div className="editor-placeholder">Write notes...</div>
        )}
      </div>
      
      {/* Toolbar and Actions */}
      <div className="comment-toolbar-wrapper">
        <div className="toolbar">
          <button 
            className="toolbar-item" 
            onClick={() => applyFormat('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            className="toolbar-item" 
            onClick={() => applyFormat('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button 
            className="toolbar-item" 
            onClick={() => applyFormat('underline')}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button 
            className="toolbar-item" 
            onClick={insertLink}
            title="Insert Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button 
            className="toolbar-item" 
            onClick={() => {/* TODO: Implement file upload */}}
            title="Attach File"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button 
            className="toolbar-item" 
            onClick={() => {/* TODO: Implement mention */}}
            title="Mention"
          >
            <AtSign className="w-4 h-4" />
          </button>
          <button 
            className="toolbar-item" 
            onClick={() => {/* TODO: Implement emoji picker */}}
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
