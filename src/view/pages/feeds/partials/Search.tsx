import { Context } from 'hono';
import { FC } from 'hono/jsx';
import { useRequestContext } from 'hono/jsx-renderer';

export const Search: FC = () => {
  const c: Context = useRequestContext();
  // Grab the url from the previously
  // submitted form (if exists).
  // We'll set it as the search form value
  // so there's continuity between page loads.
  const searchUrl: string = c.get('searchUrl');
  return (
    <form action="/app/feeds/new" method="POST" class="feed-search-form">
      <label for="feedurl">Search for a Feed</label>
      <input type="text" name="feedurl" id="feedurl" value={searchUrl} />
      <button type="submit">Search</button>
    </form>
  );
};