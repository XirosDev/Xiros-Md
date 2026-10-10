module.exports = async (sock, m, args) => {
    const chatId = m.key.remoteJid;

    const start = Date.now();

    const msg = await sock.sendMessage(
        chatId,
        {
            text: "🏓 Pinging..."
        },
        { quoted: m }
    );

    const latency = Date.now() - start;

    await sock.sendMessage(
        chatId,
        {
            text:
`╭──《 *𝐗ɪʀᴏs 𝐌ᴅ ᴘɪɴɢ* 》──
 ➭ 🏓 *ᴘᴏɴɢ!*
 ➭ ⚡ *sᴘᴇᴇᴅ:* ${latency} ms
 ➭ 🤖 *ʙᴏᴛt:* 𝐗ɪʀᴏs 𝐌ᴅ
╰────────────`
        },
        { quoted: m }
    );
};
