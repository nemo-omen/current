import { Context } from 'hono'
import { FC } from 'hono/jsx';
import { MainSidebar } from '../../lib/components/MainSidebar';
import { useRequestContext } from 'hono/jsx-renderer';
export const Dashboard = (c: Context) => {
  const dashboardItems = c.get('dashboardItems');
  const itemCount = c.get('itemCount');
  return c.render(
    <>
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
      {image ? <img src={image} alt={item.title} class="item-card-thumbnail" /> : null}
      <section class="item-card-content">
        <div class="item-card-header">
          <h2>{item.title}</h2>
        </div>
        <div class="item-card-text">
          
        </div>
        <div class="item-card-footer">
          <div class="item-card-footer-title-container">
            <h3 class="item-card-footer-title">{item.feedTitle}</h3>
          </div>
          <time>{new Date(item.pubDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', weekday: 'long', year: 'numeric'})}</time>
        </div>
      </section>
    </article>
  );
};