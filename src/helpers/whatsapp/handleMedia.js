const axios = require("axios");
const AWS = require("@aws-sdk/client-s3");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const getKeys = require("./getKey");
const mime = require("mime-types");

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.S3_KEY || "AKIA3O7DVYZUNUC74G43",
    secretAccessKey:
      process.env.S3_SECRET || "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",
  },
});

async function handleMedia(body) {
  const { messages, org } = body;
  return (media = await new Promise(async (resolve, reject) => {
    let mediaId;
    let mimeType;
    if (messages[0]?.image?.id) {
      mediaId = messages[0]?.image?.id;
      mimeType = messages[0]?.image?.mime_type;
    }

    if (messages[0]?.video?.id) {
      mediaId = messages[0]?.video?.id;
      mimeType = messages[0]?.video?.mime_type;
    }

    if (messages[0]?.document?.id) {
      mediaId = messages[0]?.document?.id;
      mimeType = messages[0]?.document?.mime_type;
    }

    if (messages[0]?.audio?.id) {
      mediaId = messages[0]?.audio?.id;
      mimeType = messages[0]?.audio?.mime_type;
    }

    if (mediaId) {
      //get 360dialog api key
      // [TODO]: get from user bot
      let apiKey = getKeys();

      //get media blob
      const fileContents = await axios({
        method: "get",
        url: `https://waba.360dialog.io/v1/media/${mediaId}`,
        headers: {
          "D360-API-KEY": apiKey,
        },
        responseType: "arraybuffer",
      });

      if (fileContents) {
        // console.log({
        //   fileContentsData: JSON.stringify(fileContents.data),
        // });
        // fs.writeFileSync("test.jpg", fileContents.data);

        const base64EncodedImage = Buffer.from(
          fileContents.data,
          "binary"
        ).toString("base64");

        // console.log({ buffer });

        // Upload the file to S3
        const s3Result = await new Promise(async (resolve, reject) => {
          // Generate unique filename for the file
          const filename = `${Date.now()}-${messages[0]?.type}.${mime.extension(
            mimeType
          )}`;
          const key = `uploads/chats/${filename}`;

          const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET || "chatbotuploads",
            Key: key,
            Body: Buffer.from(base64EncodedImage, "base64"),
            ContentType: mimeType,
          });

          // Upload the file to S3
          await s3.send(command);
          const publicUrl = `https://${
            process.env.S3_BUCKET || "chatbotuploads"
          }.s3.amazonaws.com/${key}`;

          resolve({
            type: messages[0]?.type,
            url: publicUrl,
          });
        });

        console.log("s3Result", { s3Result });

        resolve(s3Result);
      }
    } else return null;
  }));
}

module.exports = handleMedia;
