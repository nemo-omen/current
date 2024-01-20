import { Context } from 'hono'
import { Page } from '../../layout/Page';
import { ItemList } from '../../components/ItemList';

export const List = (c: Context) => {
  const posts = c.get('posts');
  const pageTitle = c.get('pageTitle');
  // const itemCount = c.get('itemCount');
  return c.render(
    <Page>
      <ItemList items={posts} />
    </Page>,
    {title: 'All Posts'}
  )
};


