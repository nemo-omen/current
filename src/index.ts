import Database from 'bun:sqlite';
import { Context, Hono, Next } from 'hono';
import { serveStatic } from 'hono/bun';
import { csrf } from 'hono/csrf';
import { jsxRenderer } from 'hono/jsx-renderer';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { HtmlEscapedString } from 'hono/utils/html';
import { Session, sessionMiddleware, CookieStore } from 'hono-sessions';
import { BunSqliteStore } from 'hono-sessions/bun-sqlite-store';
import auth from './routes/auth';
import root from './routes';
import stories from './routes/stories';
import { Base } from './view/layout/Base';
import BaseController from './controller/BaseController';
import AppController from './controller/AppController';
import AuthController from './controller/AuthController';

const app = new Hono<{ Variables: { session: Session, session_key_rotation: boolean; }; }>(
);

const db = new Database('./frosty.sqlite');
const store = new BunSqliteStore(db);
// const store = new CookieStore();

declare module 'hono' {
  interface ContextRenderer {
    (content: Promise<HtmlEscapedString> | HtmlEscapedString, props: { title: string; }): Response;
  }
}

app.use('*', logger());
app.use('/public/*', serveStatic({ root: './' }));
// app.use('*', secureHeaders());
app.use('*', csrf({ origin: 'http://localhost:3000' }));
app.use('*', sessionMiddleware({
  store,
  encryptionKey: "some_password_that_is_at_least_thirty_two_characters_long",
  expireAfterSeconds: 1800, // 30min
  cookieOptions: {
    sameSite: 'Strict',
    path: '/',
    httpOnly: true,
    secure: true,
  },
}));

app.use(
  '*',
  jsxRenderer(
    ({ children, title }) => Base({ children, title }),
    { docType: true }
  ),
);

app.route('/', BaseController);
app.route('/auth', AuthController);
app.route('/app', AppController);

export default app;
