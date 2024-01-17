import { Context } from 'hono'
import { FC } from 'hono/jsx';
import { MainSidebar } from '../../lib/components/MainSidebar';
import { Icon } from '../../lib/components/Icon';
import { useRequestContext } from 'hono/jsx-renderer';
import { Header } from '../../lib/components/Header';
export const Dashboard = (c: Context) => {
  const dashboardItems = c.get('dashboardItems');
  const itemCount = c.get('itemCount');
  return c.render(
    <>
      <Header />
      <MainSidebar />
      <ItemList items={dashboardItems} />
    </>,
    {
      title: 'Dashboard'
    }
  )
};


const ItemList: FC = (props) => {
  const {items} = props;
  return (
    <main>
      <section class="dashboard-items-list">
        {items.map((item) => (<ItemCard item={item} />))}
      </section>
    </main>
  );
};

const ItemCard: FC = (props) => {
  const { item } = props;
  const { enclosure } = item;
  let image;
  if(enclosure) {
    if(enclosure.type.startsWith('image')) {
      image = enclosure.url
    }
  }

  return(
    <article class="item-card">
      {image ? <img src={image} alt={item.title} class="item-card-thumbnail" /> : <div class="thumbnail-placeholder"><Icon name="bolt" /></div>}
      <section class="item-card-content">
        <div class="item-card-header">
          <h2>{item.title}</h2>
        </div>
        <div class="item-card-text">
          <p>
            {item.contentSnippet.substring(0, 256)}
          </p>
        </div>
        <div class="item-card-footer">
          <div class="item-card-footer-meta item-card-footer-row">
            <div class="item-card-footer-title-container">
              <h3 class="item-card-footer-title">{item.feedTitle}</h3>
            </div>
            <time>{new Date(item.pubDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', weekday: 'long', year: 'numeric'})}</time>
          </div>
          <div class="item-card-footer-actions item-card-footer-row">
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
    </article>
  );
};