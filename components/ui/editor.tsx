"use client";

import { EditorContent, Extension, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { BubbleMenu } from "@tiptap/react/menus";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import Image from "@tiptap/extension-image";
import { Fragment, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  Bold,
  Check,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Type,
  Undo2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MAX_BASE64_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

export type TipTapEditorProps = {
  editorContent?: string;
  onChangeAction?: (content: string) => void;
  inputName?: string;
  /** Reports user-facing editor errors (e.g. rejected image drop) to the parent. */
  onError?: (message: string) => void;
};

/**
 * Rejects dropped images that are too large to inline as base64 (they would
 * bloat the stored HTML) and reports the reason through `onError`. Small
 * images are inlined at the drop position, as before.
 */
function createImageDropGuard(onError?: (message: string) => void) {
  return Extension.create({
    name: "imageDropGuard",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("imageDropGuard"),
          props: {
            handleDrop(view, event) {
              const files = event.dataTransfer?.files;
              if (!files || files.length === 0) return false;

              const file = files[0];
              if (!file.type.startsWith("image/")) return false;

              // Always stop the browser default (e.g. opening the file).
              event.preventDefault();

              if (file.size > MAX_BASE64_IMAGE_SIZE) {
                onError?.(
                  `"${file.name}" is larger than 2 MB. Please choose a smaller image.`,
                );
                return true;
              }

              const reader = new FileReader();
              reader.onload = () => {
                const base64Image = reader.result;
                if (typeof base64Image === "string") {
                  const imageNode = view.state.schema.nodes.image.create({
                    src: base64Image,
                    alt: file.name,
                  });
                  view.dispatch(view.state.tr.replaceSelectionWith(imageNode));
                }
              };
              reader.readAsDataURL(file);
              return true;
            },
          },
        }),
      ];
    },
  });
}

