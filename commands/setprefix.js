const fs = require("fs");
const path = require("path");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const settings = require("../settings");
    
    // 1. Verify if the sender is the owner
    const isOwner = sender.includes(settings.ownerNumber.replace(/[^0-9]/g, '')) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { 
            text: "❌ *Access Denied:* Only the Bot Owner can use this command." 
        }, { quoted: m });
    }

    // 2. Check if an argument (new prefix) was provided
    if (!args[0]) {
        const errorText = `╭──《 *ɪɴᴠᴀʟɪᴅ ᴜsᴀɢᴇ* 》──
 ➭ ❌ *Missing new prefix!*
 ➭ 
 ➭ 📌 *ᴜsᴀɢᴇ:* \`${settings.prefix}setprefix [new_prefix]\`
 ➭ 💡 *ᴇxᴀᴍᴘʟᴇ:* \`${settings.prefix}setprefix !\`
╰────────────`.trim();

        return await sock.sendMessage(from, { text: errorText }, { quoted: m });
    }

    const newPrefix = args[0];

    try {
        const settingsPath = path.join(__dirname, "../settings.js");
        let settingsContent = fs.readFileSync(settingsPath, "utf-8");
        
        // Update prefix value dynamically in settings.js
        settingsContent = settingsContent.replace(/prefix:\s*["'`].*?["'`]/, `prefix: "${newPrefix}"`);
        fs.writeFileSync(settingsPath, settingsContent, "utf-8");

        // 3. Success message (Simple & Clean)
        const successText = `╭──《 *ᴘʀᴇғɪx ᴜᴘᴅᴀᴛᴇᴅ* 》──
 ➭ ✅ *ɴᴇᴡ ᴘʀᴇғɪx:* \`${newPrefix}\`
 ➭ 🕸️ *sᴛᴀᴛᴜs:* \`Auto-restarting...\`
╰────────────`.trim();

        await sock.sendMessage(from, { text: successText }, { quoted: m });

        // 4. Force automatic restart on the panel after 1.5 seconds
        setTimeout(() => {
            process.exit(0);
        }, 1500);

    } catch (e) {
        console.error("SetPrefix Error:", e);
        await sock.sendMessage(from, { 
            text: "❌ *Error:* Failed to update the prefix in settings.js." 
        }, { quoted: m });
    }
};
