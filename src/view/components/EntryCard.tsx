import { FC } from "hono/jsx";
import { Icon } from "./Icon";
import { html } from "hono/html";

export const EntryCard: FC = (props) => {
  const { entry } = props;
  let image;
  // if(enclosure) {
  //   if(enclosure.type.startsWith('image')) {
  //     image = enclosure.url
  //   }
  // }

  return(
    <li class="item-card">
      <a href={`/app/posts/${entry.id}`}>
      {/* TODO: Replace bolt icon with site favicon, if possible */}
      {image ? <img src={image} alt={entry.title} class="item-card-thumbnail" /> : <div class="thumbnail-placeholder"><Icon name="bolt" /></div>}
      <section class="item-card-content">
        <h2 class="item-card-header">{entry.title}</h2>
        <p class="item-card-text">
          {html(entry.summary)}
        </p>
        <div class="item-card-footer">
          <div class="item-card-footer-meta item-card-footer-row">
            <div class="item-card-footer-title-container">
              <h3 class="item-card-footer-title">{entry.feedTitle}</h3>
            </div>
            <time>{new Date(entry.published).toLocaleDateString('en-US', {month: 'long', day: 'numeric', weekday: 'long', year: 'numeric'})}</time>
          </div>
          <div class="item-card-footer-actions item-card-footer-row">
            {/* TODO: Make this a nav? */}
            <ul class="item-card-menu">
              <li>
                <a class="icon-link" href={`/items/tags/${entry.id}`}>
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
                <a class="icon-link" href={`/items/collect/${entry.id}`}>
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