import { rehype } from 'rehype';
import rehypeHighlight from 'rehype-highlight';

export async function highlight(content: string) {
  const doc = await rehype()
    .data('settings', { fragment: true })
    .use(rehypeHighlight)
    .process(content);

  return String(doc);
}