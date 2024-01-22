import { Context } from "hono";
import { html, raw } from "hono/html";
import { SidebarPage } from "../../layout/SidebarPage";
import { addImgSrcOrigins } from "../../../lib/util/addImgSrcOrigins";
import { highlight } from "../../../lib/util/highlight";
import { css, cx, keyframes, Style } from 'hono/css'

export const Post = (c: Context) => {
  const item = c.get('item');
  let imageSrc = undefined;
  if(item.enclosure) {
    if(item.enclosure.type.startsWith('image')) {
      imageSrc = item.enclosure.url;
    }
  }

  return c.render(
    <SidebarPage>
    {/* <TomorrowNightBright /> */}
    <article class="story-article flow post">
      {imageSrc ? <img src={imageSrc} alt={item.title} /> : null}
        <a href={item.link}>
        <h1>
          {item.title}
        </h1>
        </a>
      <time>{new Date(item.pubDate).toLocaleDateString('en-US', {month: 'long', weekday: 'long', day: 'numeric', year: 'numeric'})}</time>
      {item.author ? <p>{item.author}</p> : null}
      <ItemContent content={item.content} link={item.link}/>
      <a href={item.link}>View Original</a>
    </article>
    </SidebarPage>,
    {title: item.title}
  );
}


const ItemContent = async (props) => {
  const doc = await addImgSrcOrigins(props.link, props.content);
  const highlighted = await highlight(doc);

  return(html`
    <div class="content">
      ${raw(highlighted)}
    </div>
  `)
};

const TomorrowNightBright = () => (
html`<style>
/* Tomorrow Night Bright Theme */
/* Original theme - https://github.com/chriskempson/tomorrow-theme */
/* https://jmblog.github.io/color-themes-for-google-code-highlightjs */
.tomorrow-comment,
pre .comment,
pre .title {
  color: #969896;
}

.tomorrow-red,
pre .variable,
pre .attribute,
pre .tag,
pre .regexp,
pre .ruby .constant,
pre .xml .tag .title,
pre .xml .pi,
pre .xml .doctype,
pre .html .doctype,
pre .css .id,
pre .css .class,
pre .css .pseudo {
  color: #d54e53;
}

.tomorrow-orange,
pre .number,
pre .preprocessor,
pre .built_in,
pre .literal,
pre .params,
pre .constant {
  color: #e78c45;
}

.tomorrow-yellow,
pre .class,
pre .ruby .class .title,
pre .css .rules .attribute {
  color: #e7c547;
}

.tomorrow-green,
pre .string,
pre .value,
pre .inheritance,
pre .header,
pre .ruby .symbol,
pre .xml .cdata {
  color: #b9ca4a;
}

.tomorrow-aqua,
pre .css .hexcolor {
  color: #70c0b1;
}

.tomorrow-blue,
pre .function,
pre .python .decorator,
pre .python .title,
pre .ruby .function .title,
pre .ruby .title .keyword,
pre .perl .sub,
pre .javascript .title,
pre .coffeescript .title {
  color: #7aa6da;
}

.tomorrow-purple,
pre .keyword,
pre .javascript .function {
  color: #c397d8;
}

pre code {
  display: block;
  background: var(--background--1);
  color: #eaeaea;
  font-family: Menlo, Monaco, Consolas, monospace;
  line-height: 1.5;
  border: 1px solid #ccc;
  padding: 10px;
}
</style>`)
