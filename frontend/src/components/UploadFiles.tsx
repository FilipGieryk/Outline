import useFileUpload from "../hooks/useFileUpload";
import useIndexedDB from "../hooks/useIndexedDB";

export const UploadFiles = () => {
  const {
    fileInputRef,
    uploadFiles,
    files,
    setFiles,
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
        className={`relative border-4 border-red-900 w-[60vw] h-[60vh] rounded-2xl flex justify-start items-start p-5 gap-5 ${
          isDragging ? "bg-[#c84649]" : "bg-[#ba181b]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 && !isDragging ? (
          <button
            onClick={triggerFileInput}
            className="w-[20%] h-[15%] bg-red-500 rounded-2xl flex absolute border-2 top-[50%] left-[50%] translate-[-50%] border-white"
          >
            Upload Files
          </button>
        ) : (
          Array.from(files).map((file, index) => (
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
          ))
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept="image/png, image/jpeg, image/webp"
        />
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
      </div>
    </>
  );
};
