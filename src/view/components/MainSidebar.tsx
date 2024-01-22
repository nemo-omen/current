import { FC } from 'hono/jsx';
import { Icon } from './Icon';
import { useRequestContext } from 'hono/jsx-renderer';

export const MainSidebar: FC = () => {
  const c = useRequestContext();
  const { feeds, collections } = c;
  const current = c.req.path;
  
  return (
    <header class="sidebar" id="sidebar-main">
      <nav aria-label="main" id="#sidebar-nav">
      {/* <a href="/" id="main-link">
        Stringer
        <span>
          <Icon name="bolt" />
        </span>
      </a> */}

      <ul>
        <li>
          <MenuLink href="/app" current={current} iconName="list" text="All Posts" />
        </li>
        <li>
          <MenuLink href="/app/collections/unread" current={current} iconName="inbox" text="Unread" />
        </li>
        <li>
          <MenuLink href="/app/collections/reading-list" current={current} iconName="stopwatch" text="Reading List" />
        </li>
        <li>
          <MenuLink href="/app/collections/saved" current={current} iconName="bookmark" text="Saved" />
        </li>
        <li>
          <MenuLink href="/app/notes" current={current} iconName="note" text="Notes" />
        </li>
        <li>
          <MenuLink href="/app/feeds/find" current={current} iconName="add" text="Add Feed" />
        </li>
      </ul>
      </nav>
    </header>
  )
}

const MenuLink: FC = (props) => {
  const { href, current, iconName, text } = props;
  return (
    <a href={href} class={"icon-link" + (current === href ? " current" : "")}>
      <Icon name={iconName} />{text}
    </a>
  );
}