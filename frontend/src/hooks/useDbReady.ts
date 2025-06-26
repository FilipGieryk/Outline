import { useEffect, useState } from "react";
import { dbRef } from "../core/indexedDb";

export function useDbReady() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const openDatabase = async () => {
      try {
        await dbRef.openDb(); // openDb should open or return existing DB instance
        setDbReady(true);
      } catch (error) {
        console.error("Failed to open DB:", error);
        setDbReady(false);
      }
    };

    openDatabase();
  }, []);

  return dbReady;
}
