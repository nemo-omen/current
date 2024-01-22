import { Context } from "hono";
import { Page } from "../../layout/Page";

export const None = (c: Context) => {
  return c.render(
    <>
    <Page>
      <div style="display: flex; flex-direction: column; gap: 2rem; align-items: flex-start;">
        <h1>You're Not Following any Feeds</h1>
        <a href="/app/feeds/new" class="button">Find a Feed Now</a>
      </div>
    </Page>
    </>,
    {title: c.get('pageTitle')}
  );
};