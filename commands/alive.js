module.exports = async (sock, m) => {
    try {
        const { remoteJid } = m.key;

        const aliveTemplate = `╭──《 𝐗ɪʀᴏs 𝐌ᴅ 》──
 ➭ 🛰️ *sᴛᴀᴛᴜᴛs:* \`Online\`
 ➭ 🕸️ *ᴠᴇʀsɪᴏɴ:* \`2.0.0\`
 ➭ 📦 *ᴘʟᴀᴛғᴏʀᴍ:* \`Pterodactyl / Cloud\`
╰────────────

> *Rift Md is fully operational and ready to serve.* 🇭🇰`.trim();

        // Send the image along with the text as caption and channel info
        await sock.sendMessage(remoteJid, { 
            image: { url: "https://files.catbox.moe/yg3xc1.png" }, // Change image link if needed
            caption: aliveTemplate,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363407561123100@newsletter",
                    newsletterName: "𝐗ɪʀᴏs 𝐌ᴅ ᴏғғɪᴄɪᴀʟ",
                    serverMessageId: 100
                }
            }
        }, { quoted: m });

        // Send the voice note (PTT) afterwards
        await sock.sendMessage(remoteJid, { 
            audio: { url: "https://files.catbox.moe/vg7owa.mp3" }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }, { quoted: m });

    } catch (error) {
        console.error("Error in alive command:", error);
    }
};
