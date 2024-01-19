import { FC } from "hono/jsx";
import { Icon } from "./Icon";

export const ItemCard: FC = (props) => {
  const { item } = props;
  const { enclosure } = item;
  let image;
  if(enclosure) {
    if(enclosure.type.startsWith('image')) {
      image = enclosure.url
    }
  }

  return(
    <li class="item-card">
      <a href={`/app/posts/${item.id}`}>
      {/* TODO: Replace bolt icon with site favicon, if possible */}
      {image ? <img src={image} alt={item.title} class="item-card-thumbnail" /> : <div class="thumbnail-placeholder"><Icon name="bolt" /></div>}
      <section class="item-card-content">
        <h2 class="item-card-header">{item.title}</h2>
        <p class="item-card-text">
          {item.contentSnippet.substring(0, 256)}
        </p>
        <div class="item-card-footer">
          <div class="item-card-footer-meta item-card-footer-row">
            <div class="item-card-footer-title-container">
              <h3 class="item-card-footer-title">{item.feedTitle}</h3>
            </div>
            <time>{new Date(item.pubDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', weekday: 'long', year: 'numeric'})}</time>
          </div>
          <div class="item-card-footer-actions item-card-footer-row">
            {/* TODO: Make this a nav? */}
            <ul class="item-card-menu">
              <li>
                <a class="icon-link" href={`/items/tags/${item.id}`}>
                  <Icon name="tag" />
                </a>
              </li>
              <li>
                <form action="/items/read-later/" method="post">
                  <input type="hidden" name="readLaterId" />
                  <button class="icon-link-button" type="submit">
                    <Icon name="stopwatch" />
                  </button>
                </form>
              </li>
              <li>
                <form action="/items/bookmark" method="post">
                  <input type="hidden" name="bookmarkId" />
                  <button class="icon-link-button" type="submit">
                    <Icon name="bookmark" />
                  </button>
                </form>
              </li>
              <li>
                <a class="icon-link" href={`/items/collect/${item.id}`}>
                  <Icon name="folder_add" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
      </a>
    </li>
  );
};