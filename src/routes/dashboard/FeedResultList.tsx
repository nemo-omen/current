import { Fragment, FC } from "hono/jsx";
import { html, raw } from 'hono/html';
import { useRequestContext } from "hono/jsx-renderer";
import { FeedItem } from "../../model/FeedItem";
export const FeedResultList: FC = () => {
  const c = useRequestContext();
  const feed = c.get('feed');
  console.log({feed});
  return (
    <article>
      <h2>{feed.title}</h2>
      {feed.items.map((item) => FeedItemCard(item))}
    </article>
  )
}

const FeedItemCard = (props: FeedItem) => {
  const dateString = new Date(props.pubDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', weekday: 'long', year: 'numeric'});
  return(
    <article>
      <h3>{props.title}</h3>
      <time>{dateString}</time>
      <section>
       <p>
        {props.contentSnippet}
       </p>
      </section>
    </article>);
}