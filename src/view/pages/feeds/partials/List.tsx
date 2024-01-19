import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import { StringerItem } from "../../../../model/StringerItem";

export const List: FC = () => {
  const c = useRequestContext();
  const feed = c.get('feed');
  let image = feed.image ? feed.image : null;
  return (
    <section class="search-results">
      <div class="results-header">
        <div class="results-header-info">
          {(feed.image ? FeedImg(feed.image) : null) }
          <h2>{feed.title}</h2>
        </div>
        <form action="/app/feeds/subscribe" method="POST">
          <input type="url" name="subscriptionUrl" id="subscriptionUrl" hidden value={feed.feedUrl} />
          <button type="submit">Subscribe</button>
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

const FeedItemCard = (props: StringerItem) => {
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