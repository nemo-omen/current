import { rehype } from 'rehype';
import rehypeHighlight from 'rehype-highlight';
import { visit } from 'unist-util-visit';
import { Root } from "hast";
export async function highlight(content: string) {
  // const hl = await shiki.getHighlighter({ theme: 'dracula' });

  // const tree = rehype()
  //   .data('settings', { fragment: true })
  //   .use(() => (hast: Root) => {
  //     visit(
  //       hast,
  //       (node) => {
  //         if (node.tagName === 'pre') {
  //           const hlString = hl.codeToHtml(String(node), { lang: node.properties.dataLang });
  //           const reNode = rehype()
  //             .data('settings', { fragment: true })
  //             .parse(hlString);
  //           node = { ...reNode };
  //         }
  //       }
  //     );
  //   })
  //   .process(content);
  const doc = await rehype()
    .data('settings', { fragment: true })
    .use(rehypeHighlight)
    .process(content);

  return String(doc);
}