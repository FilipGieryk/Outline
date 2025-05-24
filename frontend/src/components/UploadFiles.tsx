import useFileUpload from "../hooks/useFileUpload";
import useIndexedDB from "../hooks/useIndexedDB";

export const UploadFiles = () => {
  const {
    fileInputRef,
    uploadFiles,
    files,
    uploading,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    triggerFileInput,
    deleteFile,
    handleFileChange,
  } = useFileUpload();
  const { clearDatabase } = useIndexedDB();

  return (
    <>
      <div
        className={`relative border-4 border-red-900 w-[60vw] h-[67vh] rounded-2xl flex justify-start items-start p-5 gap-5 ${
          isDragging ? "bg-[#7a7575]" : "bg-[#3a3232]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 && !isDragging ? (
          <div className="absolute top-[50%] left-[50%] translate-[-50%] flex flex-col items-center">
            <img src="/photos.png" className="w-20 mb-3"></img>
            <button
              onClick={triggerFileInput}
              className="w-[100%] h-[50%] text-2xl p-3 px-10 bg-[#b8309673] rounded-md flex border-2 border-white justify-center items-center hover:bg-[#8b5584]"
            >
              Choose files
            </button>
            <p className="mt-2 text-xl text-white">or drop them here</p>
          </div>
        ) : (
          <>
            {Array.from(files).map((file, index) => (
              <div
                key={index}
                className="text-white border-2 w-45 h-30 rounded-2xl relative"
              >
                <button
                  className="absolute top-0 right-0 bg-transparent"
                  onClick={() => deleteFile(file)}
                >
                  X
                </button>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-full"
                />
                <p>{file.name}</p>
              </div>
            ))}
            <button
              onClick={() => {
                uploadFiles();
                clearDatabase();
              }}
              disabled={uploading || files.length === 0}
              className="bg-blue-500 text-white p-3 rounded-xl"
            >
              {uploading ? "Uploading..." : "Upload & Process"}
            </button>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept="image/png, image/jpeg, image/webp"
        />
      </div>
    </>
  );
};
