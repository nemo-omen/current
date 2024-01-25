import { rehype } from 'rehype';
import { Root } from "hast";
import { visit } from "unist-util-visit";

export async function addImgSrcOrigins(link: string, content: string) {
  let hostURL: URL;
  try {
    hostURL = new URL(link);
  } catch (err) {
    return;
  }
  const origin = hostURL.origin;

  const doc = await rehype()
    .data('settings', { fragment: true })
    .use(() => (hast: Root) => {
      visit(
        hast,
        (node) => {
          if (node.tagName === 'img') {
            const imgSrc = node.properties.src;
            if (!imgSrc.startsWith(origin) && !link.startsWith('http')) {
              node.properties.src = origin + imgSrc;
            }
          }
        }
      );
    }).process(content);

  return (String(doc));
}