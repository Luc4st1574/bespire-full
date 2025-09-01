/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import NoteEditorLexical from "../NoteEditorLexical";
import ContextMenu from "../../ui/ContextMenu";

interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  time: string;
}

interface ClientNotesTabProps {
  client?: { id: string; name: string }; // En una implementación real, usaríamos un tipo más específico
}

const ClientNotesTab: React.FC<ClientNotesTabProps> = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Market Pitch",
      content:
        "In our pitch, we will clearly outline the main objectives, supported by compelling statistics that highlight current market trends. We will present case studies that showcase successful outcomes and share testimonials from satisfied clients. Additionally, we will emphasize our unique selling propositions that distinguish us from the competition.",
      author: "Wilma Ramirez",
      date: "Jan 28, 2025",
      time: "1:26 pm",
    },
  ]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const handleAddNote = (title: string, content: string) => {
    if (editingNote) {
      // Actualizar nota existente
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, title, content }
          : note
      ));
      setEditingNote(null);
    } else {
      // Crear nueva nota
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        author: "Current User", // En una implementación real, obtendríamos esto del contexto de usuario
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setNotes([newNote, ...notes]);
    }
    setIsEditorOpen(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setIsEditorOpen(false);
  };

  const toggleExpanded = (noteId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Notes</h2>
        <button
          onClick={() => setIsEditorOpen(true)}
          className="border rounded-full px-3 py-1 text-sm flex items-center gap-1 hover:bg-gray-50"
        >
          Add <span>+</span>
        </button>
      </div>

      {isEditorOpen && (
        <NoteEditorLexical
          onSave={handleAddNote}
          onCancel={editingNote ? handleCancelEdit : () => setIsEditorOpen(false)}
          initialTitle={editingNote?.title}
          initialContent={editingNote?.content}
          isEditing={!!editingNote}
        />
      )}

      {notes.length === 0 && !isEditorOpen && (
        <div className="text-center py-8 text-gray-500">
          <p>
            No notes yet. Click &quot;Add +&quot; to create your first note.
          </p>
        </div>
      )}

      {notes.map((note) => {
        const isExpanded = expandedNotes.has(note.id);
        const shouldShowToggle = note.content.length > 150;
        
        // Ocultar la nota si está siendo editada
        if (editingNote && editingNote.id === note.id) {
          return null;
        }

        return (
          <div
            key={note.id}
            className="border border-green-gray-100 bg-green-gray-25 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">{note.title}</h3>
              <ContextMenu
                onEdit={() => handleEditNote(note)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            </div>
            <div className="flex gap-2 text-xs items-center mb-2 border-b border-green-gray-100 pb-2">
              <span className="bg-pale-green-300 p-2 rounded-lg">Notes</span>
              <span className="font-semibold text-green-gray-800">
                {note.author}
              </span>
              <span>
                {note.date}, {note.time}
              </span>
            </div>
            <p className="text-sm text-green-gray-950">
              {isExpanded ? note.content : truncateText(note.content)}
            </p>
            {shouldShowToggle && (
              <button
                onClick={() => toggleExpanded(note.id)}
                className="text-sm text-green-gray-800 mt-2 hover:text-green-gray-950"
              >
                {isExpanded ? (
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Show less</span>
                    <img
                      src="/assets/icons/ChevronDown.svg"
                      alt=""
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Show more </span>
                    <img src="/assets/icons/ChevronDown.svg" alt="" />
                  </div>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClientNotesTab;
