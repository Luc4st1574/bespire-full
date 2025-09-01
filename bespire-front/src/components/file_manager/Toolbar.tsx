"use client";

import { FC, useMemo } from "react";
import { HistoryControls } from "./Toolbar/HistoryControls";
import { FormattingControls } from "./Toolbar/FormattingControls";
import { ZoomControl } from "./Toolbar/ZoomControl";
import { StyleAndFontControls } from "./Toolbar/StyleAndFontControls";
import { AlignmentControl } from "./Toolbar/AlignmentControl";
import { ListControls } from "./Toolbar/ListControls";
import { IndentationControls } from "./Toolbar/IndentationControls";
import { InsertControls } from "./Toolbar/InsertControls";

export interface EditorToolbarProps {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onFormat: (command: string, value?: string | number | boolean) => void;
    activeStyles: Record<string, unknown>;
    zoom: string;
    onZoomChange: (zoom: string) => void;
    currentStyle: string;
    currentFont: string;
    currentSize: string;
    // Update the props for the insert controls
    onInsertLink: (url: string) => void;
    onImageClick: () => void;
    onCodeBlockClick: () => void;
}

export const EditorToolbar: FC<EditorToolbarProps> = ({
    undo, redo, canUndo, canRedo, onFormat, activeStyles,
    zoom, onZoomChange,
    currentStyle, currentFont, currentSize,
    // Destructure the new props
    onInsertLink, onImageClick, onCodeBlockClick
}) => {
    const formattingStyles = useMemo(() => ({
        bold: !!activeStyles.bold,
        italic: !!activeStyles.italic,
        underline: !!activeStyles.underline,
        strike: !!activeStyles.strike,
    }), [activeStyles]);

    const activeList = (activeStyles.list as 'ordered' | 'bullet' | undefined) || null;
    const isChecklist = activeStyles.list === 'checked' || activeStyles.list === 'unchecked';

    return (
        <div className="bg-white rounded-lg shadow-md p-2 flex items-center flex-wrap gap-x-2 gap-y-2 border border-gray-200">
            <HistoryControls undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
            <FormattingControls onFormat={onFormat} activeStyles={formattingStyles} />
            <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
            <StyleAndFontControls
                onFormat={onFormat}
                currentStyle={currentStyle}
                currentFont={currentFont}
                currentSize={currentSize}
            />
            <AlignmentControl onFormat={onFormat} />
            <ListControls onFormat={onFormat} activeList={activeList} />
            <IndentationControls onFormat={onFormat} isChecklist={isChecklist} />
            <InsertControls 
                onInsertLink={onInsertLink} 
                onImageClick={onImageClick} 
                onCodeBlockClick={onCodeBlockClick} 
            />
        </div>
    );
};