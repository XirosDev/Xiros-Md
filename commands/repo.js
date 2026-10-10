module.exports = async (sock, m, args) => {
    const repoText = `╭──《 *⚙️𝐗ɪʀᴏs 𝐌ᴅ ʀᴇᴘᴏsɪᴛᴏʀʏ* 》──
 ➭ 🤖 *ʙᴏᴛ ɴᴀᴍᴇ:* 𝐗ɪʀᴏs 𝐌ᴅ
 ➭ 👑 *ᴏᴡɴᴇʀ:* WeedDev
 ➭ 📦 *ɢɪᴛʜᴜʙ:* https://github.com/XirosDev/Xiros-Md
╰───────────`;

    const channelInfo = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363407561123100@newsletter',
                newsletterName: '𝐗ɪʀᴏs 𝐌',
                serverMessageId: -1
            }
        }
    };

    await sock.sendMessage(m.key.remoteJid, {
        image: { url: "https://files.catbox.moe/1aip2f.jpg" },
        caption: repoText,
        ...channelInfo
    }, { quoted: m });
};
