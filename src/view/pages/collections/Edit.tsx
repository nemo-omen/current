import { Context } from "hono";
import { Page } from "../../layout/Page";

export const Edit = (c: Context) => {
  return c.render(
    <>
    <Page>
      <div style="display: flex; flex-direction: column; gap: 2rem; align-items: center;">
        <h1>Your Collections</h1>
      </div>
    </Page>
    </>,
    {title: c.get('pageTitle')}
  );
};