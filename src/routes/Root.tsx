import { Context } from 'hono'
import { Header } from '../lib/components/Header';
export const Root = (c: Context) => c.render(
    <Header />,
    {
      title: ''
    }
);