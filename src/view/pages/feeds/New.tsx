import { Context } from 'hono'
import { Search } from './partials/Search';
import { Page } from '../../layout/Page';

export const New = (c: Context) => {

  return c.render(
    <>
      <Page>
        <section class="feed-search">
          <Search />
        </section>
      </Page>
    </>,
    {
      title: 'Add Feed'
    }
  )
};