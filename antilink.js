const { cmd } = require('../command');
const config = require("../config");

cmd({
  on: "body" // Listens to all messages
}, async (conn, m, store, { from, body, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins || config.ANTI_LINK !== 'true') return;

    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
      // ... (your other patterns)
    ];

    if (linkPatterns.some(pattern => pattern.test(body))) {
      try {
        // Delete the message
        await conn.sendMessage(from, { delete: m.key });
      } catch (e) { console.log("Failed to delete:", e); }

      // Direct kick — no warning, no count
      try {
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        await conn.sendMessage(from, {
          text: `🚫 @${sender.split('@')[0]} has been kicked for sending a link!\n\n⚠️ Links are not allowed in this group.`,
          mentions: [sender]
        });
      } catch (e) {
        console.log("Failed to kick:", e);
      }
    }
  } catch (error) {
    console.error("Anti-link error:", error);
  }
});
