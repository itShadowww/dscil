const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle , ActivityType } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
});

const token = 'MTMxODYxNzk5NjA3OTY2MTEzNg.GS-_I7.LlMdHe9v8LR4ZCWtZTxAtoas4rmCweq7a42xEo';  // הכנס כאן את הטוקן שלך
const newMembersLogChannelId = '1318240027599179817';  // ID של חדר הלוגים של אנשים חדשים
const adminLogChannelId = '1318607564656738365';  // ID של חדר הלוגים של מנהלים
const requiredRoleId = '1313907563569610844';  // ID של הרול המורשה לבצע פקודות
const cooldowns = new Map(); // מפה לשמירת קולדאונים

// פונקציה לעדכון הסטטוס
async function updateStatus() {
  const guild = client.guilds.cache.first(); // מחזיר את השרת הראשון שהבוט מחובר אליו
  if (!guild) return; // אם אין שרת, לא עושים כלום

  const memberCount = guild.memberCount; // מספר הממברים בשרת
  client.user.setPresence({
    activities: [{ name: `${memberCount} Members | !h`, type: ActivityType.Watching }],
    status: 'dnd'
  });
}

client.once('ready', async () => {
  console.log('The Bot is online!');
  await updateStatus(); // עדכון סטטוס בעת הפעלת הבוט
});

// כאשר ממבר חדש מצטרף לשרת
client.on('guildMemberAdd', async (member) => {
  console.log(`Member joined: ${member.user.tag}`);
  await updateStatus(); // עדכון הסטטוס כשמישהו מצטרף
});

// כאשר ממבר עוזב את השרת
client.on('guildMemberRemove', async (member) => {
  console.log(`Member left: ${member.user.tag}`);
  await updateStatus(); // עדכון הסטטוס כשמישהו עוזב
});

// כאשר ממבר חדש מצטרף לשרת
client.on('guildMemberAdd', async (member) => {
  const embed = new EmbedBuilder()
    .setColor(0xADD8E6)  // צבע כחול בהיר
    .setTitle('Discord Israel Project | Official Server')
    .setThumbnail(member.user.displayAvatarURL())  // תמונה של הממבר
    .setDescription(`**Welcome , ${member.user.username} To Discord Israel Project!**\nWe Are At ${member.guild.memberCount} Members!`) // פרטי הממבר וכמות הממברים
    .setTimestamp();  // הוספת זמן

  // שליחת האמבד לחדר הלוגים של אנשים חדשים
  const newMembersLogChannel = client.channels.cache.get(newMembersLogChannelId);
  if (newMembersLogChannel) {
    await newMembersLogChannel.send({ embeds: [embed] });
  }
});

