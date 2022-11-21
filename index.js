const wa = require("@open-wa/wa-automate");
const axios = require("axios");

wa.create({
  sessionId: "test",
  multiDevice: true, //required to enable multiDevice support
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  popup: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then((client) => start(client));

function start(client) {
  client.onAddedToGroup(async chat => {
    await client.leaveGroup(chat.id)
  })
  client.onMessage(async (message) => {
    // console.log(message)
    if(message.body.length > 300) {
      await client.deleteMessage(message.from, message.id, false)
      await client.sendText(message.from, "Chat tidak boleh lebih dari 300 karakter")
    }
    if (message.body.length < 300) {
      if (!message.isMedia) {
        if (message.body === "/cat") {
          const response = await axios('https://catto.hoshino.my.id/random', { responseType: 'arraybuffer' })
          const buffer64 = Buffer.from(response.data, 'binary').toString('base64')
          await client.sendImage(message.from, `data:image/jpg;base64,${buffer64}`, 'cat', 'cat')
        }
        if(message.body === '/help') {
            await client.sendText(message.from, `
⭐🤖 *Welcome to LokaleBot* 🤖⭐

_Feature_ ✨ :
- Auto sticker jika kirim gambar / video
- /cat = gambar kucing random

            `)
        }
        // await client.sendText(message.from, `Hello, ${message.body}`);
      } else {
        await client.reply(message.from, 'Sedang diproses', message.id)
        if(message.type === 'image') {
            const a = await client.decryptMedia(message);
            await client.sendImageAsSticker(message.from, a, {author: 'bot surya', keepScale: true, pack: 'bot collection'});
        }
        if(message.type === 'video') {
            const a = await client.decryptMedia(message);
            await client.sendMp4AsSticker(message.from, a, {crop: false}, {author: 'bot surya', keepScale: true, pack: 'bot collection'});
        }
      }
    }
  });
}
