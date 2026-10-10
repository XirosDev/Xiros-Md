const settings = require("../settings");
const fs = require("fs");
const path = require("path");

module.exports = async (sock, m, args) => {
    const pushName = m.pushName || m.senderPn || (m.sender ? m.sender.split('@')[0] : "User");
    const chatId = m.key.remoteJid;
    const prefix = settings.prefix || ".";

    function runtime(seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        return `${d > 0 ? d + "d " : ""}${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${s}s`;
    }

    const uptime = runtime(process.uptime());

    let commandList = [];
    try {
        const commandsDir = path.join(__dirname, "../commands");
        if (fs.existsSync(commandsDir)) {
            commandList = fs.readdirSync(commandsDir)
                .filter(file => file.endsWith(".js"))
                .map(file => file.replace(".js", "").toLowerCase());
        }
    } catch (e) {
        console.error("Error reading commands folder:", e);
    }

    const totalCommands = commandList.length;

    const categories = {
        "ʙᴏᴛ ɪɴғᴏ": ["ᴀʟɪᴠᴇ", "ᴘɪɴɢ", "ᴍᴇɴᴜ", "ᴏᴡɴᴇʀ", "ʀᴜɴᴛɪᴍᴇ", "ɢsᴛᴀᴛᴜ", "ᴊɪᴅɴᴇᴡsʟᴇᴛᴛᴇʀ", "ғʙ", "ʀᴇᴘᴏ"],
        "ᴛᴏᴏʟs": ["ᴘʟᴀʏ", "ɪɢᴅʟ", "ᴛᴡɪᴛᴛᴇʀ", "ᴄʟᴇᴀʀ", "ᴛᴏᴜʀʟ", "ᴠɪᴅᴇᴏ", "ᴠᴠ", "ɪᴍᴀɢᴇ"],
        "ɢʀᴏᴜᴘ": ["ᴋɪᴄᴋ", "ᴋɪᴄᴋᴀʟʟ", "ᴀᴅᴅ", "ᴘʀᴏᴍᴏᴛᴇ", "ᴅᴇᴍᴏᴛᴇ", "ᴅᴇʟᴇᴛᴇ", "tagall", "ᴏᴘᴇɴ", "ᴄʟᴏsᴇ", "ʟɪɴᴋ", "ʜɪᴅᴇᴛᴀɢ"],
        "sᴇᴛᴛɪɴɢs": ["ᴀɴᴛɪʟɪɴᴋ", "sᴇᴛᴘʀᴇғɪx", "ʜᴇʟᴘ", "ᴍᴏᴅᴇ", "ᴀᴜᴛᴏʀᴇᴀᴄᴛ", "ᴀᴜᴛᴏʀᴇᴀᴅ", "ᴀᴜᴛᴏᴛʏᴘɪɴɢ"]
    };

    const categorizedCommands = new Set(Object.values(categories).flat());
    const otherCommands = commandList.filter(cmd => !categorizedCommands.has(cmd));
    if (otherCommands.length > 0) {
        categories["ᴏᴛʜᴇʀs"] = otherCommands;
    }

    let menuCategoriesText = "";
    for (const [catName, cmds] of Object.entries(categories)) {
        const activeCmdsInCat = cmds.filter(cmd => commandList.includes(cmd));
        if (activeCmdsInCat.length === 0) continue;
        
        const formattedCmds = activeCmdsInCat.map(cmd => `*│ ➭ ${cmd}*`).join("\n");
        menuCategoriesText += `\n\`《 ${catName} 》\`\n╭────────────\n${formattedCmds}\n╰────────────\n`;
    }

    try {
        await sock.sendMessage(chatId, { text: "🤿 Loading menu..." }, { quoted: m });

        const menu = `
*╭═════《 𝐗ɪʀᴏs 𝐌ᴅ 》═════*
*☐ 🤖 ᴏᴡɴᴇʀ:* 𝐋ᴏʀᴅ 𓏴 𝐁ᴇɴɪᴍʀᴜ
*☐ 👤 ᴜsᴇʀ:* ${pushName}
*☐ 📜 ᴄᴏᴍᴍᴀɴᴅs:* ${totalCommands}
*☐ 🎣 ʀᴜɴᴛɪᴍᴇ:* ${uptime}
*☐ 📦 ᴘʀᴇғɪx:* ${prefix}
*☐ 🇭🇰 ᴍᴏᴅᴇ:* public
*☐ 🏷️ ᴠᴇʀsɪᴏɴ:* 2.0.0
*╰══════════════════*
${menuCategoriesText}
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐋ᴏʀᴅ 𓏴 𝐁ᴇɴɪᴍʀᴜ*
    `.trim();

        const channelInfo = {
            contextInfo: {
                mentionedJid: [m.sender || m.key.participant],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363407561123100@newsletter",
                    newsletterName: "𝐗ɪʀᴏs 𝐌ᴅ",
                    serverMessageId: -1
                }
            }
        };

        await sock.sendMessage(chatId, {
            image: { url: "https://files.catbox.moe/1aip2f.jpg" },
            caption: menu,
            ...channelInfo
        }, { quoted: m });

    } catch (e) {
        console.error("Menu Error:", e);
    }
};
