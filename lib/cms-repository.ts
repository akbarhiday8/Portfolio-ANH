import 'server-only';

import type { CmsExpectedVersions } from '@/lib/cms/repository-contract';
import { supabaseCmsRepository } from '@/lib/cms/supabase-repository';
import type { CmsCollection, CmsStatus } from '@/lib/cms/types';

export function listCmsRecords(
  options: Parameters<typeof supabaseCmsRepository.listRecords>[0] = {},
) {
  return supabaseCmsRepository.listRecords(options);
}

export function getCmsRecord(
  collection: CmsCollection,
  id: string,
  options: { includeDrafts?: boolean } = {},
) {
  return supabaseCmsRepository.getRecord(collection, id, options);
}

export function getPortfolioContent() {
  return supabaseCmsRepository.getPortfolioContent();
}

export function getCmsSnapshot() {
  return supabaseCmsRepository.getSnapshot();
}

export function createCmsRecord(
  collection: CmsCollection,
  data: Record<string, unknown>,
  status: CmsStatus,
) {
  return supabaseCmsRepository.createRecord(collection, data, status);
}

export function updateCmsRecord(
  collection: CmsCollection,
  id: string,
  data: Record<string, unknown>,
  status: CmsStatus,
  expectedVersion?: number,
) {
  return supabaseCmsRepository.updateRecord(collection, id, data, status, expectedVersion);
}

export function setCmsPublication(
  collection: CmsCollection,
  id: string,
  publish: boolean,
  expectedVersion?: number,
) {
  return supabaseCmsRepository.setPublication(collection, id, publish, expectedVersion);
}

export function deleteCmsRecord(
  collection: CmsCollection,
  id: string,
  expectedVersion?: number,
) {
  return supabaseCmsRepository.deleteRecord(collection, id, expectedVersion);
}

export function reorderCmsRecords(
  collection: CmsCollection,
  ids: string[],
  expectedVersions?: CmsExpectedVersions,
) {
  return supabaseCmsRepository.reorderRecords(collection, ids, expectedVersions);
}

export function getCmsRevisions(collection: CmsCollection, recordId: string) {
  return supabaseCmsRepository.getRevisions(collection, recordId);
}
