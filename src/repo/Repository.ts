import { Database } from 'bun:sqlite';
import { Result } from '../lib/types/Result';

export interface Repository<T> {
  db: Database;
  create(entity: T): Result<any>;
  update(entity: T): Result<T>;
  delete(id: any): Result<boolean>;
  findAll(): Result<T[]>;
  findById(id: any): Result<T | null>;
}