// מערכת הודעה פרטית
client.on('messageCreate', async (message) => {
  if (message.content === '?on') {
    await message.reply('V');
  }

  // בדיקת אם למשתמש יש את הרול המתאים
  if (!message.guild.members.cache.get(message.author.id)?.roles.cache.has(requiredRoleId)) {
    return; // אם אין לו את הרול, לא נבצע את הפקודה
  }

  // מערכת שליחת הודעה פרטית
  if (message.content.startsWith('?dm')) {
    const args = message.content.split(' ');
    const mentionedUser = message.mentions.users.first();
    const messageContent = args.slice(2).join(' ');

    if (mentionedUser && messageContent) {
      const dmEmbed = new EmbedBuilder()
        .setColor(0x0000FF)  // כחול
        .setTitle('קיבלת הודעה חדשה!')
        .setDescription(messageContent);

      try {
        await mentionedUser.send({ embeds: [dmEmbed] });

        // לוג של ההודעה
        const adminLogChannel = client.channels.cache.get(adminLogChannelId);
        if (adminLogChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor(0x0000FF)  // כחול
            .setTitle('לוג הודעה פרטית')
            .setDescription(`**המשתמש שהפעיל את הפקודה:** ${message.author.tag} (ID: ${message.author.id})\n**ההודעה נשלחה ל:** ${mentionedUser.tag} (ID: ${mentionedUser.id}) \n**תוכן ההודעה:** ${messageContent}`);
          await adminLogChannel.send({ embeds: [logEmbed] });
        }

        await message.reply(`ההודעה נשלחה בהצלחה ל- ${mentionedUser.tag}`);
      } catch (error) {
        console.error(error);
        await message.reply('לא ניתן לשלוח את ההודעה. אולי המשתמש חסם את הבוט או שהבוט לא יכול לשלוח הודעות פרטיות.');
      }
    } else {
      await message.reply('שכחת לתייג משתמש או לציין הודעה.');
    }
  }

  // מערכת קבלת רול
  if (message.content === '!setup1') {
    // בדיקת אם למשתמש יש את הרול המתאים
    if (!message.guild.members.cache.get(message.author.id)?.roles.cache.has(requiredRoleId)) {
      return message.reply('אין לך הרשאות לבצע את הפקודה הזו!');
    }

    const embed = {
      content: null,
      embeds: [
        {
          title: '🔍 לקיחת רולים',
          description: "בחרו את אחד מהכפתורים למטה כדי לקחת או להסיר את הרול",
          color: 592895,
        },
        {
          title: "לקיחת רולים | Discord Israel Project",
          description: "בחדר הזה תוכלו לקחת את הרול **Server Updates** אשר יתייג אתכם בעדכונים. בחרו את הכפתור המתאים למטה.",
          color: 15461631,
          footer: {
            text: "Discord Israel Project | 2024 | Develop By : itshadoww | Project Director."
          },
          thumbnail: {
            url: "https://media.discordapp.net/attachments/1318603552397987881/1318603589270372433/DSC_IL.png?ex=6762ecca&is=67619b4a&hm=1e8b799d1bfe8f87ebc4733030ce055deeb53e2b8a4589979e3b37b5637ddb5f&=&format=webp&quality=lossless&width=671&height=671"
          }
        }
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: 'לקיחת הרול',
              style: 3,
              emoji: { name: '📣' },
              custom_id: 'give_role',
            }
          ]
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              label: 'הסרת הרול',
              style: 4,
              emoji: { name: '🚨' },
              custom_id: 'remove_role',
            }
          ]
        }
      ]
    };

    // שליחת הודעת האמבד והכפתורים
    await message.channel.send(embed);
  }
});

// טיפול באינטראקציות (כפתורים)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const member = interaction.member;
  const role = interaction.guild.roles.cache.get('1313907593592442912'); // ID של הרול שאתה רוצה להקצות

  const currentTime = Date.now();
  const cooldownAmount = 5000; // 5 שניות קולדאון
  if (cooldowns.has(interaction.user.id)) {
    const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;
    if (currentTime < expirationTime) {
      const timeLeft = (expirationTime - currentTime) / 1000; // הזמן שנותר בקולדאון
      return interaction.reply({
        content: `אתה נמצא בקולדאון. יש להמתין ${timeLeft.toFixed(1)} שניות מכל לחיצת כפתור במערכת.`,
        ephemeral: true
      });
    }
  }

  // עדכון זמן הקולדאון
  cooldowns.set(interaction.user.id, currentTime);

  let actionTaken = ''; // משתנה שיגדיר את הפעולה שבוצעה
  if (interaction.customId === 'give_role') {
    // הוספת הרול
    if (role) {
      await member.roles.add(role);
      actionTaken = 'לקיחת רול';
      await interaction.reply({ content: 'קיבלת את רול עדכוני השרת בהצלחה!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'הרול לא נמצא!', ephemeral: true });
    }
  }

  if (interaction.customId === 'remove_role') {
    // הסרת הרול
    if (role && member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      actionTaken = 'הסרת רול';
      await interaction.reply({ content: 'הרול עדכוני השרת הוסר עבורך בהצלחה!', ephemeral: true });
    } else if (role) {
      await interaction.reply({ content: 'אין ברשותך את הרול!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'הרול לא נמצא!', ephemeral: true });
    }
  }

  // שליחת לוג לחדר המנהלים
  const adminLogChannel = interaction.guild.channels.cache.get(adminLogChannelId); // חדר הלוגים של המנהלים
  if (adminLogChannel) {
    const logEmbed = {
      title: "DiscordIL Managers | Roles System",
      description: `**הממבר:** ${member} \n**הכפתור:** ${actionTaken}`,
      color: 15461631,
    };
    await adminLogChannel.send({ embeds: [logEmbed] });
  }

  // עדכון המפה של הקולדאון
  setTimeout(() => {
    cooldowns.delete(interaction.user.id);
  }, cooldownAmount);
});

client.login(token);
