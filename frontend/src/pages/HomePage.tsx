import { Button } from "../components/Button";
import { UploadFiles } from "../components/UploadFiles";
import useIndexedDB from "../hooks/useIndexedDB";
export const HomePage = () => {
  const { dbItems, clearDatabase } = useIndexedDB();

  // on first button add fucntion to clear database

  return (
    <div className="flex flex-col gap-10 items-center mt-15">
      <Button content="New Drawing" to="/drawing" onClick={clearDatabase} />
      <p>Or</p>
      <UploadFiles />
      {dbItems?.length > 0 && (
        <div>
          {/* {dbItems?.map((img) => (
            <img src={img?.images[0]}></img>
          ))} */}

          {/* <Button
            // onClick={handleSetImages}
            content="Resume Session"
            to="/drawing"
          /> */}
        </div>
      )}
    </div>
  );
};
