/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

//@ts-ignore
export default function LexicalEditor({ onChange }) {
  const initialConfig = {
    namespace: "MyEditor",
    theme: {
      // puedes customizar tu theme aquí
      paragraph: "my-paragraph-class",
    },
    //@ts-ignore
    onError: (e) => { throw e },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="border p-2 rounded" />}
        placeholder={<div className="text-gray-400">Write a comment...</div>}
        //@ts-ignore
        ErrorBoundary={undefined}      />
      <HistoryPlugin />
      <OnChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
}
