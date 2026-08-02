import { BotConfig, FrameworkTarget } from '../types';

export function generateBotCode(config: BotConfig, framework: FrameworkTarget): string {
  const channelUsernamesStr = config.channels.map(c => `"${c.username}"`).join(", ");
  const channelListFormatted = config.channels.map(c => `@${c.username.replace('@', '')}`).join(', ');

  switch (framework) {
    case 'aiogram3':
      return `import asyncio
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart, Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ChatPermissions
from aiogram.exceptions import TelegramBadRequest

# ==========================================
# TELEGRAM FORCE CHANNEL JOIN BOT (Aiogram 3)
# Group Protection Guard Bot
# ==========================================

BOT_TOKEN = "${config.botToken || 'YOUR_BOT_TOKEN_HERE'}"
REQUIRED_CHANNELS = [${channelUsernamesStr || '"@my_official_channel"'}]
AUTO_DELETE_SECONDS = ${config.autoDeleteTimerSec || 30}
ACTION_MODE = "${config.actionMode}"  # delete_mute, delete_warn, mute_only

logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

def get_join_keyboard(missing_channels):
    buttons = []
    for ch in missing_channels:
        clean_ch = ch.replace("@", "")
        url = f"https://t.me/{clean_ch}"
        buttons.append([InlineKeyboardButton(text=f"📢 Join {ch}", url=url)])
    
    # Verification check button
    buttons.append([InlineKeyboardButton(text="✅ Verify / I Have Joined", callback_data="check_join")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

async function_check_membership(user_id: int):
    missing = []
    for channel in REQUIRED_CHANNELS:
        try:
            member = await bot.get_chat_member(chat_id=channel, user_id=user_id)
            if member.status in ['left', 'kicked', 'restricted']:
                missing.append(channel)
        except Exception as e:
            logging.error(f"Error checking {channel} for user {user_id}: {e}")
            missing.append(channel)
    return missing

@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    await message.reply(
        "👋 **Force Join Bot is Active!**\\n\\n"
        "Add me as an Admin to your Telegram Group to force users to subscribe to required channels before chatting!"
    )

@dp.message(F.chat.type.in_({'group', 'supergroup'}))
async def enforce_channel_join(message: types.Message):
    # Ignore admin check if whitelist enabled
    if ${config.whitelistAdmins ? 'True' : 'False'}:
        try:
            member = await bot.get_chat_member(message.chat.id, message.from_user.id)
            if member.status in ['administrator', 'creator']:
                return
        except Exception:
            pass

    # Ignore bot messages
    if message.from_user.is_bot:
        return

    # Check exempted commands
    if message.text and any(message.text.startswith(cmd) for cmd in [${config.exemptCommands.map(c => `"${c}"`).join(', ')}]):
        return

    missing_channels = await function_check_membership(message.from_user.id)

    if missing_channels:
        # Delete non-subscribed user's message
        try:
            await message.delete()
        except TelegramBadRequest:
            logging.warning("Failed to delete message. Bot needs Delete Messages permission.")

        user_mention = message.from_user.mention_html()
        warning_text = (
            f"⚠️ Hey {user_mention}, you must subscribe to our required channel(s) "
            f"before sending messages in **{message.chat.title}**!\\n\\n"
            f"👉 **Required Channels:** {', '.join(missing_channels)}"
        )

        keyboard = get_join_keyboard(missing_channels)
        notice_msg = await message.answer(warning_text, parse_mode="HTML", reply_markup=keyboard)

        # Mute user if configured
        if ACTION_MODE == "delete_mute":
            try:
                await bot.restrict_chat_member(
                    chat_id=message.chat.id,
                    user_id=message.from_user.id,
                    permissions=ChatPermissions(can_send_messages=False)
                )
            except Exception as e:
                logging.error(f"Restrict error: {e}")

        # Auto-delete bot notice after timer
        if AUTO_DELETE_SECONDS > 0:
            await asyncio.sleep(AUTO_DELETE_SECONDS)
            try:
                await notice_msg.delete()
            except Exception:
                pass

@dp.callback_query(F.data == "check_join")
async def verify_callback(callback: types.CallbackQuery):
    missing_channels = await function_check_membership(callback.from_user.id)

    if not missing_channels:
        # Unmute user in group
        try:
            await bot.restrict_chat_member(
                chat_id=callback.message.chat.id,
                user_id=callback.from_user.id,
                permissions=ChatPermissions(
                    can_send_messages=True,
                    can_send_media_messages=True,
                    can_send_other_messages=True,
                    can_add_web_page_previews=True
                )
            )
        except Exception as e:
            logging.error(f"Unmute error: {e}")

        await callback.answer("🎉 Verification Successful! You can now send messages in the group.", show_alert=True)
        try:
            await callback.message.delete()
        except Exception:
            pass
    else:
        channels_str = "\\n• ".join(missing_channels)
        await callback.answer(
            f"❌ You still haven't joined:\\n• {channels_str}\\n\\nPlease join all channels and try again!",
            show_alert=True
        )

async def main():
    print("🚀 Force Join Bot is running...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
`;

    case 'pyrogram':
      return `import asyncio
import logging
from pyrogram import Client, filters
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ChatPermissions

BOT_TOKEN = "${config.botToken || 'YOUR_BOT_TOKEN_HERE'}"
REQUIRED_CHANNELS = [${channelUsernamesStr || '"@my_official_channel"'}]

app = Client("force_join_bot", bot_token=BOT_TOKEN, api_id=12345, api_hash="YOUR_API_HASH")

async def check_membership(client, user_id):
    missing = []
    for channel in REQUIRED_CHANNELS:
        try:
            member = await client.get_chat_member(channel, user_id)
            if member.status in ["left", "banned"]:
                missing.append(channel)
        except Exception:
            missing.append(channel)
    return missing

@app.on_message(filters.group & ~filters.bot)
async def force_join_check(client, message):
    missing = await check_membership(client, message.from_user.id)
    if missing:
        try:
            await message.delete()
        except Exception:
            pass
        
        buttons = [[InlineKeyboardButton(f"📢 Join {ch}", url=f"https://t.me/{ch.replace('@','')}")] for ch in missing]
        buttons.append([InlineKeyboardButton("✅ Verify / I Joined", callback_data="verify_join")])
        
        warn = await message.reply(
            f"⚠️ Hey {message.from_user.first_name}, please join our channels to chat!",
            reply_markup=InlineKeyboardMarkup(buttons)
        )
        if ${config.autoDeleteTimerSec || 30} > 0:
            await asyncio.sleep(${config.autoDeleteTimerSec || 30})
            await warn.delete()

@app.on_callback_query(filters.regex("verify_join"))
async def on_verify(client, callback_query):
    missing = await check_membership(client, callback_query.from_user.id)
    if not missing:
        await callback_query.answer("🎉 Verified! You can now type in the group.", show_alert=True)
        await callback_query.message.delete()
    else:
        await callback_query.answer(f"❌ Still missing: {', '.join(missing)}", show_alert=True)

app.run()
`;

    case 'telebot':
      return `import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

BOT_TOKEN = "${config.botToken || 'YOUR_BOT_TOKEN_HERE'}"
REQUIRED_CHANNELS = [${channelUsernamesStr || '"@my_official_channel"'}]

bot = telebot.TeleBot(BOT_TOKEN)

def check_user_joined(user_id):
    missing = []
    for ch in REQUIRED_CHANNELS:
        try:
            m = bot.get_chat_member(ch, user_id)
            if m.status in ['left', 'kicked']:
                missing.append(ch)
        except Exception:
            missing.append(ch)
    return missing

@bot.message_handler(func=lambda msg: msg.chat.type in ['group', 'supergroup'])
def check_group_message(message):
    if message.from_user.is_bot:
        return
    missing = check_user_joined(message.from_user.id)
    if missing:
        try:
            bot.delete_message(message.chat.id, message.message_id)
        except Exception:
            pass
        
        markup = InlineKeyboardMarkup()
        for ch in missing:
            clean = ch.replace("@", "")
            markup.add(InlineKeyboardButton(text=f"📢 Join {ch}", url=f"https://t.me/{clean}"))
        markup.add(InlineKeyboardButton(text="✅ Verify Membership", callback_data="verify_sub"))
        
        bot.send_message(
            message.chat.id,
            f"⚠️ {message.from_user.first_name}, join our channels to speak in this group!",
            reply_markup=markup
        )

@bot.callback_query_handler(func=lambda call: call.data == "verify_sub")
def callback_verify(call):
    missing = check_user_joined(call.from_user.id)
    if not missing:
        bot.answer_callback_query(call.id, "🎉 Verified! Enjoy chatting.", show_alert=True)
        bot.delete_message(call.message.chat.id, call.message.message_id)
    else:
        bot.answer_callback_query(call.id, f"❌ You still need to join: {', '.join(missing)}", show_alert=True)

bot.infinity_polling()
`;

    case 'telegraf':
      return `import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN || '${config.botToken || 'YOUR_BOT_TOKEN_HERE'}';
const REQUIRED_CHANNELS = [${channelUsernamesStr || '"@my_official_channel"'}];

const bot = new Telegraf(BOT_TOKEN);

async function checkMembership(ctx, userId) {
  const missing = [];
  for (const channel of REQUIRED_CHANNELS) {
    try {
      const member = await ctx.telegram.getChatMember(channel, userId);
      if (['left', 'kicked'].includes(member.status)) {
        missing.push(channel);
      }
    } catch (err) {
      missing.push(channel);
    }
  }
  return missing;
}

bot.on('message', async (ctx) => {
  if (['group', 'supergroup'].includes(ctx.chat.type)) {
    if (ctx.from.is_bot) return;

    const missing = await checkMembership(ctx, ctx.from.id);
    if (missing.length > 0) {
      try {
        await ctx.deleteMessage();
      } catch (e) {}

      const buttons = missing.map(ch => 
        Markup.button.url(\`📢 Join \${ch}\`, \`https://t.me/\${ch.replace('@', '')}\`)
      );
      buttons.push(Markup.button.callback('✅ Verify / I Joined', 'verify_join'));

      const warnMsg = await ctx.reply(
        \`⚠️ Hey \${ctx.from.first_name}, you must subscribe to our channel(s) before typing in **\${ctx.chat.title}**!\\n\\n\` +
        \`Required: \${missing.join(', ')}\`,
        Markup.inlineKeyboard(buttons, { columns: 1 })
      );

      if (${config.autoDeleteTimerSec || 30} > 0) {
        setTimeout(() => {
          ctx.telegram.deleteMessage(ctx.chat.id, warnMsg.message_id).catch(() => {});
        }, ${config.autoDeleteTimerSec || 30} * 1000);
      }
    }
  }
});

bot.action('verify_join', async (ctx) => {
  const missing = await checkMembership(ctx, ctx.from.id);
  if (missing.length === 0) {
    await ctx.answerCbQuery('🎉 Verified! You can now send messages in the group.', { show_alert: true });
    await ctx.deleteMessage().catch(() => {});
  } else {
    await ctx.answerCbQuery(\`❌ You still need to join: \${missing.join(', ')}\`, { show_alert: true });
  }
});

bot.launch().then(() => console.log('🚀 Force Join Bot is running...'));
`;

    case 'grammy':
      return `import { Bot, InlineKeyboard } from "grammy";

const BOT_TOKEN = process.env.BOT_TOKEN || "${config.botToken || 'YOUR_BOT_TOKEN_HERE'}";
const REQUIRED_CHANNELS = [${channelUsernamesStr || '"@my_official_channel"'}];

const bot = new Bot(BOT_TOKEN);

async function getMissingChannels(ctx, userId) {
  const missing = [];
  for (const ch of REQUIRED_CHANNELS) {
    try {
      const member = await ctx.api.getChatMember(ch, userId);
      if (["left", "kicked"].includes(member.status)) {
        missing.push(ch);
      }
    } catch {
      missing.push(ch);
    }
  }
  return missing;
}

bot.on("message", async (ctx) => {
  if (["group", "supergroup"].includes(ctx.chat.type)) {
    if (ctx.from.is_bot) return;

    const missing = await getMissingChannels(ctx, ctx.from.id);
    if (missing.length > 0) {
      await ctx.deleteMessage().catch(() => {});

      const keyboard = new InlineKeyboard();
      for (const ch of missing) {
        keyboard.url(\`📢 Join \${ch}\`, \`https://t.me/\${ch.replace("@", "")}\`).row();
      }
      keyboard.text("✅ Verify Membership", "verify_join");

      await ctx.reply(
        \`⚠️ Hey \${ctx.from.first_name}, please join our channels to chat here!\\n\\nRequired: \${missing.join(", ")}\`,
        { reply_markup: keyboard }
      );
    }
  }
});

bot.callbackQuery("verify_join", async (ctx) => {
  const missing = await getMissingChannels(ctx, ctx.from.id);
  if (missing.length === 0) {
    await ctx.answerCallbackQuery({ text: "🎉 Verified! You can now chat.", show_alert: true });
    await ctx.deleteMessage().catch(() => {});
  } else {
    await ctx.answerCallbackQuery({
      text: \`❌ Please join: \${missing.join(", ")}\`,
      show_alert: true
    });
  }
});

bot.start();
`;

    default:
      return '';
  }
}

