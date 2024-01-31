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
  const error = session.get('error') || '';
  const message = session.get('message') || '';
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
          <HeaderControl />

          <div class="flash">
            {error && <p class="flash error">{error}</p>}
            {message && <p class="flash message">{message}</p>}
          </div>
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
  return (
    <div class="header-control">
      <button class="icon-link-button">
        <Icon name="checkbox_circle_outline" />
      </button>
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