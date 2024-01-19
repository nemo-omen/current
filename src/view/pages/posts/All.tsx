import { Context } from 'hono'
import { Page } from '../../layout/Page';
import { ItemList } from '../../components/ItemList';

export const All = (c: Context) => {
  const dashboardItems = c.get('dashboardItems');
  // const itemCount = c.get('itemCount');
  return c.render(
    <Page>
      <ItemList items={dashboardItems} />
    </Page>,
    {title: 'All Posts'}
  )
};


