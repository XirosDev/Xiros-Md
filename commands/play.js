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
    timeout: 60000,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*"
    }
};

async function request(url) {
    return await axios.get(url, axiosConfig);
}

// Fonction pour scanner et extraire le lien audio peu importe la structure de l'API
function extractAudioUrl(data) {
    if (!data) return null;
    const paths = [
        data.url, data.download_url, data.dl, data.link, data.mp3,
        data?.data?.url, data?.data?.download_url, data?.data?.dl, data?.data?.link, data?.data?.mp3,
        data?.result?.url, data?.result?.download_url, data?.result?.dl, data?.result?.link, data?.result?.mp3
    ];
    return paths.find(p => typeof p === 'string' && p.startsWith('http')) || null;
}

// ===============================
// RYZENDESU API
// ===============================
async function apiRyzendesu(url) {
    const api = `https://api.ryzendesu.vip/api/downloader/ytmp3?url=` + encodeURIComponent(url);
    const response = await request(api);
    const audioUrl = extractAudioUrl(response.data);
    if (audioUrl) return { url: audioUrl };
    throw new Error("Ryzendesu failed");
}

// ===============================
// SIPUTZX API
// ===============================
async function apiSiputzx(url) {
    const api = `https://api.siputzx.my.id/api/d/ytmp3?url=` + encodeURIComponent(url);
    const response = await request(api);
    const audioUrl = extractAudioUrl(response.data);
    if (audioUrl) return { url: audioUrl };
    throw new Error("Siputzx failed");
}

// ===============================
// BK9 API
// ===============================
async function apiBK9(url) {
    const api = `https://bk9.fun/api/ytdl?url=` + encodeURIComponent(url);
    const response = await request(api);
    const audioUrl = extractAudioUrl(response.data);
    if (audioUrl) return { url: audioUrl };
    throw new Error("BK9 failed");
}

// ===============================
// MAIN COMMAND
// ===============================
module.exports = async (sock, m, args) => {
    const chatId = m.key.remoteJid;

    try {
        const query = args.join(" ").trim();

        if (!query) {
            return await sock.sendMessage(
                chatId,
                {
                    text: `❌ *Please provide a song name or YouTube link!*\n\n💡 ᴇxᴀᴍᴘʟᴇ: \`${settings.prefix}play Bob Marley Is This Love\``,
                    ...channelInfo
                },
                { quoted: m }
            );
        }

        await sock.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

        let youtubeUrl;
        let searchTitle = "";
        let thumbnail = "";
        let duration = "N/A";

        if (/^https?:\/\//i.test(query)) {
            youtubeUrl = query;
        } else {
            const search = await yts(query);

            if (!search.videos || search.videos.length === 0) {
                await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
                return await sock.sendMessage(chatId, { text: "❌ *No songs found for your query!*", ...channelInfo }, { quoted: m });
            }

            const video = search.videos[0];
            youtubeUrl = video.url || "";
            searchTitle = typeof video.title === "string" ? video.title : (video.title?.toString() || "");
            thumbnail = typeof video.thumbnail === "string" ? video.thumbnail : "";
            duration = video.timestamp || "N/A";
        }

        const servers = [
            { name: "Ryzendesu", function: apiRyzendesu },
            { name: "Siputzx", function: apiSiputzx },
            { name: "BK9", function: apiBK9 }
        ];

        let audioData = null;

        for (const server of servers) {
            try {
                console.log(`Trying ${server.name}...`);
                const result = await server.function(youtubeUrl);

                if (result && result.url) {
                    audioData = result;
                    console.log(`${server.name} SUCCESS`);
                    break;
                }
            } catch (error) {
                console.log(`${server.name} FAILED:`, error.message);
            }
        }

        if (!audioData) {
            throw new Error("All audio download servers failed");
        }

        const title = searchTitle || "𝐗ɪʀᴏs 𝐌ᴅ Audio";
        const thumb = thumbnail || "";

        const cleanTitle = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").replace(/\s+/g, " ").trim().slice(0, 100) || "𝐗ɪʀᴏs 𝐌ᴅ-Audio";

        await sock.sendMessage(
            chatId,
            {
                audio: { url: audioData.url },
                mimetype: "audio/mpeg",
                fileName: `${cleanTitle}.mp3`,
                contextInfo: {
                    ...channelInfo.contextInfo,
                    externalAdReply: {
                        title: title,
                        body: "𝐗ɪʀᴏs 𝐌ᴅ MUSIC",
                        thumbnailUrl: thumb,
                        sourceUrl: youtubeUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: m }
        );

        await sock.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("PLAY COMMAND ERROR:", error);
        await sock.sendMessage(chatId, { react: { text: "❌", key: m.key } });
        await sock.sendMessage(chatId, {
            text: "❌ *Audio download failed!*\n\n⚠️ All audio servers are currently unavailable or timed out.",
            ...channelInfo
        }, { quoted: m });
    }
};
