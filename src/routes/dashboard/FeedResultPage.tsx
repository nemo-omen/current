import { Context } from 'hono'
import { MainSidebar } from '../../lib/components/MainSidebar';
import { FeedSearch } from './FeedSearch';
import { FeedResultList } from './FeedResultList';
import { useRequestContext } from 'hono/jsx-renderer';

export const FeedResultPage = (c: Context) => {
  return c.render(
    <>
      <MainSidebar />
      <main>
        <FeedSearch />
        <FeedResultList />
      </main>
    </>,
    {
      title: 'Add Feed'
    }
  )
};