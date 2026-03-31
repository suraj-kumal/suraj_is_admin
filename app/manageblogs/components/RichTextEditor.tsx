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

    return (
      <div className="border rounded-md">
        {/* TOOLBAR */}
        <div className="flex flex-wrap gap-1 border-b p-2">
          <Button onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </Button>

          <Button onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </Button>

          <Button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            U
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </Button>

          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} />
          </Button>

          <Button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={16} />
          </Button>

          <Button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code size={16} />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* ALIGNMENT */}
          <Button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            L
          </Button>
          <Button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            C
          </Button>
          <Button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            R
          </Button>
          <Button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            J
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* FONT SIZE */}
          <select
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .setMark("textStyle", {
                  fontSize: e.target.value,
                })
                .run()
            }
          >
            <option value="">Size</option>
            <option value="14px">Small</option>
            <option value="18px">Medium</option>
            <option value="24px">Large</option>
          </select>

          {/* FONT FAMILY */}
          <select
            onChange={(e) =>
              editor.chain().focus().setFontFamily(e.target.value).run()
            }
          >
            <option value="">Font</option>
            <option value="serif">Serif</option>
            <option value="monospace">Mono</option>
            <option value="cursive">Cursive</option>
          </select>

          {/* COLOR */}
          <input
            type="color"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />

          {/* IMAGE */}
          <Button onClick={addImage}>
            <ImageIcon size={16} />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button onClick={() => editor.chain().focus().undo().run()}>
            <Undo size={16} />
          </Button>

          <Button onClick={() => editor.chain().focus().redo().run()}>
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
