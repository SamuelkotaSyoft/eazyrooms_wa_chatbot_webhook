const express = require("express");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const startWhatsappConversation = require("./helpers/whatsapp/startWhatsappConversation");

const sqs = new SQSClient();

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const QUEUE_URL = process.env.QUEUE_URL;
    const IS_SERVERLESS = process.env.IS_SERVERLESS || false;

    const { org, botid } = req.headers;
    let body = req.body;

    body.org = org;
    body.botId = botid;

    if (IS_SERVERLESS) {
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(body),
        })
      );
    } 
    else {
      console.log({ body });
      startWhatsappConversation(body);
    }
  } catch (error) {
    console.log("WebHook Error: ", error);
  }

  return res.status(200).json({
    status: true,
  });
});

module.exports = router;
