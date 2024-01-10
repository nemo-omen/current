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
        <section class="feed-search">
          <FeedSearch />
          <FeedResultList />
        </section>
      </main>
    </>,
    {
      title: 'Add Feed'
    }
  )
};