import { Context } from "hono";
import { html, raw } from "hono/html";
import { Page } from "../../layout/Page";
import { useRequestContext } from "hono/jsx-renderer";
import { Fragment } from "hono/jsx/jsx-runtime";
import * as htmlparser2 from 'htmlparser2';

export const Post = (c: Context) => {
  const item = c.get('item');
  let imageSrc = undefined;
  if(item.enclosure) {
    if(item.enclosure.type.startsWith('image')) {
      imageSrc = item.enclosure.url;
    }
  }

  return c.render(
    <Page>
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
      <a href={item.link}>Read More</a>
    </article>
    </Page>,
    {title: item.title}
  );
}

const ItemContent = (props) => {
  return(html`
    <div class="content">
      ${raw(props.content)}
    </div>
  `)
};