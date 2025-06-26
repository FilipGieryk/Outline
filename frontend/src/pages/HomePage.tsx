import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { UploadFiles } from "../components/UploadFiles";
import { dbRef } from "../core/indexedDb";
export const HomePage = () => {
  const [dbItems, setDbItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await dbRef.getAllRecords();
        setDbItems(items);
      } catch (error) {
        console.error("Failed to fetch DB items", error);
      }
    };
    fetchItems();
  }, []);

  console.log(dbItems);
  return (
    <div className="flex flex-col gap-5 items-center mt-5">
      <Button content="New Drawing" to="/drawing" onClick={dbRef.clearStore} />
      <p>Or</p>
      <UploadFiles />
      {dbItems?.length > 0 && (
        <div className="flex">
          {dbItems?.map((img) => (
            <img src={img?.images[0]?.url} width={100}></img>
          ))}

          <Button
            // onClick={handleSetImages}
            content="Resume Session"
            to="/drawing"
          />
        </div>
      )}
    </div>
  );
};
