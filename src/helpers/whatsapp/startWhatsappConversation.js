const handleMedia = require("./handleMedia");
const saveMessage = require("./saveChat");
const sendNextMessage = require("./sendNextMessage");
const { connectToMongoDB } = require("../db");
const startWhatsappConversation = async (body) => {
  const now = new Date();
  const utcTime = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );
  body.timestamp = utcTime;

  const { messages } = body;

  if (Array.isArray(messages)) {
    /**
     * Connecting to mongodb initially
     */
    await connectToMongoDB();

    let media = null;

    body.from = messages[0].from;
    body.message = messages[0];

    /**
     *
     * handling media inputs over here
     * converting them to type and url json object
     */
    if (
      messages[0]?.image?.id ||
      messages[0]?.video?.id ||
      messages[0]?.document?.id ||
      messages[0]?.audio?.id
    ) {
      media = await handleMedia(body);
    }

    messages[0].media = media;

    /**
     * saving message to db
     */
    await saveMessage({
      ...body,
      message: messages[0],
      from: messages[0].from,
      to: body.botId,
      botId: body.botId,
    });

    /**
     * Checking for next WhatsMessage
     */
    await sendNextMessage(body);

    // await disconnectFromMongoDB();
  }
  return;
};

module.exports = startWhatsappConversation;
