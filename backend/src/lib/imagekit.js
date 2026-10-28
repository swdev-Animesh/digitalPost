import ImageKit from "@imagekit/nodejs";

function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}

const client = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const hasImageKitConfig = () => {
  if (!IMAGEKIT_PRIVATE_KEY) {
    console.error("imagekit key not setup!");
    return false;
  }
  return true;
};

const uploadChatMedia = async (file) => {
  try {
    const fileName = createFileName(file.originalname);
    const result = await client.files.upload({
      file: req.file.buffer, //required
      fileName: fileName, //required
      folder: "/chat",
    });
    console.log(result);
    return result.url;
  } catch (error) {
    console.log(error);
  }
};

export { uploadChatMedia, hasImageKitConfig };
