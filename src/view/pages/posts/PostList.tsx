import { Context } from 'hono'
import { SidebarPage } from '../../layout/SidebarPage';
import { EntryList } from '../../components/EntryList';

export const PostList = (c: Context) => {
  const posts = c.get('posts');
  const pageTitle = c.get('pageTitle');
  // console.log({posts});
  
  return c.render(
    <SidebarPage>
      <EntryList entries={posts} />
    </SidebarPage>,
    {title: pageTitle}
  )
};


