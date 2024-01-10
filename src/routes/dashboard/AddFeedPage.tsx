import { Context } from 'hono'
import { FC } from 'hono/jsx';
import { MainSidebar } from '../../lib/components/MainSidebar';
import { FeedSearch } from './FeedSearch';

export const AddFeedPage = (c: Context) => {

  return c.render(
    <>
      <MainSidebar />
      <main>
        <section class="feed-search">
          <FeedSearch />
        </section>
      </main>
    </>,
    {
      title: 'Add Feed'
    }
  )
};