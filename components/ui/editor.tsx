"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { BubbleMenu } from "@tiptap/react/menus";
import Image from "@tiptap/extension-image";
import { ReactNode } from "react";

import { Heading1 } from "lucide-react";
import { Heading2 } from "lucide-react";
import { Heading3 } from "lucide-react";
import { Bold } from "lucide-react";
import { Italic } from "lucide-react";
import { Strikethrough } from "lucide-react";
import { Code } from "lucide-react";

export default function TipTapEditor({
  editorContent,
  onChangeAction: onEditorChange,
  inputName,
}: {
  editorContent?: string;
  onChangeAction?: (content: string) => void;
  inputName?: string;
}) {
  const editor = useEditor({
    content: editorContent,
    onUpdate: ({ editor }) => {
      if (onEditorChange) onEditorChange(editor.getHTML());
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          openOnClick: true,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https"],
          isAllowedUri: (url, ctx) => {
            try {
              // construct URL
              const parsedUrl = url.includes(":")
                ? new URL(url)
                : new URL(`${ctx.defaultProtocol}://${url}`);

              // use default validation
              if (!ctx.defaultValidate(parsedUrl.href)) {
                return false;
              }

              // disallowed protocols
              const disallowedProtocols = ["ftp", "file", "mailto"];
              const protocol = parsedUrl.protocol.replace(":", "");

              if (disallowedProtocols.includes(protocol)) {
                return false;
              }

              // only allow protocols specified in ctx.protocols
              const allowedProtocols = ctx.protocols.map((p) =>
                typeof p === "string" ? p : p.scheme,
              );

              if (!allowedProtocols.includes(protocol)) {
                return false;
              }

              // disallowed domains
              const disallowedDomains = [
                "example-phishing.com",
                "malicious-site.net",
              ];
              const domain = parsedUrl.hostname;

              if (disallowedDomains.includes(domain)) {
                return false;
              }

              // all checks have passed
              return true;
            } catch {
              return false;
            }
          },
          shouldAutoLink: (url) => {
            try {
              // construct URL
              const parsedUrl = url.includes(":")
                ? new URL(url)
                : new URL(`https://${url}`);

              // only auto-link if the domain is not in the disallowed list
              const disallowedDomains = [
                "example-no-autolink.com",
                "another-no-autolink.com",
              ];
              const domain = parsedUrl.hostname;

              return !disallowedDomains.includes(domain);
            } catch {
              return false;
            }
          },
        },
      }),
      Placeholder.configure({ placeholder: "Write here..." }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose focus:outline-none",
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) {
          return false; // No files to handle
        }

        const file = files[0];
        if (!file.type.startsWith("image/")) {
          return false; // Only handle image files
        }

        const reader = new FileReader();
        reader.onload = () => {
          const base64Image = reader.result as string;
          if (typeof base64Image === "string") {
            const imageNode = view.state.schema.nodes.image.create({
              src: base64Image,
              alt: file.name,
            });
            const transaction = view.state.tr.replaceSelectionWith(imageNode);
            view.dispatch(transaction);
          }
        };
        reader.readAsDataURL(file);
        return true; // Prevent default handling
      },
    },
  });

  return (
    <>
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{
            placement: "bottom-start",
          }}
        >
          <div className="flex items-center p-1 bg-white text-sm rounded-lg border border-purple-300 shadow-lg">
            <BubbleButton style="heading1" editor={editor}>
              <Heading1 size={16} />
            </BubbleButton>
            <BubbleButton style="heading2" editor={editor}>
              <Heading2 size={16} />
            </BubbleButton>
            <BubbleButton style="heading3" editor={editor}>
              <Heading3 size={16} />
            </BubbleButton>
            <Separator />
            <BubbleButton style="bold" editor={editor}>
              <Bold size={16} />
            </BubbleButton>
            <BubbleButton style="italic" editor={editor}>
              <Italic size={16} />
            </BubbleButton>
            <BubbleButton style="strike" editor={editor}>
              <Strikethrough size={16} />
            </BubbleButton>
            <BubbleButton style="code" editor={editor}>
              <Code size={16} />
            </BubbleButton>
          </div>
        </BubbleMenu>
      )}
      <div className="tiptap">
        <EditorContent editor={editor} />
        {inputName && editor && (
          <input type="hidden" name={inputName} value={editor.getHTML()} />
        )}
      </div>
    </>
  );
}

type Style =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "heading1"
  | "heading2"
  | "heading3";

function BubbleButton({
  children,
  style,
  editor,
}: {
  children: ReactNode;
  style: Style;
  editor: Editor;
}) {
  return (
    <button
      className={`px-1 py-1 m-[3px] rounded outline-1 outline-slate-200 hover:outline ${isStyleActive(editor, style) ? "text-strongcolor " : ""}`}
      onClick={() => {
        toggleStyle(style, editor);
      }}
    >
      {children}
    </button>
  );
}

type Level = 1 | 2 | 3;

function isStyleActive(editor: Editor, style: Style): boolean {
  const simpleStyles = ["bold", "italic", "strike", "code"] as const;

  if (simpleStyles.includes(style as any)) {
    return editor.isActive(style);
  }

  if (style.startsWith("heading")) {
    const level = parseInt(style.slice(-1)) as Level;
    return editor.isActive("heading", { level });
  }

  return false;
}

function toggleStyle(style: Style, editor: Editor) {
  const toggleCommands: Record<string, () => void> = {
    bold: () => editor.chain().focus().toggleBold().run(),
    italic: () => editor.chain().focus().toggleItalic().run(),
    strike: () => editor.chain().focus().toggleStrike().run(),
    code: () => editor.chain().focus().toggleCode().run(),
  };

  if (style in toggleCommands) {
    toggleCommands[style]();
    return;
  }

  if (style.startsWith("heading")) {
    const level = parseInt(style.slice(-1)) as Level;
    editor.chain().focus().toggleHeading({ level }).run();
  }
}

function Separator() {
  return <div className="w-px h-6 bg-gray-300 mx-2"></div>;
}
