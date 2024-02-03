import { FC } from 'hono/jsx';
import { useRequestContext } from 'hono/jsx-renderer';
import { Icon } from './Icon';

export const Header: FC = () => {
  const c = useRequestContext();
  const session = c.get('session');
  const sessionUser = session.get('user');
  if(sessionUser) {
    return authedHeader({sessionUser});
  }
  return unAuthedHeader();
}

const BaseHeader: FC = ({children}) => {
  const c = useRequestContext();
  const session = c.get('session');
  const user = session.get('user');
  const error = session.get('error') || '';
  const message = session.get('message') || '';
  const feed = c.get('feed');
  
  let title: string | undefined = c.get('pageTitle');
  
  if(feed) {
    title = feed.title;
    // console.log({title});
  }

  return(
    <header>
      <div class="header-inner">
        <a href="/" id="main-link">
          <span>
            <Icon name="logo" />
          </span>
          Current
        </a>
        <div class="header-container">
          {title && <h1>{title}</h1>}
          <div class="flash">
            {error && <p class="error">{error}</p>}
            {message && <p class="message">{message}</p>}
          </div>
          {user && feed && <HeaderControl />}
        </div>

        <nav aria-label="main">
          {children}
        </nav>
      </div>
    </header>
  )
}

const HeaderControl: FC = (props) => {
  const c = useRequestContext();
  const feed = c.get('feed');
  // console.log({feed});
  return (
    <div class="header-control">
      <button class="icon-link-button">
        <Icon name="checkbox_circle_outline" />
      </button>
      <form action="/app/feeds/unsubscribe" class="icon-form" style="font-size: inherit;">
        <input type="hidden" name="feedId" value={feed.id} />
        <button class="icon-link-button" type="submit">
          <Icon name="trash" />
        </button>
      </form>
    </div>
  )
}

const authedHeader = ({sessionUser}) => (
  <BaseHeader>
    <ul>
      <li><a href={`/profile/${sessionUser.id}`}>{sessionUser.email}</a></li>
      <li>
        <form action="/auth/logout" method="POST">
          <button type="submit" class="button-link">Log Out</button>
        </form>
      </li>
    </ul>
  </BaseHeader>
)

const unAuthedHeader = () => (
  <BaseHeader>
    <ul>
      <li><a href="/auth/login">Login</a></li>
      <li><a href="/auth/signup">Signup</a></li>
    </ul>
  </BaseHeader>
)