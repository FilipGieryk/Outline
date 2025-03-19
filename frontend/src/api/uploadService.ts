import { axiosInstance } from "./axiosInstance";

export const uploadFilesAPI = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await axiosInstance.post("/upload", formData);
  console.log(response.data);
  return response.data.processed_images;
};
