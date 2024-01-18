import { Context } from "hono";
import { Header } from "../../lib/components/Header";
import { MainSidebar } from "../../lib/components/MainSidebar";
import { html } from "hono/html";

export const Story = (c: Context) => {
  const item = c.get('item');
  let imageSrc = undefined;
  if(item.enclosure) {
    if(item.enclosure.type.startsWith('image')) {
      imageSrc = item.enclosure.url;
    }
  }

  return c.render(
    <>
    <Header />
    <MainSidebar />
    <main>
    <article class="story-article">
      {imageSrc ? <img src={imageSrc} alt={item.title} /> : null}
      <h1>{item.title}</h1>
      <time>{new Date(item.pubDate).toLocaleDateString('en-US', {month: 'long', weekday: 'long', day: 'numeric', year: 'numeric'})}</time>
      {item.author ? <p>{item.author}</p> : null}
      {html(item.content)}
    </article>
    </main>
    </>,
    {title: 'More dookie'}
  );
}