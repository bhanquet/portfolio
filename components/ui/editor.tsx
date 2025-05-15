"use client";

import {
  useEditor,
  EditorContent,
  isMarkActive,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ReactNode } from "react";

export default function Editor(): ReactNode {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg m-5 focus:outline-none",
      },
    },
  });

  return (
    <>
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="px-1 bg-white text-sm rounded-xl border shadow-lg">
            <BubbleButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={isMarkActive(editor.view.state, "bold")}
            >
              Bold
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
            >
              Italic
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
            >
              Stike
            </BubbleButton>
          </div>
        </BubbleMenu>
      )}
      <div className="rounded border shadow">
        <EditorContent editor={editor} />
      </div>
    </>
  );
}

function BubbleButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      className={`px-2 py-1 m-1 rounded-xl outline-1 outline-slate-200 hover:outline ${active ? "bg-strongcolor text-white" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
