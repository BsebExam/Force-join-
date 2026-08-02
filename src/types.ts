export type FileMode = 'delete_mute' | 'delete_warn' | 'mute_only' | 'kick_ban';

export interface TelegramChannel {
  id: string;
  title: string;
  username: string; // e.g. @tech_updates or https://t.me/tech_updates
  inviteLink?: string;
  subscriberCount?: number;
  isPrivate?: boolean;
}

export interface TelegramButton {
  id: string;
  text: string;
  type: 'channel_link' | 'verify' | 'custom_url';
  url?: string;
  channelId?: string;
}

export interface BotConfig {
  botToken: string;
  botUsername: string;
  botName: string;
  channels: TelegramChannel[];
  actionMode: FileMode;
  autoDeleteTimerSec: number; // 0 for disabled, or 10, 30, 60, etc.
  warningMessageText: string;
  successMessageText: string;
  customButtons: TelegramButton[];
  whitelistAdmins: boolean;
  whitelistBots: boolean;
  whitelistedUsers: string[]; // usernames or IDs
  exemptCommands: string[]; // e.g. ["/start", "/help", "/rules"]
  groupTitle: string;
  groupUsername: string;
}

export interface SimUser {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
  avatarText: string;
  role: 'member' | 'admin' | 'bot' | 'creator';
  isSubscribedTo: string[]; // list of channel IDs user is joined to
  isRestricted: boolean; // restricted in group chat
}

export interface SimMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'member' | 'admin' | 'bot' | 'creator';
  senderAvatarColor: string;
  senderAvatarText: string;
  text: string;
  timestamp: string;
  isBotNotice?: boolean;
  buttons?: TelegramButton[];
  replyToMessageId?: string;
  isDeleted?: boolean;
  autoDeleteCountdown?: number;
}

export interface LiveBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export interface LiveChatMemberInfo {
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
  user: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
}

export type FrameworkTarget = 'aiogram3' | 'pyrogram' | 'telebot' | 'telegraf' | 'grammy';
