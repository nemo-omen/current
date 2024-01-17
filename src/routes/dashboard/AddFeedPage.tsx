import { Context } from 'hono'
import { FC } from 'hono/jsx';
import { MainSidebar } from '../../lib/components/MainSidebar';
import { FeedSearch } from './FeedSearch';
import { Header } from '../../lib/components/Header';

export const AddFeedPage = (c: Context) => {

  return c.render(
    <>
      <Header />
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