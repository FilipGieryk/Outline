import { dbRef } from "../core/indexedDb";

export function useIndexedDb() {
  return {
    getAllRecords: dbRef.getAllRecords,
    putRecord: dbRef.putRecord,
    deleteRecord: dbRef.deleteRecord,
  };
}
