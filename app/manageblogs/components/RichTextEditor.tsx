"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import { createLowlight } from "lowlight";
import { Extension } from "@tiptap/core";

import { forwardRef, useImperativeHandle } from "react";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Image as ImageIcon,
  Link as LinkIcon,
  Link2Off,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* -------------------- LOWLIGHT -------------------- */
const lowlight = createLowlight();

import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import bash from "highlight.js/lib/languages/bash";

lowlight.register("javascript", javascript);
lowlight.register("python", python);
lowlight.register("java", java);
lowlight.register("cpp", cpp);
lowlight.register("bash", bash);

/* -------------------- FONT SIZE EXTENSION -------------------- */
const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

/* -------------------- COMPONENT -------------------- */
const RichTextEditor = forwardRef(
  ({ initialContent = "" }: { initialContent?: string }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({ codeBlock: false }),

        TextStyle,
        FontFamily,
        FontSize,

        Color,
        Highlight,
        Underline,

        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),

        Image.configure({
          inline: false,
          HTMLAttributes: {
            class: "rounded-lg my-6 mx-auto max-w-full h-auto shadow-md",
          },
        }),

        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-500 underline cursor-pointer",
          },
        }),

        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class:
              "bg-zinc-950 text-zinc-100 p-4 rounded-lg font-mono text-sm overflow-auto",
          },
        }),
      ],

      content: initialContent,

      editorProps: {
        attributes: {
          class: "min-h-[400px] p-4 border rounded-md focus:outline-none",
        },
      },

      immediatelyRender: false,
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      setContent: (html: string) => editor?.commands.setContent(html || ""),
    }));

    if (!editor) return null;

    const addImage = () => {
      const url = prompt("Enter image URL");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };

    const addLink = () => {
      const url = prompt("Enter link URL");
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    };

    return (
      <div className="border rounded-md">
        {/* TOOLBAR */}
        <div className="flex flex-wrap gap-1 border-b p-2">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
          >
            <Bold size={16} />
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
          >
            <Italic size={16} />
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
          >
            U
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addLink();
            }}
          >
            <LinkIcon size={16} />
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleLink().run();
            }}
          >
            <Link2Off size={16} />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
          >
            <List size={16} />
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
          >
            <ListOrdered size={16} />
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
            }}
          >
            <Quote size={16} />
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleCodeBlock().run();
            }}
          >
            <Code size={16} />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* ALIGNMENT */}
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().setTextAlign("left").run();
            }}
          >
            Left
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().setTextAlign("center").run();
            }}
          >
            Center
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().setTextAlign("right").run();
            }}
          >
            Right
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().setTextAlign("justify").run();
            }}
          >
            Justify
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* FONT SIZE */}
          <select
            onChange={(e) => {
              e.preventDefault();
              editor
                .chain()
                .focus()
                .setMark("textStyle", {
                  fontSize: e.target.value,
                })
                .run();
            }}
          >
            <option value="">Size</option>
            <option value="16px">Small</option>
            <option value="18px">Medium</option>
            <option value="24px">Large</option>
          </select>

          {/* FONT FAMILY */}
          <select
            onChange={(e) => {
              e.preventDefault();
              editor.chain().focus().setFontFamily(e.target.value).run();
            }}
          >
            <option value="">Font</option>
            <option value="serif">Serif</option>
            <option value="monospace">Mono</option>
            <option value="cursive">Cursive</option>
          </select>

          {/* COLOR */}
          <input
            type="color"
            onChange={(e) => {
              e.preventDefault();
              editor.chain().focus().setColor(e.target.value).run();
            }}
          />

          {/* IMAGE */}
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addImage();
            }}
          >
            <ImageIcon size={16} />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().undo().run();
            }}
          >
            <Undo size={16} />
          </Button>

          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().redo().run();
            }}
          >
            <Redo size={16} />
          </Button>
        </div>

        {/* EDITOR */}
        <EditorContent editor={editor} />
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
