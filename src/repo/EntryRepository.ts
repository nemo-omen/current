import { CurrentEntry, CurrentEntryDTO, PersistanceEntryDTO } from "../model/CurrentEntry";
import { Result } from "../lib/types/Result";
import { Repository } from "./Repository";
import { Database } from 'bun:sqlite';

export class EntryRepository implements Repository<CurrentEntry> {
  private _db: Database;

  constructor (db: Database) {
    this._db = db;
  }

  get db(): Database {
    return this.db;
  }

  create(entry: CurrentEntry): Result<string> {
    const query = this._db.query(insertEntryQuery);
    let entryResult: CurrentEntryDTO | undefined = undefined;

    try {
      entryResult = query.get(
        entryQueryValues(entry.toPersistance())
      ) as CurrentEntryDTO;
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (!entryResult) {
      return { ok: false, error: 'Error saving entry.' };
    }

    return { ok: true, data: entryResult.id };
  }

  update(entry: CurrentEntry): Result<CurrentEntry> {
    const query = this._db.query(updateEntryQuery);
    let updateResponse: CurrentEntryDTO | undefined = undefined;
    try {
      updateResponse = query.get(
        entryQueryValues(entry.toPersistance())
      ) as CurrentEntryDTO;
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (!updateResponse) {
      return { ok: false, error: 'Failed to update entry' };
    }

    return { ok: true, data: entry };
  }

  delete(entryId: string): Result<boolean> {
    const query = this._db
      .query(`DELETE FROM entries WHERE id=$id RETURNING id`);
    let deleteResult: { id: string; } | undefined = undefined;
    try {
      deleteResult = query.get() as { id: string; };
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (!deleteResult) {
      return {
        ok: false,
        error: `There was a problem deleting the entry ${entryId}`
      };
    }

    return { ok: true, data: true };
  }

  findById(entryId: string): Result<CurrentEntry> {
    const query = this._db.query(
      `SELECT * FROM entries WHERE id=$id;`
    );
    let selectResult: PersistanceEntryDTO | undefined = undefined;

    try {
      selectResult = query
        .get({ $id: entryId }) as PersistanceEntryDTO;
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (!selectResult) {
      return {
        ok: false,
        error: `There was a problem retrievingthe entry: ${entryId}`
      };
    }

    return {
      ok: true,
      data: CurrentEntry.fromPersistance(selectResult)
    };
  }

  findByFeedId(feedId: string): Result<CurrentEntry[]> {
    const query = this._db.query(
      `SELECT * FROM entries WHERE feedId=$feedId;`
    );
    let selectResult: PersistanceEntryDTO[] | undefined = undefined;

    try {
      selectResult = query.all(
        { $feedId: feedId }
      ) as PersistanceEntryDTO[];
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (!selectResult) {
      return {
        ok: false,
        error: `There was a problem retrieving entries for the feed ${feedId}.`
      };
    }

    return {
      ok: true,
      data: selectResult.map(
        (e) => CurrentEntry.fromPersistance(e)
      )
    };
  }

  findAll(): Result<CurrentEntry[]> {
    const query = this._db.query(
      `SELECT * FROM entries;`
    );
    let entriesResult: PersistanceEntryDTO[] | undefined = undefined;

    try {
      entriesResult = query.all() as PersistanceEntryDTO[];
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (!entriesResult) {
      return {
        ok: false,
        error: 'There was a problem retrieving entries'
      };
    }

    return {
      ok: true,
      data: entriesResult.map(
        (e) => CurrentEntry.fromPersistance(e)
      )
    };
  }
}

const insertEntryQuery = `
          INSERT INTO entries (
          id,
          rssId,
          feedId,
          title,
          updated,
          published,
          authors,
          content,
          links,
          summary,
          categories,
          media,
          feedTitle,
          feedLogo,
          feedIcon,
          slug,
          featuredImage
        )
        VALUES (
          $id,
          $rssId,
          $feedId,
          $title,
          $updated,
          $published,
          $authors,
          $content,
          $links,
          $summary,
          $categories,
          $media,
          $feedTitle,
          $feedLogo,
          $feedIcon,
          $slug,
          $featuredImage
        )
        ON CONFLICT (rssId) DO NOTHING
        RETURNING *;
`;

const updateEntryQuery = `
          UPDATE entries
          SET 
            rssId = $rssId,
            feedId = $feedId,
            title = $title,
            updated = $updated,
            published = $published,
            authors = $authors,
            content = $content,
            links = $links,
            summary = $summary,
            categories = $categories,
            media = $media,
            feedTitle = $feedTitle,
            feedLogo = $feedLogo,
            feedIcon = $feedIcon,
            slug = $slug,
            featuredImage = $featuredImage
          WHERE
            id = $id;
`;


const entryQueryValues = (entryDTO: PersistanceEntryDTO) => {
  return {
    $id: entryDTO.id,
    $rssId: entryDTO.rssId || null,
    $feedId: entryDTO.feedId || null,
    $title: entryDTO.title || null,
    $updated: entryDTO.updated || null,
    $published: entryDTO.published || null,
    $authors: entryDTO.authors || null,
    $content: entryDTO.content || null,
    $links: entryDTO.links || null,
    $summary: entryDTO.summary || null,
    $categories: entryDTO.categories || null,
    $media: entryDTO.media || null,
    $feedTitle: entryDTO.feedTitle || null,
    $feedLogo: entryDTO.feedLogo || null,
    $feedIcon: entryDTO.feedIcon || null,
    $slug: entryDTO.slug || null,
    $featuredImage: entryDTO.featuredImage || null
  };
};