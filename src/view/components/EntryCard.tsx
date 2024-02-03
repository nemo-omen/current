import { FC } from "hono/jsx";
import { Icon } from "./Icon";

export const EntryCard: FC = (props) => {
  const { entry } = props;

  let cardDate: Date | undefined;
  if(entry.published) {
    cardDate = entry.published;
  } else if(entry.updated) {
    cardDate = entry.updated;
  } else {
    cardDate = undefined;
  }
  const dateString = cardDate 
    ? cardDate.toLocaleDateString(
      'en-US',
      {month: 'numeric',day: 'numeric',year: 'numeric'}
    ) 
    : '';

  let summary: string = '';
  if(entry.summary) {
    if(entry.summary.length > 256) {
      summary = entry.summary.substring(0, 256) + '...';
    } else {
      summary = entry.summary;
    }
  }

  return(
    <li class={(entry.read ? "read " : "") + "item-card"}>
      <article class="item-container">
        <a href={`/app/posts/${entry.id}`}>
          <CardThumbnail
            featuredImage={entry.featuredImage}
            media={entry.media}
            logo={entry.feedLogo}
            icon={entry.feedIcon}
            title={entry.title}
            feedTitle={entry.feedTitle}
            />
        </a>
        <section class="item-card-content">
          <a href={`/app/posts/${entry.id}`}>
            <h2>{entry.title}</h2>
          </a>
            <div class="item-card-row">
              <time>{dateString}</time>
              <h3 class="item-card-feed-title">{entry.feedTitle}</h3>
            </div>
            <div class="item-card-body">
              <a href={`/app/posts/${entry.id}`} class="item-card-text">
                {/* <p> */}
                  {summary}
                {/* </p> */}
              </a>
            </div>
          <CardFooter entry={entry} cardDate={cardDate} />
        </section>
      </article>
    </li>
  );
};

const CardThumbnail: FC = ({featuredImage, media, logo, icon, title, feedTitle}) => {
  let mediaContent, feedLogo, feedIcon = undefined;
  if(media) {
    if(media.length > 0) {
      const firstMediaObject = media[0];
      mediaContent = firstMediaObject.content[0];
    }
  }

  if (logo) {
    feedLogo = logo;
  }

  if(icon) {
    feedIcon = icon;
  }

  let image: {src: string, alt: string} | undefined = undefined;

  if(featuredImage) {
    image = {src: featuredImage, alt: title};
  } else {
    if(mediaContent) {
      if(mediaContent.contentType) {
        if(mediaContent.contentType.startsWith('image')) {
          image = {src: mediaContent.url, alt: title}
        }
      }
    }
  }


  // TODO: Return different media representations
  //       depending on contentType
  return (
    <div class="post-thumbnail-container">
      {
        image
          ? <img src={image.src} alt={image.alt} class="item-card-thumbnail" />
          : feedLogo ? <div class="thumbnail-placeholder"><image src={feedLogo.uri} alt={feedTitle} class="thumbnail-logo" /></div>
            : feedIcon ? <div class="thumbnail-placeholder"><image src={feedIcon.uri} alt={feedTitle} class="thumbnail-logo" /></div>
              : <div class="thumbnail-placeholder"><Icon name="logo" /></div>
      }
    </div>
  );
}

const CardFooter: FC = ({entry, cardDate}) => {
  return (
    <div class="item-card-footer">
      <CardMenu entry={entry} />
    </div>
  )
}

const CardMenu: FC = ({entry}) => {
  return (
    <ul class="item-card-menu">
      <li class="tooltip-container">
        <a class="icon-link" href={`/items/tags/${entry.id}`} aria-label="Add Tags">
          <Icon name="tag" />
        </a>
        <span role="status" class="tooltip">Add Tags</span>
      </li>
      <li class="tooltip-container">
        <form action="/app/collections/add-entry" method="post">
          <input type="hidden" name="entryId" value={entry.id} />
          <input type="hidden" name="collectionName" value="Read Later" />
          <button class="icon-link-button" type="submit" aria-label="Bookmark Post">
            <Icon name="bookmark" />
            {/* <Icon name="stopwatch" /> */}
          </button>
        <span role="status" class="tooltip">Bookmark Post</span>
        </form>
      </li>
      <li class="tooltip-container">
        <form action="/app/collections/add-entry" method="post">
        <input type="hidden" name="entryId" value={entry.id} />
        <input type="hidden" name="feedId" value={entry.feedId} />
        <input type="hidden" name="collectionName" value="Some New Collection" />
        <button class="icon-link-button" type="submit" aria-label="Add to Collection">
          <Icon name="folder_add" />
        </button>
        <span role="status" class="tooltip">Add to Collection</span>
        </form>
      </li>
      <li class="tooltip-container">
        <form action="/app/collections/add-entry" method="post">
          <input type="hidden" name="entryId" value={entry.id} />
          <input type="hidden" name="feedId" value={entry.feedId} />
          <input type="hidden" name="collectionName" value={entry.read ? "Unread" : "Read"} />
          <button class="icon-link-button" aria-label={entry.read ? "Mark Unread" : "Mark Read"}>
            <Icon name={entry.read ? "checkbox_circle_outline" : "checkbox_circle_fill"} />
          </button>
          <span role="status" class="tooltip">{entry.read ? "Mark Unread" : "Mark Read"}</span>
        </form>
      </li>
    </ul>
  )
}