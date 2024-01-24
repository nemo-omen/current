import { Context } from 'hono'
import { Search } from './partials/Search';
import { Page } from '../../layout/Page';
import { SearchResultList } from './partials/SearchResultList';
import { useRequestContext } from 'hono/jsx-renderer';
import { FC } from 'hono/jsx';

export const ResultPage = (c: Context) => {
  const feed = c.get('feed');
  return c.render(
    <Page>
      <section class="feed-search">
        <Search />
        {feed ? <SearchResultList /> : <Flash />}
      </section>
    </Page>,
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