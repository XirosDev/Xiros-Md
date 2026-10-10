module.exports = async (sock, m, args) => {
    const chatJid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    // 1. Group check
    if (!chatJid.endsWith('@g.us')) {
        return await sock.sendMessage(chatJid, { text: "❌ *Error:* This command can only be used in groups!" }, { quoted: m });
    }

    try {
        // 2. Open the group (not_announcement allows everyone to speak)
        await sock.groupSettingUpdate(chatJid, 'not_announcement');

        // 3. Clean Modern Response with Bot Name
        const response = `╭──《 *ɢʀᴏᴜᴘ ᴜɴʟᴏᴄᴋᴇᴅ* 》──ʙ
 ➭ 🕸️ *sᴛᴀᴛᴜs:* Tout le monde peut envoyer des messages maintenant!
 ➭ 🔓 *ᴀᴄᴄsᴇss:*  Ouvert a Tous 🇭🇰
 ➭ 🇭🇰 *ᴀᴄᴛɪᴏɴ ʙʏ:* @${sender.split('@')[0]}
 ➭ 🤖 *ʙᴏᴛ:* 𝐗ɪʀᴏs 𝐌ᴅ
╰────────────`.trim();

        await sock.sendMessage(chatJid, { 
            text: response, 
            mentions: [sender] 
        }, { quoted: m });

        // 4. Auto-delete the command message to keep the chat clean
        await sock.sendMessage(chatJid, { delete: m.key }).catch(() => {});

    } catch (err) {
        console.error("Group Open Error:", err);
        await sock.sendMessage(chatJid, { 
            text: "⚠️ *Permission Denied:* Make sure I am a **Group Admin** to change group settings!" 
        }, { quoted: m });
    }
};
