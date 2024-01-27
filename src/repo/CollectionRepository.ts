import { Database } from 'bun:sqlite';
import { Repository } from './Repository';
import { Collection, CollectionProps, PersistanceCollectionDTO } from '../model/Collection';
import { Result } from '../lib/types/Result';

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
    ) returning *`);

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
    const query = this._db.query(`SELECT * FROM collections WHERE userId = $userId;`);
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
}