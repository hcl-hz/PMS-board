import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';

type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [format, setFormat] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false
  });

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          setFormat({
            bold: selection.hasFormat('bold'),
            italic: selection.hasFormat('italic'),
            underline: selection.hasFormat('underline')
          });
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return (
    <div className="rte__toolbar" role="toolbar" aria-label="에디터 도구">
      <button
        type="button"
        className={`rte__tool ${format.bold ? 'is-active' : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        굵게
      </button>
      <button
        type="button"
        className={`rte__tool ${format.italic ? 'is-active' : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        기울임
      </button>
      <button
        type="button"
        className={`rte__tool ${format.underline ? 'is-active' : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        밑줄
      </button>
    </div>
  );
}