export function generateDockerfile(): string {
  return `# Production Dockerfile for Telegram Force Join Bot
FROM python:3.11-slim

WORKDIR /app

# Prevent python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "bot.py"]
`;
}

export function generateRequirementsTxt(): string {
  return `aiogram==3.15.0
python-dotenv==1.0.1
requests==2.32.3
`;
}

export function generateEnvFile(botToken: string): string {
  return `# Telegram Bot Environment Variables
BOT_TOKEN="${botToken || '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ'}"
LOG_LEVEL="INFO"
`;
}

export function generateRenderYaml(): string {
  return `# Render Blueprint Configuration (render.yaml)
# Deploy as a Background Worker or Web Service on Render.com

services:
  - type: worker
    name: telegram-force-join-bot
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "python bot.py"
    envVars:
      - key: BOT_TOKEN
        sync: false
      - key: LOG_LEVEL
        value: INFO
`;
}

export function generateDeploymentGuide(): string {
  return `### 🚀 Step-by-Step Deployment Guide

1. **Create Bot on Telegram**:
   - Search for **@BotFather** on Telegram.
   - Send /newbot and follow instructions to get your **HTTP API Token**.

2. **Add Bot to Target Channels & Groups**:
   - Add your bot as an **Administrator** in your **Target Channel(s)** (Must have *Invite Users* permission).
   - Add your bot as an **Administrator** in your **Telegram Group** (Must have *Delete Messages*, *Restrict Members*, *Pin Messages* permissions).

3. **Deploying on Render (Render.com)**:
   - **Method A: Background Worker (Recommended for Long-Polling)**
     1. Push your generated code (bot.py, requirements.txt, render.yaml) to a GitHub repository.
     2. Log in to Render.com and click **New +** -> **Background Worker**.
     3. Connect your GitHub repository.
     4. Set **Environment**: Python 3.
     5. Set **Build Command**: pip install -r requirements.txt
     6. Set **Start Command**: python bot.py
     7. Under **Environment Variables**, add:
        - Key: BOT_TOKEN | Value: <Your Telegram Bot Token from @BotFather>
     8. Click **Create Background Worker**!

   - **Method B: Docker Container on Render**
     1. In Render, select **New +** -> **Web Service** or **Background Worker**.
     2. Choose **Docker** as the Runtime.
     3. Add BOT_TOKEN environment variable.
     4. Render will automatically build from your Dockerfile and start your bot!

4. **Other Hosting Options**:
   - **Heroku / Railway / VPS**:
     - Push code to GitHub repository.
     - Set Environment Variable BOT_TOKEN.
     - Run using Docker or Python runtime.
`;
}
