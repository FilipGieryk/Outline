import { useEffect, useRef, useState } from "react";

const useIndexedDB = () => {
  const dbRef = useRef(null);
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [dbItems, setDbItems] = useState<any[]>([]);
  useEffect(() => {
    // Bump the version to force onupgradeneeded if necessary
    const request = indexedDB.open("pixiljs", 2); // incremented version number

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("myStore")) {
        const objectStore = db.createObjectStore("myStore", { keyPath: "id" });
        objectStore.createIndex("name", "name", { unique: false });
        console.log("Object store and index created");
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      console.log("Database opened successfully", db);
      dbRef.current = db;
      setDbReady(true);
      const transaction = db.transaction("myStore", "readwrite");
      const store = transaction.objectStore("myStore");
    };

    request.onerror = function (event) {
      console.error("Database error:", event.target.error);
    };
  }, []);

  const putRecord = (record) => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        return reject(new Error("Database not initialized"));
      }
      const transaction = dbRef.current.transaction("myStore", "readwrite");
      const store = transaction.objectStore("myStore");
      const req = store.put(record); // Using put to add or update
      req.onsuccess = (event) => resolve(event.target.result);
      req.onerror = (event) => reject(event.target.error);
    });
  };
  const getAllRecords = () => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        return reject(new Error("Database not initialized"));
      }
      const transaction = dbRef.current.transaction("myStore", "readonly");
      const store = transaction.objectStore("myStore");
      const req = store.getAll();
      req.onsuccess = (event) => resolve(event.target.result);
      req.onerror = (event) => reject(event.target.error);
    });
  };

  const clearDatabase = () => {
    if (!dbReady) return;
    const transaction = dbRef.current.transaction("myStore", "readwrite");
    const store = transaction.objectStore("myStore");
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
      console.log("IndexedDB cleared successfully.");
    };
    clearRequest.onerror = (event) => {
      console.error("Error clearing IndexedDB:", event.target.error);
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
