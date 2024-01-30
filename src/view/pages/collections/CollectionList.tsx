import { Context } from "hono";
import { Page } from "../../layout/Page";
import { EntryList } from "../../components/EntryList";

export const CollectionList = (c: Context) => {
  const collectionTitle = c.get('collectionTitle');
  const entries = c.get('entries');

  return c.render(
    <>
    <Page>
      <div>
        <h1>{collectionTitle}</h1>
        <EntryList entries={entries} />
      </div>
    </Page>
    </>,
    {title: c.get('pageTitle')}
  );
};