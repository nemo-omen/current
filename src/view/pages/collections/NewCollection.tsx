import { Context } from "hono";
import { Page } from "../../layout/Page";

export const NewCollection = (c: Context) => {
  return c.render(
    <>
    <Page>
      <div>
        {/*  */}
      </div>
    </Page>
    </>,
    {title: c.get('pageTitle')}
  );
};