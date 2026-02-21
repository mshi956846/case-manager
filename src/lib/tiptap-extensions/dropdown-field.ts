import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DropdownFieldView } from "./dropdown-field-view";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    dropdownField: {
      insertDropdownField: (attrs: {
        fieldType: string;
        label: string;
      }) => ReturnType;
    };
  }
}

export const DropdownField = Node.create({
  name: "dropdownField",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      fieldType: {
        default: "",
      },
      label: {
        default: "",
      },
      selectedValue: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="dropdown-field"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-type": "dropdown-field" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DropdownFieldView);
  },

  addCommands() {
    return {
      insertDropdownField:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              fieldType: attrs.fieldType,
              label: attrs.label,
              selectedValue: "",
            },
          });
        },
    };
  },
});
