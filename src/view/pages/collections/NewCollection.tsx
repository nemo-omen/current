import { Context } from "hono";
import { Page } from "../../layout/Page";

export const NewCollection = (c: Context) => {
  return c.render(
    <>
    <Page>
      <div>
        <h1>Create a New Collection</h1>
      </div>
    </Page>
    </>,
    {title: c.get('pageTitle')}
  );
};