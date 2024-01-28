import { Database } from 'bun:sqlite';
import { Repository } from './Repository';
import { Collection, CollectionProps, PersistanceCollectionDTO } from '../model/Collection';
import { Result } from '../lib/types/Result';
import { CurrentEntry } from '../model/CurrentEntry';

export class CollectionRepository implements Repository<Collection> {
  _db: Database;

  constructor (db: Database) {
    this._db = db;
  }

  get db() {
    return this._db;
  }

  create(collection: Collection): Result<Collection> {
    const query = this._db.query(`INSERT INTO collections (
      title,
      userId
    )
    VALUES (
      $title,
      $userId
    ) RETURNING *`);

    let insertResult: PersistanceCollectionDTO | undefined = undefined;

    try {
      insertResult = query.get({
        $title: collection.title!,
        $userId: collection.userId!
      }) as PersistanceCollectionDTO;
    } catch (err) {
      console.error(err);
      return { ok: false, error: String(err) };
    }

    if (!insertResult) {
      return { ok: false, error: 'Could not create collection' };
    }

    return { ok: true, data: Collection.fromPersistance(insertResult) };
  }

  addEntry(entryId: string, collectionId: number): Result<{ entryId: string, collectionId: number; }> {
    const query = this._db.query(`INSERT OR IGNORE INTO collection_entries
      (entryId, collectionId)
      VALUES ($entryId, $collectionId)
      RETURNING *;`
    );
    let entryResult: { entryId: string, collectionId: number; } | undefined = undefined;
    try {
      entryResult = query.get({ $entryId: entryId, $collectionId: collectionId }) as { entryId: string, collectionId: number; };
    } catch (err) {
      return { ok: false, error: `Collection Entry error: ${String(err)}` };
    }

    if (!entryResult) {
      return { ok: false, error: `Error saving entry to collection with id ${collectionId}` };
    }

    return { ok: true, data: entryResult };
  }

  removeEntry(entryId: string, collectionId: number): Result<boolean> {
    const query = this._db.query(`DELETE FROM collection_entries
      WHERE entryId=$entryId AND collectionId=$collectionId RETURNING id;`);
    let entryResult: { id: number; } | undefined = undefined;
    try {
      entryResult = query.get({ $entryId: entryId, $collectionId: collectionId }) as { id: number; };
    } catch (err) {
      return { ok: false, error: `Collection Entry error: ${String(err)}` };
    }

    if (!entryResult) {
      return { ok: false, error: `Error saving entry to collection with id ${collectionId}` };
    }

    return { ok: true, data: true };
  }

  delete(id: any): Result<boolean> {
    const query = this._db.query(`DELETE FROM collections WHERE id=$id RETURNING id`);
    let deleteResult: { id: number; } | undefined = undefined;

    try {
      deleteResult = query.get({ $id: id }) as { id: number; };
    } catch (err) {
      return { ok: false, error: `Error deleting collection: ${err}` };
    }

    if (!deleteResult) {
      return { ok: false, error: `Error deleting collection.` };
    }

    return { ok: true, data: true };
  }

  update(collection: Collection): Result<Collection> {
    const query = this._db.query(`
      UPDATE collections
      SET
        title = $title,
        userId = $userId
      WHERE
        id=$id
      RETURNING *;
    `);

    let updateResult: PersistanceCollectionDTO | undefined = undefined;
    try {
      updateResult = query.get(
        {
          $id: collection.id!,
          $title: collection.title,
          $userId: collection.userId!
        }
      ) as PersistanceCollectionDTO;
    } catch (err) {
      return { ok: false, error: `Error updating collection: ${String(err)}` };
    }

    if (!updateResult) {
      return { ok: false, error: `There was an error updating the collection ${collection.title}` };
    }

    return { ok: true, data: Collection.fromPersistance(updateResult) };
  }

  findById(id: any): Result<Collection | null> {
    const query = this._db.query(`SELECT * FROM collections WHERE id=$id;`);
    let selectResult: PersistanceCollectionDTO | undefined = undefined;
    try {
      selectResult = query.get({ $id: id }) as PersistanceCollectionDTO;
    } catch (err) {
      return { ok: false, error: `Error getting collection: ${String(err)}` };
    }

    if (!selectResult) {
      return { ok: false, error: `No collection with id ${id} found` };
    }

    return { ok: true, data: Collection.fromPersistance(selectResult) };
  }

  findAll(): Result<Collection[]> {
    return { ok: false, error: 'Not implemented for Collection' };
  }

  findCollectionsByUserId(userId: number): Result<Collection[]> {
    const query = this._db.query(`
      SELECT * FROM collections
      WHERE userId = $userId;
    `);
    let selectResult: PersistanceCollectionDTO[] | undefined = undefined;
    try {
      selectResult = query.all({ $userId: userId }) as PersistanceCollectionDTO[];
    } catch (err) {
      return { ok: false, error: `Error getting collections for userId: ${userId}: ${String(err)}` };
    }

    if (!selectResult) {
      return { ok: false, error: `Error getting collections for userId ${userId}` };
    }

    return { ok: true, data: selectResult.map((dto) => Collection.fromPersistance(dto)) };
  }

  findUserCollectionByTitle(userId: number, title: string): Result<Collection> {
    const query = this._db.query(`
      SELECT * FROM collections
      WHERE userId=$userId AND title=$title
    `);
    let collectionResult: PersistanceCollectionDTO | undefined = undefined;
    try {
      collectionResult = query.get({ $userId: userId, $title: title }) as PersistanceCollectionDTO;
    } catch (err) {
      return { ok: false, error: `Error getting collection ${title}: ${String(err)}` };
    }

    if (!collectionResult) {
      return { ok: false, error: `Error getting collection ${title} from database` };
    }

    return { ok: true, data: Collection.fromPersistance(collectionResult) };
  }

  getCollectionEntryIdsByCollectionId(collectionId: number): Result<string[]> {
    const query = this._db.query(`
      SELECT entryId FROM collection_entries
      WHERE collectionId=$collectionId;
    `);

    let entryIdsResult: { entryId: string; }[] | undefined = undefined;
    try {
      entryIdsResult = query
        .all({ $collectionId: collectionId }) as { entryId: string; }[];
      // console.log({ entryIdsResult });
    } catch (err) {
      return { ok: false, error: `Error getting collection entry ids: ${String(err)}` };
    }

    if (!entryIdsResult) {
      return { ok: false, error: 'There was a problem getting collection entry ids' };
    }

    return { ok: true, data: entryIdsResult.map((e) => e.entryId) };
  }

  isEntryInCollection(entryId: string, userId: number, collectionTitle: string): boolean {
    const collectionResult: Result<Collection> = this.findUserCollectionByTitle(userId, collectionTitle);

    if (!collectionResult) {
      return false;
    }

    if (!collectionResult.ok) {
      return false;
    }

    if (collectionResult.data) {
      const collectionId = collectionResult.data.id!;
      const query = this._db.query(`
        SELECT entryId FROM collection_entries
        WHERE collectionId=$collectionId AND entryId=$entryId;
      `);
      const queryResult = query
        .get(
          {
            $collectionId: collectionId,
            $entryId: entryId
          }
        );

      if (!queryResult) {
        return false;
      }

      return true;
    }
    return false;
  }
}