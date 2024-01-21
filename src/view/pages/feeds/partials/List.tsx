import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import { StringerItem } from "../../../../model/StringerItem";
import { Feed, Entry, Image, Text } from '@nooptoday/feed-rs';
import { html } from "hono/html";
import { HtmlEscapedString } from "hono/utils/html";

export const List: FC = () => {
  const c = useRequestContext();
  const feed: Feed = c.get('feed');
  const entry = feed.entries[0];
  // let image = feed.image ? feed.image : null;
  return (
    <section class="search-results">
      <div class="results-header">
        <div class="results-header-info">
          {(feed.logo ? FeedImg(feed.logo) : null) }
          <h2>{feed.title?.content}</h2>
        </div>
        <form action="/app/feeds/subscribe" method="POST">
          <input type="url" name="subscriptionUrl" id="subscriptionUrl" hidden value={feed.feedUrl} />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <div class="results-list">
      {/* <pre><code>{JSON.stringify(entry, null, 4)}</code></pre> */}
        {feed.entries.map((entry) => FeedItemCard(entry))}
      </div>
    </section>
  )
}

const FeedImg = (logo: Image) => {
  const { uri, title, link, width, height, description } = logo;
  return (
    <img src={uri} alt={title ? title : description ? description : ''} width={width} height={height} class="feed-image" />
  );
}

const FeedItemCard = async (entry: Entry) => {
  const dateString = new Date(entry.updated!).toLocaleDateString('en-US', {month: 'long', day: 'numeric', weekday: 'long', year: 'numeric'});
  
  return(
    <article class="feed-item">
      <h3>{entry.title?.content}</h3>
      <time>{dateString}</time>
      <section>
       <p>
        {entry.summary ? html(entry.summary.content) : ''}
       </p>
      </section>
    </article>);
}