import 'server-only';

import {
  createCmsRecord,
  deleteCmsRecord,
  getCmsRevisions,
  getCmsSnapshot,
  getPortfolioContent,
  listCmsRecords,
  reorderCmsRecords,
  updateCmsRecord,
} from '@/lib/cms-server';
import type { CmsRepository } from '@/lib/cms/repository-contract';

export const d1CmsRepository = {
  listRecords: listCmsRecords,

  async getRecord(collection, id, options = {}) {
    const records = await listCmsRecords({
      collection,
      includeDrafts: options.includeDrafts,
    });
    return records.find((record) => record.id === id) ?? null;
  },

  getPortfolioContent,
  getSnapshot: getCmsSnapshot,
  createRecord: createCmsRecord,

  async updateRecord(collection, id, data, status) {
    return updateCmsRecord(collection, id, data, status);
  },

  async setPublication(collection, id, publish) {
    const records = await listCmsRecords({ collection, includeDrafts: true });
    const record = records.find((item) => item.id === id) ?? null;
    if (!record) return null;
    return updateCmsRecord(
      collection,
      id,
      record.data,
      publish ? 'published' : 'draft',
    );
  },

  async deleteRecord(collection, id) {
    const result = await deleteCmsRecord(collection, id);
    return result ? true : null;
  },

  async reorderRecords(collection, ids) {
    return reorderCmsRecords(collection, ids);
  },

  getRevisions: getCmsRevisions,
} satisfies CmsRepository;
