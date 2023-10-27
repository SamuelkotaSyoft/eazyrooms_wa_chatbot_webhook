const axios = require("axios");
const lodash = require("lodash");
const getKeys = require("./getKey");
const saveMessage = require("./saveChat");
require = require("esm")(module);

async function sendWhatsappMessage({
  type,
  to,
  values,
  org,
  from,
  saveChat = true,
  botId,
  variables,
  source_type = "WHATSAPP",
  chatId,
}) {
  const fileType = await import("file-type");
  const { fileTypeFromBuffer } = fileType;

  let request = null;
  let buffer, mediaId, fileTypeBuffer, mime;

  const mediatype = {
    imageNode: "image",
    videoNode: "video",
    audioNode: "audio",
    documentNode: "document",
  };

  /**
   * Creating payload for making the whatsapp requests.
   */
  switch (type) {
    case "textMessageNode":
    case "questionNode":
    case "fileUploadNode":
    case "emailNode":
    case "phoneNumberNode":
    case "numberNode":
    case "dateNode":
    case "timeNode":
    case "websiteNode":
    case "locationNode":
    case "validation":
    case "orderFlowNode-productQuantity":
    case "orderFlowNode-saveOrder":
      request = {
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          body: replaceWithVariables(
            type !== "validation" ? values?.message : values?.errorMessage,
            variables
          ),
        },
      };
      break;
    case "liveChatNode":
      request = {
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          body: "Live chat started",
        },
      };
      break;
    case "imageNode":
    case "videoNode":
    case "audioNode":
    case "documentNode":
      const fileContents = await axios.get(values.media.url, {
        responseType: "arraybuffer",
      });

      buffer = Buffer.from(fileContents.data, "buffer");
      fileTypeBuffer = await fileTypeFromBuffer(buffer);
      mime = fileTypeBuffer.mime;

      await axios
        .post(
          "https://waba.360dialog.io/v1/media/",
          Buffer.from(buffer, "buffer"),
          {
            headers: {
              "D360-API-KEY": getKeys(),
              "Content-Type": mime,
            },
          }
        )
        .then((response) => {
          mediaId = response.data.media[0].id;
        })
        .catch((error) => {
          console.log({ error });
        });

      request = {
        recipient_type: "individual",
        to: to,
        type: mediatype[type],
        [mediatype[type]]: {
          id: mediaId,
        },
      };
      break;

    case "linkNode":
    case "mapNode":
      const linkMessage = `${
        values?.link?.label ? values?.link?.label : "Location Pin"
      }\n\n${values?.link?.url ? values?.link?.url : values?.mapUrl}`;
      request = {
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          body: replaceWithVariables(linkMessage, variables),
          preview_url: true,
        },
      };
      break;

    case "contactNode":
      request = {
        recipient_type: "individual",
        to: to,
        type: "contacts",
        contacts: [
          {
            emails: [
              {
                email: values.contact.email,
                type: "INTERNET",
              },
            ],
            name: {
              first_name: values.contact.name,
              formatted_name: values.contact.name,
            },
            phones: [
              {
                phone: values.contact.phoneNumber,
                type: "Mobile",
              },
            ],
            addresses: [],
            ims: [],
            org: {},
            urls: [],
          },
        ],
      };
      break;

    case "replyButtonsNode":
      request = {
        recipient_type: "individual",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: replaceWithVariables(values.message, variables),
          },
          action: {
            buttons: (() => {
              let buttons = [];
              values.buttons.forEach((replyButton, index) => {
                if (index < 3 && replyButton.label !== "") {
                  buttons.push({
                    type: "reply",
                    reply: {
                      id: uuidv4(),
                      title: limitStringLength(
                        replaceWithVariables(replyButton.label, variables)
                      ),
                    },
                  });
                }
              });
              return buttons;
            })(),
          },
        },
      };

      break;
    case "dynamicListNode":
    case "listNode":
    case "orderFlowNode-storeList":
    case "orderFlowNode-storeCategories":
    case "orderFlowNode-storeProducts":
      if (type === "dynamicListNode") {
        const apiResponse = await axios({
          method: values?.requestMethod,
          url: `${values?.requestUrl}${values?.requestParams ?? ""}`,
          data: values?.requestBody ?? {},
          headers: {
            "Content-Type": "application/json",
            ...(values?.headers ?? {}),
          },
        });
        values.options = values?.accessor
          ? apiResponse?.data
              ?.map((item) => lodash.get(item, values?.accessor).substr(0, 23))
              .splice(10)
          : apiResponse?.data.splice(10);
      }

      console.log("options", values.options);
      values.options = values.options.slice(0, 10);

      const sections = (() => {
        let sectionsArray = [];
        values?.options?.forEach((listOption) => {
          sectionsArray.push({
            title: listOption,
            rows: [
              {
                id: uuidv4(),
                title: limitStringLength(
                  replaceWithVariables(listOption, variables)
                ),
                description: "",
              },
            ],
          });
        });
        return sectionsArray;
      })();

      console.log("sections", sections);

      request = {
        recipient_type: "individual",
        to: to,
        type: "interactive",
        interactive: {
          type: "list",
          body: {
            text: replaceWithVariables(values.message, variables),
          },
          action: {
            button: "Options",
            sections: sections,
          },
        },
      };
      break;
    default:
      break;
  }

  if (request) {
    if (source_type === "WHATSAPP") {
      await axios({
        method: "post",
        url: `https://waba.360dialog.io/v1/messages`,
        data: request,
        headers: {
          "D360-API-KEY": getKeys(),
        },
      });
    }

    let replyResponse = {};
    if (saveChat) {
      replyResponse = await saveMessage({
        org: org,
        to: to,
        from: from,
        message: { ...request, media: values?.media, values: values },
        botId: botId,
        chatId: chatId,
        message_type: type,
      });
    }
    return replyResponse;
  } else {
    return;
  }
}

function limitStringLength(str) {
  if (str.length > 20) {
    return str.substring(0, 20); // Extract the first 20 characters
  }
  return str;
}

function replaceWithVariables(msg, variables) {
  if (variables) {
    Object.keys(variables).forEach((key) => {
      msg = msg.replace(`{{${key}}}`, variables?.[`${key}`]);
    });
  }
  return msg;
}

function uuidv4() {
  var d = new Date().getTime();
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

module.exports = sendWhatsappMessage;
