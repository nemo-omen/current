import { Context } from 'hono'
import { SidebarPage } from '../../layout/SidebarPage';
import { ItemList } from '../../components/ItemList';

export const List = (c: Context) => {
  const posts = c.get('posts');
  const pageTitle = c.get('pageTitle');
  // const itemCount = c.get('itemCount');
  return c.render(
    <SidebarPage>
      <ItemList items={posts} />
    </SidebarPage>,
    {title: 'All Posts'}
  )
};


