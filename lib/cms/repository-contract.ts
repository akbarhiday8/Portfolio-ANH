import type { portfolioData } from '@/lib/portfolio-data';
import type { CmsCollection, CmsRecord, CmsRevision, CmsStatus } from '@/lib/cms-server';

export type PortfolioContent = typeof portfolioData;
export type ListCmsRecordsOptions = {
  includeDrafts?: boolean;
  collection?: CmsCollection;
};

export type CmsExpectedVersions = Record<string, number>;

export type CmsRepositoryErrorCode =
  | 'configuration'
  | 'conflict'
  | 'duplicate'
  | 'forbidden'
  | 'invalid'
  | 'not_found'
  | 'unavailable';

export class CmsRepositoryError extends Error {
  constructor(
    public readonly code: CmsRepositoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CmsRepositoryError';
  }
}

export interface CmsRepository {
  listRecords(options?: ListCmsRecordsOptions): Promise<CmsRecord[]>;
  getRecord(
    collection: CmsCollection,
    id: string,
    options?: { includeDrafts?: boolean },
  ): Promise<CmsRecord | null>;
  getPortfolioContent(): Promise<PortfolioContent>;
  getSnapshot(): Promise<Record<string, CmsRecord[]>>;
  createRecord(
    collection: CmsCollection,
    data: Record<string, unknown>,
    status: CmsStatus,
  ): Promise<CmsRecord>;
  updateRecord(
    collection: CmsCollection,
    id: string,
    data: Record<string, unknown>,
    status: CmsStatus,
    expectedVersion?: number,
  ): Promise<CmsRecord | null>;
  setPublication(
    collection: CmsCollection,
    id: string,
    publish: boolean,
    expectedVersion?: number,
  ): Promise<CmsRecord | null>;
  deleteRecord(
    collection: CmsCollection,
    id: string,
    expectedVersion?: number,
  ): Promise<boolean | null>;
  reorderRecords(
    collection: CmsCollection,
    ids: string[],
    expectedVersions?: CmsExpectedVersions,
  ): Promise<boolean>;
  getRevisions(collection: CmsCollection, recordId: string): Promise<CmsRevision[]>;
}
