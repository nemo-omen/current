import { Context } from 'hono'
import { Search } from './partials/Search';
import { Page } from '../../layout/Page';
import { SearchResultList } from './partials/SearchResultList';
import { useRequestContext } from 'hono/jsx-renderer';
import { FC } from 'hono/jsx';

export const ResultPage = (c: Context) => {
  const feedResult = c.get('feedResult');
  return c.render(
    <Page>
      <section class="feed-search">
        <Search />
        {feedResult ? <SearchResultList /> : <Flash />}
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