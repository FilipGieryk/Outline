import { Button } from "../components/Button";
import { UploadFiles } from "../components/UploadFiles";
import useIndexedDB from "../hooks/useIndexedDB";
export const HomePage = () => {
  const { dbItems, clearDatabase } = useIndexedDB();
  console.log(dbItems?.map((img) => console.log(img?.images[0])));
  return (
    <div className="flex flex-col gap-5 items-center mt-5">
      <Button content="New Drawing" to="/drawing" onClick={clearDatabase} />
      <p>Or</p>
      <UploadFiles />
      {dbItems?.length > 0 && (
        <div className="flex">
          {dbItems?.map((img) => (
            <img src={img?.images[0].url} width={100}></img>
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
