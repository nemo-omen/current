import { Context } from 'hono'
import { SidebarPage } from '../../layout/SidebarPage';
import { EntryList } from '../../components/EntryList';
import { FC } from 'hono/jsx';

export const FeedPage = (c: Context) => {
  const feed = c.get('feed');
  const entries = feed.entries;
  const pageTitle = c.get('pageTitle');
  console.log({feed});
  
  return c.render(
    <SidebarPage>
      <section class="feed-page">
        <FeedInfo feed={feed} />
        <EntryList entries={entries} />
      </section>
    </SidebarPage>,
    {title: pageTitle}
  )
};


const FeedInfo: FC = ({feed}) => {
  return (
    <>
      <h1>{feed.title}</h1>
    </>
  )
}