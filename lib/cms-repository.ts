import 'server-only';

import { resolveCmsDataBackend } from '@/lib/cms/backend';
import { d1CmsRepository } from '@/lib/cms/d1-repository';
import type { CmsExpectedVersions } from '@/lib/cms/repository-contract';
import { supabaseCmsRepository } from '@/lib/cms/supabase-repository';
import type { CmsCollection, CmsStatus } from '@/lib/cms-server';

function repository() {
  return resolveCmsDataBackend() === 'supabase'
    ? supabaseCmsRepository
    : d1CmsRepository;
}

export function getCmsDataBackend() {
  return resolveCmsDataBackend();
}

export function listCmsRecords(
  options: Parameters<typeof d1CmsRepository.listRecords>[0] = {},
) {
  return repository().listRecords(options);
}

export function getCmsRecord(
  collection: CmsCollection,
  id: string,
  options: { includeDrafts?: boolean } = {},
) {
  return repository().getRecord(collection, id, options);
}

export function getPortfolioContent() {
  return repository().getPortfolioContent();
}

export function getCmsSnapshot() {
  return repository().getSnapshot();
}

export function createCmsRecord(
  collection: CmsCollection,
  data: Record<string, unknown>,
  status: CmsStatus,
) {
  return repository().createRecord(collection, data, status);
}

export function updateCmsRecord(
  collection: CmsCollection,
  id: string,
  data: Record<string, unknown>,
  status: CmsStatus,
  expectedVersion?: number,
) {
  return repository().updateRecord(collection, id, data, status, expectedVersion);
}

export function setCmsPublication(
  collection: CmsCollection,
  id: string,
  publish: boolean,
  expectedVersion?: number,
) {
  return repository().setPublication(collection, id, publish, expectedVersion);
}

export function deleteCmsRecord(
  collection: CmsCollection,
  id: string,
  expectedVersion?: number,
) {
  return repository().deleteRecord(collection, id, expectedVersion);
}

export function reorderCmsRecords(
  collection: CmsCollection,
  ids: string[],
  expectedVersions?: CmsExpectedVersions,
) {
  return repository().reorderRecords(collection, ids, expectedVersions);
}

export function getCmsRevisions(collection: CmsCollection, recordId: string) {
  return repository().getRevisions(collection, recordId);
}
