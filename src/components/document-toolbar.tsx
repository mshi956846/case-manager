"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Calendar,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { InsertFieldMenu } from "@/components/insert-field-menu";

interface DocumentToolbarProps {
  editor: Editor | null;
}

export function DocumentToolbar({ editor }: DocumentToolbarProps) {
  const [fieldMenuOpen, setFieldMenuOpen] = useState(false);

  if (!editor) return null;

  const items = [
    {
      group: "history",
      buttons: [
        {
          icon: Undo,
          label: "Undo",
          action: () => editor.chain().focus().undo().run(),
          active: false,
          disabled: !editor.can().undo(),
        },
        {
          icon: Redo,
          label: "Redo",
          action: () => editor.chain().focus().redo().run(),
          active: false,
          disabled: !editor.can().redo(),
        },
      ],
    },
    {
      group: "formatting",
      buttons: [
        {
          icon: Bold,
          label: "Bold",
          action: () => editor.chain().focus().toggleBold().run(),
          active: editor.isActive("bold"),
          disabled: false,
        },
        {
          icon: Italic,
          label: "Italic",
          action: () => editor.chain().focus().toggleItalic().run(),
          active: editor.isActive("italic"),
          disabled: false,
        },
        {
          icon: Underline,
          label: "Underline",
          action: () => editor.chain().focus().toggleUnderline().run(),
          active: editor.isActive("underline"),
          disabled: false,
        },
      ],
    },
    {
      group: "headings",
      buttons: [
        {
          icon: Heading1,
          label: "Heading 1",
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          active: editor.isActive("heading", { level: 1 }),
          disabled: false,
        },
        {
          icon: Heading2,
          label: "Heading 2",
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          active: editor.isActive("heading", { level: 2 }),
          disabled: false,
        },
        {
          icon: Heading3,
          label: "Heading 3",
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          active: editor.isActive("heading", { level: 3 }),
          disabled: false,
        },
      ],
    },
    {
      group: "alignment",
      buttons: [
        {
          icon: AlignLeft,
          label: "Align Left",
          action: () => editor.chain().focus().setTextAlign("left").run(),
          active: editor.isActive({ textAlign: "left" }),
          disabled: false,
        },
        {
          icon: AlignCenter,
          label: "Align Center",
          action: () => editor.chain().focus().setTextAlign("center").run(),
          active: editor.isActive({ textAlign: "center" }),
          disabled: false,
        },
        {
          icon: AlignRight,
          label: "Align Right",
          action: () => editor.chain().focus().setTextAlign("right").run(),
          active: editor.isActive({ textAlign: "right" }),
          disabled: false,
        },
        {
          icon: AlignJustify,
          label: "Justify",
          action: () => editor.chain().focus().setTextAlign("justify").run(),
          active: editor.isActive({ textAlign: "justify" }),
          disabled: false,
        },
      ],
    },
    {
      group: "lists",
      buttons: [
        {
          icon: List,
          label: "Bullet List",
          action: () => editor.chain().focus().toggleBulletList().run(),
          active: editor.isActive("bulletList"),
          disabled: false,
        },
        {
          icon: ListOrdered,
          label: "Ordered List",
          action: () => editor.chain().focus().toggleOrderedList().run(),
          active: editor.isActive("orderedList"),
          disabled: false,
        },
      ],
    },
  ];

  return (
    <div className="flex items-center gap-0.5 flex-wrap border-b p-2 bg-muted/30">
      {items.map((group, gi) => (
        <div key={group.group} className="flex items-center gap-0.5">
          {gi > 0 && <Separator orientation="vertical" className="mx-1 h-6" />}
          {group.buttons.map((btn) => (
            <Button
              key={btn.label}
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                btn.active && "bg-accent text-accent-foreground"
              )}
              onClick={btn.action}
              disabled={btn.disabled}
              title={btn.label}
              type="button"
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      ))}

      {/* Insert Date & Field */}
      <Separator orientation="vertical" className="mx-1 h-6" />
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().insertDate().run()}
          title="Insert Date"
          type="button"
        >
          <Calendar className="h-4 w-4" />
        </Button>

        <Popover open={fieldMenuOpen} onOpenChange={setFieldMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Insert Field"
              type="button"
            >
              <ListFilter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <InsertFieldMenu
              editor={editor}
              onClose={() => setFieldMenuOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
