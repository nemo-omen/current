import { Fragment, FC } from "hono/jsx";
import { html, raw } from 'hono/html';
import { useRequestContext } from "hono/jsx-renderer";
import { FeedItem } from "../../model/FeedItem";
export const FeedResultList: FC = () => {
  const c = useRequestContext();
  const feed = c.get('feed');
  // console.log({feed});
  return (
    <section class="search-results">
      <div class="results-header">
        <div class="header-info">
          {(feed.image ? FeedImg(feed.image) : null) }
          <h2>{feed.title}</h2>
        </div>
        <form action="/dashboard/new/subscribe" method="POST">
          <input type="url" name="subscriptionUrl" id="subscriptionUrl" hidden value={feed.feedUrl} />
        </form>
      </div>
      <div class="results-list">
        {feed.items.map((item) => FeedItemCard(item))}
      </div>
    </section>
  )
}

const FeedImg = (props: {url: string, link?: string, title?: string, width?: number, height?: number}) => {
  const { url, link, title, width, height } = props;
  return (
    <img src={url} alt={title} width={width} height={height} class="feed-image" />
  );
}

const FeedItemCard = (props: FeedItem) => {
  const dateString = new Date(props.pubDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', weekday: 'long', year: 'numeric'});
  return(
    <article class="feed-item">
      <h3>{props.title}</h3>
      <time>{dateString}</time>
      <section>
       <p>
        {props.contentSnippet}
       </p>
      </section>
    </article>);
}