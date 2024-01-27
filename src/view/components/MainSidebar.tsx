import { FC } from 'hono/jsx';
import { Icon } from './Icon';
import { useRequestContext } from 'hono/jsx-renderer';

export const MainSidebar: FC = () => {
  const c = useRequestContext();
  const userFeeds = c.get('userFeeds');
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

        {userFeeds.map((feed) => {
          if(!feed.logo && !feed.icon) {
            return(<li>
              <MenuLink href={`/app/feeds/${feed.title.split(' ').join('-').toLowerCase()}`} iconName="logo" text={feed.title} iconColor="complement" />
            </li>)
          } else {
            if(feed.logo !== null) {
              return(<li>
                <MenuLink href={`/app/feeds/${feed.title.split(' ').join('-').toLowerCase()}`} logoSrc={feed.logo.uri} text={feed.title} />
              </li>)
            } else if(feed.icon !== null) {
              return(<li>
                <MenuLink href={`/app/feeds/${feed.title.split(' ').join('-').toLowerCase()}`} logoSrc={feed.icon.uri} text={feed.title} />
              </li>)
            }
          }
        })}
      </ul>
      </nav>
    </aside>
  )
}

const MenuLink: FC = (props) => {
  const { href, current, iconName, text, logoSrc, iconColor } = props;
  if(iconName) {
    return (
      <a href={href} class={"icon-link" + (current === href ? " current" : "")} style={iconColor ? `color: var(--${iconColor})` : ''}>
          <Icon name={iconName} /><span style="color: var(--foreground);">{text}</span>
      </a>
    );
  }

  if(logoSrc) {
    return (
      <a href={href} class={"icon-link" + (current === href ? " current" : "")}>
        <div class="image-icon">
          <image src={logoSrc} alt="text" style="width: 1em; height: 1em; background-color: var(--foreground); border-radius: 50%; aspect-ratio: 1;" />
        </div>
        {text}
      </a>
    );
  }
}