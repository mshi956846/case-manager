import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DateNodeView } from "./date-node-view";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    dateNode: {
      insertDate: (attrs?: { format?: "long" | "short" }) => ReturnType;
    };
  }
}

export const DateNode = Node.create({
  name: "dateNode",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      date: {
        default: new Date().toISOString(),
      },
      format: {
        default: "long" as "long" | "short",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="date-node"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-type": "date-node" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DateNodeView);
  },

  addCommands() {
    return {
      insertDate:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              date: new Date().toISOString(),
              format: attrs?.format ?? "long",
            },
          });
        },
    };
  },
});
