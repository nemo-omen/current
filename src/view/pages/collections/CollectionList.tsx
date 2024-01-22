import { Context } from "hono";
import { Page } from "../../layout/Page";

export const CollectionList = (c: Context) => {
  const collectionTitle = c.get('collectionTitle');
  return c.render(
    <>
    <Page>
      <div style="display: flex; flex-direction: column; gap: 2rem; align-items: center;">
        <h1>{collectionTitle}</h1>
      </div>
    </Page>
    </>,
    {title: c.get('pageTitle')}
  );
};