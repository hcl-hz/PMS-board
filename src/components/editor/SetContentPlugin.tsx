import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';

type Props = {
  text: string;
  version: number;
};

export function SetContentPlugin({ text, version }: Props) {
  const [editor] = useLexicalComposerContext();
  const lastApplied = useRef<number>(0);

  useEffect(() => {
    if (version <= lastApplied.current) return;
    lastApplied.current = version;

    editor.update(() => {
      const root = $getRoot();
      root.clear();
      
      const lines = text.split('\n');
      lines.forEach(line => {
        const p = $createParagraphNode();
        p.append($createTextNode(line));
        root.append(p);
      });
    });
  }, [editor, text, version]);

  return null;
}


