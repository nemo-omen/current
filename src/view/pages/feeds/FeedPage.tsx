import { Context } from 'hono'
import { SidebarPage } from '../../layout/SidebarPage';
import { EntryList } from '../../components/EntryList';
import { FC } from 'hono/jsx';
import { CurrentFeed } from '../../../model/CurrentFeed';

export const FeedPage = (c: Context) => {
  const feed = c.get('feed');
  const entries = feed.entries;
  const pageTitle = c.get('pageTitle');
  const view = c.get('view') || 'all';
  // console.log({feed});
  
  return c.render(
    <SidebarPage>
      <section class="feed-page">
        {/* <FeedHeader feed={feed} view={view} /> */}
        <EntryList entries={entries} />
      </section>
    </SidebarPage>,
    {title: pageTitle}
  )
};

const FeedHeader: FC = ({feed, view}) => {
  return (
    <>
      <header class="feed-header">
        <h1>{feed.title}</h1>
        <span>View: {view}</span>
      </header>
    </>
  )
}

const FeedInfo: FC = ({feed}) => {
  return (
    <>
      <h1>{feed.title}</h1>
    </>
  )
}