const axios = require("axios");
const yts = require("yt-search");
const settings = require("../settings");

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363407561123100@newsletter",
            newsletterName: "𝐗ɪʀᴏs 𝐌ᴅ",
            serverMessageId: -1
        }
    }
};

const axiosConfig = {
    timeout: 20000, 
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*"
    }
};

async function apiVreden(url) {
    const res = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`, axiosConfig);
    if (res.data?.result?.download?.url) return { url: res.data.result.download.url };
    throw new Error("Lien introuvable dans la réponse");
}

async function apiItzpire(url) {
    const res = await axios.get(`https://itzpire.com/download/youtube?url=${encodeURIComponent(url)}`, axiosConfig);
    if (res.data?.data?.download?.audio) return { url: res.data.data.download.audio };
    throw new Error("Lien introuvable dans la réponse");
}

async function apiDreaded(url) {
    const res = await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(url)}`, axiosConfig);
    if (res.data?.result?.audioUrl) return { url: res.data.result.audioUrl };
    throw new Error("Lien introuvable dans la réponse");
}

module.exports = async (sock, m, args) => {
    const chatId = m.key.remoteJid;
    try {
        const query = args.join(" ").trim();
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Please provide a song name or YouTube link!*\n\n💡 ᴇxᴀᴍᴘʟᴇ: \`${settings.prefix}play Bob Marley Is This Love\``,
                ...channelInfo
            }, { quoted: m });
        }

        await sock.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

        let youtubeUrl;
        let searchTitle = "𝐗ɪʀᴏs 𝐌ᴅ Audio";
        let thumbnail = "";

        if (/^https?:\/\//i.test(query)) {
            youtubeUrl = query;
        } else {
            const search = await yts(query);
            if (!search.videos || search.videos.length === 0) {
                await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
                return await sock.sendMessage(chatId, { text: "❌ *No songs found!*", ...channelInfo }, { quoted: m });
            }
            const video = search.videos[0];
            youtubeUrl = video.url || "";
            searchTitle = video.title || searchTitle;
            thumbnail = video.thumbnail || "";
        }

        const servers = [
            { name: "Vreden", function: apiVreden },
            { name: "Itzpire", function: apiItzpire },
            { name: "Dreaded", function: apiDreaded }
        ];

        let audioData = null;
        let errorLogs = [];

        for (const server of servers) {
            try {
                const result = await server.function(youtubeUrl);
                if (result && result.url) {
                    audioData = result;
                    break;
                }
            } catch (error) {
                errorLogs.push(`${server.name}: ${error.message}`);
            }
        }

        if (!audioData) {
            throw new Error(`\n${errorLogs.join("\n")}`);
        }

        const cleanTitle = searchTitle.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim().slice(0, 100);

        await sock.sendMessage(chatId, {
            audio: { url: audioData.url },
            mimetype: "audio/mpeg",
            fileName: `${cleanTitle}.mp3`,
            contextInfo: {
                ...channelInfo.contextInfo,
                externalAdReply: {
                    title: searchTitle,
                    body: "𝐗ɪʀᴏs 𝐌ᴅ MUSIC",
                    thumbnailUrl: thumbnail,
                    sourceUrl: youtubeUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("PLAY ERROR:", error);
        await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
        
        await sock.sendMessage(chatId, {
            text: `❌ *Audio download failed!*\n\n⚠️ Debug: ${error.message}`,
            ...channelInfo
        }, { quoted: m });
    }
};
