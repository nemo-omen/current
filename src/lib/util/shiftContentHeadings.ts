import { rehype } from 'rehype';
import { Root } from "hast";
import { visit } from "unist-util-visit";
import rehypeShiftHeading from 'rehype-shift-heading';

export async function shiftContentHeadings(content: string) {
  const doc = await rehype()
    .data('settings', { fragment: true })
    .use(rehypeShiftHeading, { shift: 1 })
    .process(content);

  return (String(doc));
}