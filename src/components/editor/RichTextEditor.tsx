import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes } from '@lexical/html';
import { ToolbarPlugin } from './ToolbarPlugin';
import { SetContentPlugin } from './SetContentPlugin';

type Props = {
  initialText?: string;
  placeholder?: string;
  onChangeHtml: (html: string, plainText: string) => void;
  setText?: { text: string; version: number };
};

function Placeholder({ text }: { text: string }) {
  return <div className="rte__placeholder">{text}</div>;
}

export function RichTextEditor({ initialText, placeholder, onChangeHtml, setText }: Props) {
  const initialConfig = {
    namespace: 'board-editor',
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
    theme: {
      text: {
        bold: 'rte-text-bold',
        italic: 'rte-text-italic',
        underline: 'rte-text-underline'
      }
    },
    onError(error: unknown) {
      // Lexical 내부 오류는 런타임에서 확인 가능하도록 throw
      throw error;
    },
    editorState: () => {
      if (!initialText) return;
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode(initialText));
      root.append(p);
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="rte">
        <ToolbarPlugin />
        {setText && <SetContentPlugin text={setText.text} version={setText.version} />}
        <RichTextPlugin
          contentEditable={<ContentEditable className="rte__input" />}
          placeholder={<Placeholder text={placeholder ?? '내용을 입력하세요'} />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <LinkPlugin />
        <ListPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const html = $generateHtmlFromNodes(editor, null);
              const plain = $getRoot().getTextContent();
              onChangeHtml(html, plain);
            });
          }}
        />
      </div>
    </LexicalComposer>
  );
}