function createExtensions(onError?: (message: string) => void) {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      link: {
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        isAllowedUri: (url: string, ctx) => {
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
        shouldAutoLink: (url: string) => {
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
    Placeholder.configure({
      // Headings get their own placeholder so empty H1-H3 guide the writer.
      placeholder: ({ node }) =>
        node.type.name === "heading"
          ? `Heading ${node.attrs.level}`
          : "Write here…",
    }),
    CharacterCount,
    Image.configure({
      inline: false,
      allowBase64: true,
    }),
    createImageDropGuard(onError),
  ];
}

type ToolbarItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Rich-text editor for blog posts (TipTap v3).
 *
 * - Sticky toolbar grouped into blocks / inline marks / lists / insert / history.
 *   Active commands use accent styling; unavailable commands are disabled.
 * - A bubble menu offers inline formatting for non-empty text selections
 *   (hidden inside code blocks and on image selections).
 * - Links and remote images are inserted through inline inputs that unfold
 *   under the toolbar; images dropped onto the editor are inlined as base64
 *   up to 2 MB, larger files are rejected via `onError`.
 * - The footer shows live word and character counts.
 */
export default function TipTapEditor({
  editorContent,
  onChangeAction: onEditorChange,
  inputName,
  onError,
}: TipTapEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    content: editorContent,
    onUpdate: ({ editor }) => {
      if (onEditorChange) onEditorChange(editor.getHTML());
    },
    extensions: createExtensions(onError),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose focus:outline-hidden",
      },
    },
  });

  // `useEditor` no longer re-renders on transactions in v3, so all toolbar /
  // footer state is selected here (deep-compared) to keep the UI in sync.
  const editorState = useEditorState({
    editor,
    selector: (snapshot) => {
      const e = snapshot.editor;
      if (!e) return null;

      return {
        isParagraph: e.isActive("paragraph"),
        isHeading1: e.isActive("heading", { level: 1 }),
        isHeading2: e.isActive("heading", { level: 2 }),
        isHeading3: e.isActive("heading", { level: 3 }),
        isBold: e.isActive("bold"),
        isItalic: e.isActive("italic"),
        isStrike: e.isActive("strike"),
        isCode: e.isActive("code"),
        isBulletList: e.isActive("bulletList"),
        isOrderedList: e.isActive("orderedList"),
        isBlockquote: e.isActive("blockquote"),
        isCodeBlock: e.isActive("codeBlock"),
        isLink: e.isActive("link"),
        hasSelection: !e.state.selection.empty,
        canHeading1: e.can().chain().focus().toggleHeading({ level: 1 }).run(),
        canHeading2: e.can().chain().focus().toggleHeading({ level: 2 }).run(),
        canHeading3: e.can().chain().focus().toggleHeading({ level: 3 }).run(),
        canBold: e.can().chain().focus().toggleBold().run(),
        canItalic: e.can().chain().focus().toggleItalic().run(),
        canStrike: e.can().chain().focus().toggleStrike().run(),
        canCode: e.can().chain().focus().toggleCode().run(),
        canBulletList: e.can().chain().focus().toggleBulletList().run(),
        canOrderedList: e.can().chain().focus().toggleOrderedList().run(),
        canBlockquote: e.can().chain().focus().toggleBlockquote().run(),
        canCodeBlock: e.can().chain().focus().toggleCodeBlock().run(),
        canUndo: e.can().chain().focus().undo().run(),
        canRedo: e.can().chain().focus().redo().run(),
        words: e.storage.characterCount.words(),
        characters: e.storage.characterCount.characters(),
      };
    },
  });

  useEffect(() => {
    if (showLinkInput) linkInputRef.current?.focus();
  }, [showLinkInput]);

  useEffect(() => {
    if (showImageInput) imageInputRef.current?.focus();
  }, [showImageInput]);

  const openLinkInput = () => {
    if (!editor) return;
    setLinkUrl((editor.getAttributes("link").href as string) ?? "");
    setShowImageInput(false);
    setShowLinkInput(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();

    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }

    setShowLinkInput(false);
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const openImageInput = () => {
    setImageUrl("");
    setShowLinkInput(false);
    setShowImageInput(true);
  };

  const applyImage = () => {
    if (!editor) return;
    const url = imageUrl.trim();

    if (url) {
      const filename = url.split("/").pop()?.split(/[?#]/)[0] || "image";
      editor.chain().focus().setImage({ src: url, alt: filename }).run();
    }

    setImageUrl("");
    setShowImageInput(false);
  };

  const groups: ToolbarItem[][] =
    editor && editorState
      ? [
          [
            {
              key: "paragraph",
              label: "Normal text",
              icon: Type,
              active: editorState.isParagraph,
              onClick: () => editor.chain().focus().setParagraph().run(),
            },
            {
              key: "heading1",
              label: "Heading 1",
              icon: Heading1,
              active: editorState.isHeading1,
              disabled: !editorState.canHeading1,
              onClick: () =>
                editor.chain().focus().toggleHeading({ level: 1 }).run(),
            },
            {
              key: "heading2",
              label: "Heading 2",
              icon: Heading2,
              active: editorState.isHeading2,
              disabled: !editorState.canHeading2,
              onClick: () =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
            },
            {
              key: "heading3",
              label: "Heading 3",
              icon: Heading3,
              active: editorState.isHeading3,
              disabled: !editorState.canHeading3,
              onClick: () =>
                editor.chain().focus().toggleHeading({ level: 3 }).run(),
            },
          ],
          [
            {
              key: "bold",
              label: "Bold",
              icon: Bold,
              active: editorState.isBold,
              disabled: !editorState.canBold,
              onClick: () => editor.chain().focus().toggleBold().run(),
            },
            {
              key: "italic",
              label: "Italic",
              icon: Italic,
              active: editorState.isItalic,
              disabled: !editorState.canItalic,
              onClick: () => editor.chain().focus().toggleItalic().run(),
            },
            {
              key: "strike",
              label: "Strikethrough",
              icon: Strikethrough,
              active: editorState.isStrike,
              disabled: !editorState.canStrike,
              onClick: () => editor.chain().focus().toggleStrike().run(),
            },
            {
              key: "code",
              label: "Inline code",
              icon: Code,
              active: editorState.isCode,
              disabled: !editorState.canCode,
              onClick: () => editor.chain().focus().toggleCode().run(),
            },
          ],
          [
            {
              key: "bulletList",
              label: "Bullet list",
              icon: List,
              active: editorState.isBulletList,
              disabled: !editorState.canBulletList,
              onClick: () => editor.chain().focus().toggleBulletList().run(),
            },
            {
              key: "orderedList",
              label: "Numbered list",
              icon: ListOrdered,
              active: editorState.isOrderedList,
              disabled: !editorState.canOrderedList,
              onClick: () => editor.chain().focus().toggleOrderedList().run(),
            },
            {
              key: "blockquote",
              label: "Quote",
              icon: Quote,
              active: editorState.isBlockquote,
              disabled: !editorState.canBlockquote,
              onClick: () => editor.chain().focus().toggleBlockquote().run(),
            },
            {
              key: "codeBlock",
              label: "Code block",
              icon: Code2,
              active: editorState.isCodeBlock,
              disabled: !editorState.canCodeBlock,
              onClick: () => editor.chain().focus().toggleCodeBlock().run(),
            },
          ],
          [
            {
              key: "link",
              label: "Insert link",
              icon: LinkIcon,
              active: editorState.isLink,
              disabled: !editorState.isLink && !editorState.hasSelection,
              onClick: openLinkInput,
            },
            {
              key: "image",
              label: "Insert image from URL",
              icon: ImageIcon,
              onClick: openImageInput,
            },
            {
              key: "horizontalRule",
              label: "Horizontal rule",
              icon: Minus,
              onClick: () => editor.chain().focus().setHorizontalRule().run(),
            },
          ],
          [
            {
              key: "undo",
              label: "Undo",
              icon: Undo2,
              disabled: !editorState.canUndo,
              onClick: () => editor.chain().focus().undo().run(),
            },
            {
              key: "redo",
              label: "Redo",
              icon: Redo2,
              disabled: !editorState.canRedo,
              onClick: () => editor.chain().focus().redo().run(),
            },
          ],
        ]
      : [];

  return (
    <div>
      {editor && editorState && (
        <div className="sticky top-[calc(var(--header-offset)+3.75rem)] z-10 mb-4 rounded-lg border bg-surface/95 px-1.5 py-1 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-x-0.5">
            {groups.map((group, index) => (
              <Fragment key={index}>
                {index > 0 && <ToolbarSeparator />}
                {group.map((item) => (
                  <ToolbarButton
                    key={item.key}
                    label={item.label}
                    icon={item.icon}
                    active={item.active}
                    disabled={item.disabled}
                    onClick={item.onClick}
                  />
                ))}
              </Fragment>
            ))}
          </div>

          {showLinkInput && (
            <form
              className="mt-1.5 flex items-center gap-1.5 border-t pt-1.5"
              onSubmit={(event) => {
                event.preventDefault();
                applyLink();
              }}
            >
              <LinkIcon size={14} className="ml-1 shrink-0 text-text-muted" />
              <input
                ref={linkInputRef}
                type="text"
                inputMode="url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setShowLinkInput(false);
                }}
                placeholder="https://example.com — leave empty to unlink"
                aria-label="Link URL"
                className="h-8 min-w-0 flex-1 rounded-md border bg-surface px-2 text-sm transition-colors placeholder:text-text/30 focus:border-accent/40 focus:outline-none"
              />
              {editorState.isLink && (
                <button
                  type="button"
                  onClick={removeLink}
                  title="Remove link"
                  aria-label="Remove link"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <Link2Off size={15} />
                </button>
              )}
              <button
                type="submit"
                title="Apply link"
                aria-label="Apply link"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-accent transition-colors hover:bg-accent/10"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                onClick={() => setShowLinkInput(false)}
                title="Cancel"
                aria-label="Cancel"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
              >
                <X size={15} />
              </button>
            </form>
          )}

          {showImageInput && (
            <form
              className="mt-1.5 flex items-center gap-1.5 border-t pt-1.5"
              onSubmit={(event) => {
                event.preventDefault();
                applyImage();
              }}
            >
              <ImageIcon size={14} className="ml-1 shrink-0 text-text-muted" />
              <input
                ref={imageInputRef}
                type="text"
                inputMode="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setShowImageInput(false);
                }}
                placeholder="https://example.com/image.jpg"
                aria-label="Image URL"
                className="h-8 min-w-0 flex-1 rounded-md border bg-surface px-2 text-sm transition-colors placeholder:text-text/30 focus:border-accent/40 focus:outline-none"
              />
              <button
                type="submit"
                title="Insert image"
                aria-label="Insert image"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-accent transition-colors hover:bg-accent/10"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                onClick={() => setShowImageInput(false)}
                title="Cancel"
                aria-label="Cancel"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
              >
                <X size={15} />
              </button>
            </form>
          )}
        </div>
      )}

      {editor && (
        <BubbleMenu
          editor={editor}
          options={{
            placement: "bottom-start",
          }}
          shouldShow={({ editor, state }) => {
            // Only for non-empty text selections — never inside code blocks
            // or on selected images, where inline marks make no sense.
            if (state.selection.empty) return false;
            if (editor.isActive("codeBlock") || editor.isActive("image")) {
              return false;
            }
            return true;
          }}
          className="flex items-center gap-0.5 rounded-lg border bg-surface p-1 shadow-lg"
        >
          <ToolbarButton
            label="Bold"
            icon={Bold}
            active={editorState?.isBold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="Italic"
            icon={Italic}
            active={editorState?.isItalic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="Strikethrough"
            icon={Strikethrough}
            active={editorState?.isStrike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <ToolbarButton
            label="Inline code"
            icon={Code}
            active={editorState?.isCode}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />
          <ToolbarSeparator />
          <ToolbarButton
            label="Link"
            icon={LinkIcon}
            active={editorState?.isLink}
            onClick={openLinkInput}
          />
        </BubbleMenu>
      )}

      <div className="tiptap">
        <EditorContent editor={editor} />
      </div>

      {editorState && (
        <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-text-muted">
          <span>
            {editorState.words.toLocaleString()}{" "}
            {editorState.words === 1 ? "word" : "words"}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {editorState.characters.toLocaleString()}{" "}
            {editorState.characters === 1 ? "character" : "characters"}
          </span>
        </div>
      )}

      {inputName && editor && (
        <input type="hidden" name={inputName} value={editor.getHTML()} />
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  icon: Icon,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      // Keep the editor selection / focus when a toolbar button is clicked.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={clsx(
        "grid h-8 w-8 place-items-center rounded-md transition-colors",
        active ? "bg-accent/10 text-accent" : "text-text-muted",
        !disabled && !active && "hover:bg-surface-2 hover:text-text",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <Icon size={16} />
    </button>
  );
}

function ToolbarSeparator() {
  return <div aria-hidden="true" className="mx-1 h-5 w-px bg-muted" />;
}
