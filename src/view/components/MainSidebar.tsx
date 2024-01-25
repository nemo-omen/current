import { FC } from 'hono/jsx';
import { Icon } from './Icon';
import { useRequestContext } from 'hono/jsx-renderer';

export const MainSidebar: FC = () => {
  const c = useRequestContext();
  const { feeds, collections } = c;
  const current = c.req.path;
  
  return (
    <aside class="sidebar" id="sidebar-main">
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
          <MenuLink href="/app/collections/read-later" current={current} iconName="stopwatch" text="Read Later" />
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
      <ul style="border-bottom: none;">
        <li>
          <MenuLink href="/app/collections/new" current={current} iconName="folder_add" text="Add Collection" />
        </li>
      </ul>
      </nav>
    </aside>
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