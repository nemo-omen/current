# Stringer
A news reader with productivity enhancements.

__Dear lord! I've just discovered that someone else has an RSS reader named Stringer. I'm crestfallen (but happy for them!). Time to come up with a different name.__

## Backend
This is in its earliest stages. Right now, the server uses Hono with Bun's SQLite. It may not stay that way. I might use Go.

## Frontend
I don't think this app will have heavy enough interactivity to warrant a front-end framework, so I'm probably going to default to SSR with some HTMX (and maybe Alpine) thrown in. That could change.

## Features
- Subscribe to RSS/Atom feeds (duh)
- Mark stories as read/unread
- Bookmark stories
- Tag stories, feeds, and collections
- Add stories and feeds to collections
  - Predefined collections: "Reading List," "Bookmarked"
  - User-defined collections
- Search
- Add annotations and notes to stories
  - Or, just create a note without attaching it
- Alerts (email, desktop)
  - By feed
  - By keyword
  - Related to story (?) -- prompt user to pick key words/phrases
  - Reading list reminders (?)
- Create feed from search term (?)

## Possible Names
- [x] Stringer
- Brief


## Routes
/feeds
 |--/add
/posts
 |--/all
 |--/unread
 |--/read
 |--/bookmarks (favorites?)
 |--/:slug | :id
/collections
 |--/read-later
 |--/saved (same as bookmarks?)
 |--/:slug | :id
/notes
 |--/:slug | :id
/auth
 |--/login
 |--/logout
/account
 |--/:username-slug
     |/profile