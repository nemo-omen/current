import { Context } from 'hono'
import { MainSidebar } from '../../lib/components/MainSidebar';
import { FeedSearch } from './FeedSearch';
import { FeedResultList } from './FeedResultList';
import { useRequestContext } from 'hono/jsx-renderer';
import { FC } from 'hono/jsx';
import { Header } from '../../lib/components/Header';

export const FeedResultPage = (c: Context) => {
  const feed = c.get('feed');
  return c.render(
    <>
      <Header />
      <MainSidebar />
      <main>
        <section class="feed-search">
          <FeedSearch />
          {feed ? <FeedResultList /> : <Flash />}
        </section>
      </main>
    </>,
    {
      title: 'Add Feed'
    }
    )
  };
  
export const Flash: FC = () => {
  const c = useRequestContext();
  const session = c.get('session');
  const error = session.get('error') || '';
  return (
    <div class="flash">
      {error && <p class="flash error">{error}</p>}
    </div>
  );
}