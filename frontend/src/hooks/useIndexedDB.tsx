import { useEffect, useRef, useState } from "react";
import type { ImageProp } from "../components/Canvas";

interface RecordProp {
  id: number;
  name: string;
  images: ImageProp[];
  timestamp: number;
}

const useIndexedDB = () => {
  const dbRef = useRef<IDBDatabase | null>(null);
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [dbItems, setDbItems] = useState<any[]>([]);
  useEffect(() => {
    // Bump the version to force onupgradeneeded if necessary
    const request = indexedDB.open("pixiljs", 2); // incremented version number

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("myStore")) {
        const objectStore = db.createObjectStore("myStore", { keyPath: "id" });
        objectStore.createIndex("name", "name", { unique: false });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      dbRef.current = db;
      setDbReady(true);
    };

    request.onerror = () => {
      console.error("Database error:", request.error);
    };
  }, []);

  const putRecord = (record: RecordProp) => {
    console.log(record);
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        return reject(new Error("Database not initialized"));
      }
      const transaction = dbRef.current.transaction("myStore", "readwrite");
      const store = transaction.objectStore("myStore");
      const req = store.put(record); // Using put to add or update
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };
  const getAllRecords = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        return reject(new Error("Database not initialized"));
      }
      const transaction = dbRef.current.transaction("myStore", "readonly");
      const store = transaction.objectStore("myStore");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  const clearDatabase = () => {
    if (!dbReady || !dbRef.current) return;
    const transaction = dbRef.current.transaction("myStore", "readwrite");
    const store = transaction.objectStore("myStore");
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
      console.log("IndexedDB cleared successfully.");
    };
    clearRequest.onerror = () => {
      console.error("Error clearing IndexedDB:", clearRequest.error);
    };
  };
  const refreshRecords = () => {
    getAllRecords()
      .then((items) => {
        setDbItems(items);
        console.log("DB Items retrieved:", items);
      })
      .catch((error) => console.error("Failed to fetch DB items:", error));
  };

  useEffect(() => {
    if (dbReady) refreshRecords();
  }, [dbReady]);

  return {
    dbRef,
    dbItems,
    dbReady,
    putRecord,
    getAllRecords,
    clearDatabase,
  };
};

export default useIndexedDB;
