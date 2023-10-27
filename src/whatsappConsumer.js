const startWhatsappConversation = require("./helpers/whatsapp/startWhatsappConversation");

exports.handler = async (event) => {

    console.log("event.Records", event.Records);

    for (const record of event.Records) {
        console.log("Message Record", record);
        console.log("Message Body: ", JSON.parse(record.body));
        let body = JSON.parse(record.body);
        await startWhatsappConversation(body);
    }
    return;
};