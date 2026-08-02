import React, { useState, useEffect, useRef } from 'react';
import { BotConfig, SimUser, SimMessage, TelegramButton } from '../types';
import { TelegramMessage } from './TelegramMessage';
import confetti from 'canvas-confetti';
import {
  Send,
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  RotateCcw,
  PlusCircle,
  ExternalLink,
  Check,
  Lock,
  Unlock,
  VolumeX,
  Volume2,
  Bell,
  Sparkles,
} from 'lucide-react';

interface SimulatorProps {
  config: BotConfig;
  onUpdateConfig: (newConfig: Partial<BotConfig>) => void;
}

export const Simulator: React.FC<SimulatorProps> = ({ config, onUpdateConfig }) => {
  // Simulated Users
  const [users, setUsers] = useState<SimUser[]>([
    {
      id: 'u1',
      name: 'Alex Rivera',
      username: 'alex_trader',
      avatarColor: '#0088cc',
      avatarText: 'AR',
      role: 'member',
      isSubscribedTo: ['ch1', 'ch2'], // Subscribed to all
      isRestricted: false,
    },
    {
      id: 'u2',
      name: 'David Kim (Test New User)',
      username: 'david_k',
      avatarColor: '#e11d48',
      avatarText: 'DK',
      role: 'member',
      isSubscribedTo: [], // NOT SUBSCRIBED - Will trigger Force Join!
      isRestricted: false,
    },
    {
      id: 'u3',
      name: 'Sarah Admin',
      username: 'sarah_admin',
      avatarColor: '#059669',
      avatarText: 'SA',
      role: 'admin',
      isSubscribedTo: [],
      isRestricted: false,
    },
  ]);

  const [activeUserId, setActiveUserId] = useState<string>('u2'); // Default to David (Non-subscribed)
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<SimMessage[]>([]);
  const [toastAlert, setToastAlert] = useState<{ title: string; body: string; type: 'success' | 'error' | 'info' } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initial welcome bot message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg_welcome',
          senderId: 'bot',
          senderName: config.botName || 'Force Join Guard Bot',
          senderRole: 'bot',
          senderAvatarColor: '#0088cc',
          senderAvatarText: 'BOT',
          text: `🛡️ **Telegram Force Join Protection Guard Active**\n\nAll members in **${config.groupTitle}** must join required channels to chat. Try sending a message as David Kim (Non-subscribed)!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBotNotice: true,
        },
      ]);
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, toastAlert]);

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  // Helper to trigger Telegram alert toast
  const showToast = (title: string, body: string, type: 'success' | 'error' | 'info') => {
    setToastAlert({ title, body, type });
    setTimeout(() => {
      setToastAlert(null);
    }, 4500);
  };

  // Channel Membership Toggle
  const toggleUserSubscription = (userId: string, channelId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const joined = u.isSubscribedTo.includes(channelId);
          const nextSubs = joined
            ? u.isSubscribedTo.filter((id) => id !== channelId)
            : [...u.isSubscribedTo, channelId];
          return { ...u, isSubscribedTo: nextSubs };
        }
        return u;
      })
    );
  };

  // Check missing channels for user
  const getMissingChannels = (user: SimUser) => {
    return config.channels.filter((ch) => !user.isSubscribedTo.includes(ch.id));
  };

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (activeUser.isRestricted) {
      showToast(
        '🔇 Muted in Group',
        'You are currently restricted from sending messages because you have not joined the required channels.',
        'error'
      );
      return;
    }

    const newMsgId = `msg_${Date.now()}`;
    const userMessageText = inputText.trim();
    setInputText('');

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Is admin whitelisted?
    if (activeUser.role === 'admin' && config.whitelistAdmins) {
      // Admin passes directly
      setMessages((prev) => [
        ...prev,
        {
          id: newMsgId,
          senderId: activeUser.id,
          senderName: activeUser.name,
          senderRole: activeUser.role,
          senderAvatarColor: activeUser.avatarColor,
          senderAvatarText: activeUser.avatarText,
          text: userMessageText,
          timestamp: timeNow,
        },
      ]);
      return;
    }

    // Check force join
    const missing = getMissingChannels(activeUser);

    if (missing.length === 0) {
      // User is verified! Message posts normally.
      setMessages((prev) => [
        ...prev,
        {
          id: newMsgId,
          senderId: activeUser.id,
          senderName: activeUser.name,
          senderRole: activeUser.role,
          senderAvatarColor: activeUser.avatarColor,
          senderAvatarText: activeUser.avatarText,
          text: userMessageText,
          timestamp: timeNow,
        },
      ]);
    } else {
      // FORCE JOIN TRIGGERED!
      // Step 1: Add user message then mark deleted or intercept
      const userMsgObj: SimMessage = {
        id: newMsgId,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderRole: activeUser.role,
        senderAvatarColor: activeUser.avatarColor,
        senderAvatarText: activeUser.avatarText,
        text: userMessageText,
        timestamp: timeNow,
        isDeleted: true, // Deleted by bot
      };

      // Restrict user if action mode is delete_mute
      if (config.actionMode === 'delete_mute') {
        setUsers((prev) =>
          prev.map((u) => (u.id === activeUser.id ? { ...u, isRestricted: true } : u))
        );
      }

      // Generate buttons for missing channels
      const missingButtons: TelegramButton[] = missing.map((ch) => ({
        id: `btn_join_${ch.id}`,
        text: `📢 Join ${ch.title} (${ch.username})`,
        type: 'channel_link',
        url: ch.inviteLink || `https://t.me/${ch.username.replace('@', '')}`,
        channelId: ch.id,
      }));

      // Add Verify Button
      missingButtons.push({
        id: 'btn_verify_sub',
        text: '✅ Verify / I Have Joined',
        type: 'verify',
      });

      const missingNames = missing.map((m) => `@${m.username.replace('@', '')}`).join(', ');
      const botNoticeText = (config.warningMessageText ||
        '⚠️ Hey {mention}, you must subscribe to our required channel(s) before sending messages in this group!')
        .replace('{mention}', activeUser.name)
        .replace('{channels}', missingNames);

      const noticeMsgId = `bot_notice_${Date.now()}`;
      const botNoticeObj: SimMessage = {
        id: noticeMsgId,
        senderId: 'bot',
        senderName: config.botName || 'Force Join Guard Bot',
        senderRole: 'bot',
        senderAvatarColor: '#0088cc',
        senderAvatarText: 'BOT',
        text: botNoticeText,
        timestamp: timeNow,
        isBotNotice: true,
        buttons: missingButtons,
        autoDeleteCountdown: config.autoDeleteTimerSec || 30,
      };

      setMessages((prev) => [...prev, userMsgObj, botNoticeObj]);

      showToast(
        '⚡ Bot Intercepted Message!',
        `Deleted message from ${activeUser.name}. Required channels: ${missingNames}`,
        'error'
      );
    }
  };

  // Button click in Telegram Message
  const handleButtonClick = (buttonId: string, buttonType: string, url?: string) => {
    if (buttonType === 'channel_link') {
      // Find channel
      const matchingCh = config.channels.find((c) => buttonId.includes(c.id));
      if (matchingCh) {
        toggleUserSubscription(activeUser.id, matchingCh.id);
        showToast(
          '📢 Channel Joined!',
          `Simulated joining ${matchingCh.title} (${matchingCh.username}) as ${activeUser.name}.`,
          'success'
        );
      } else if (url) {
        window.open(url, '_blank');
      }
    } else if (buttonType === 'verify') {
      // Check membership
      const missing = getMissingChannels(activeUser);

      if (missing.length === 0) {
        // Success!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });

        // Un-restrict user
        setUsers((prev) =>
          prev.map((u) => (u.id === activeUser.id ? { ...u, isRestricted: false } : u))
        );

        // Delete notice message
        setMessages((prev) => prev.filter((m) => !m.isBotNotice || !m.buttons));

        showToast(
          '🎉 Verification Successful!',
          `Welcome back ${activeUser.name}! You are unmuted and can now post in ${config.groupTitle}.`,
          'success'
        );
      } else {
        const remainingStr = missing.map((m) => `@${m.username.replace('@', '')}`).join(', ');
        showToast(
          '❌ Subscription Missing!',
          `You have not joined all required channels yet. Please join: ${remainingStr}`,
          'error'
        );
      }
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg_welcome',
        senderId: 'bot',
        senderName: config.botName || 'Force Join Guard Bot',
        senderRole: 'bot',
        senderAvatarColor: '#0088cc',
        senderAvatarText: 'BOT',
        text: `🛡️ **Telegram Force Join Protection Guard Active**\n\nAll members in **${config.groupTitle}** must join required channels to chat. Try sending a message as David Kim (Non-subscribed)!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isBotNotice: true,
      },
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Left Column: Interactive Chat Window */}
      <div className="lg:col-span-8 flex flex-col bg-[#0e1621] rounded-2xl border border-[#242f3d] shadow-2xl overflow-hidden h-[680px]">
        {/* Telegram Chat Header */}
        <div className="bg-[#17212b] border-b border-[#242f3d] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0088cc] to-[#3b82f6] flex items-center justify-center font-bold text-white shadow-md">
              💬
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight flex items-center gap-2">
                {config.groupTitle || 'Crypto & Tech Discussion'}
                <span className="text-[10px] bg-[#242f3d] text-[#64b5ef] px-2 py-0.5 rounded font-medium">
                  SUPERGROUP
                </span>
              </h2>
              <p className="text-xs text-[#7f91a4]">
                3 members • {users.filter((u) => !u.isRestricted).length} active chatter(s)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetChat}
              title="Reset Chat History"
              className="p-2 text-[#7f91a4] hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Telegram Chat Pinned Channel Banner */}
        <div className="bg-[#182533] border-b border-[#242f3d] px-4 py-2 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2 overflow-hidden">
            <Bell className="w-4 h-4 text-[#64b5ef] shrink-0 animate-pulse" />
            <span className="font-semibold text-[#64b5ef]">Force Join Required:</span>
            <span className="truncate text-slate-300">
              {config.channels.map((c) => `@${c.username.replace('@', '')}`).join(' and ')}
            </span>
          </div>
          <span className="text-[10px] bg-[#0088cc]/20 text-[#64b5ef] px-2 py-0.5 rounded font-mono shrink-0">
            {config.actionMode.toUpperCase()}
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-[#0e1621] to-[#17212b]/40 space-y-3"
        >
          {messages.map((msg) => (
            <TelegramMessage
              key={msg.id}
              message={msg}
              onButtonClick={handleButtonClick}
              currentUserId={activeUserId}
            />
          ))}
        </div>

        {/* Telegram Alert Popup / Toast Notification */}
        {toastAlert && (
          <div
            className={`mx-4 my-2 p-3 rounded-xl border text-xs flex items-start space-x-3 shadow-xl transition-all ${
              toastAlert.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toastAlert.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-blue-950/90 border-blue-500/50 text-blue-200'
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold">{toastAlert.title}</h4>
              <p className="mt-0.5 leading-relaxed text-[11px] opacity-90">{toastAlert.body}</p>
            </div>
          </div>
        )}

        {/* Telegram Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="bg-[#17212b] border-t border-[#242f3d] p-3 flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={activeUser.isRestricted}
              placeholder={
                activeUser.isRestricted
                  ? '🔇 Muted by Force Join Bot. Join required channels & click Verify!'
                  : `Message as ${activeUser.name}...`
              }
              className={`w-full py-2.5 px-4 rounded-xl text-sm outline-none transition-all ${
                activeUser.isRestricted
                  ? 'bg-rose-950/20 text-rose-300 border border-rose-500/30 placeholder-rose-400/60 cursor-not-allowed'
                  : 'bg-[#242f3d] text-white placeholder-[#7f91a4] focus:ring-2 focus:ring-[#0088cc]/50 border border-[#2b3a4c]'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={activeUser.isRestricted || !inputText.trim()}
            className={`p-2.5 rounded-xl text-white font-semibold flex items-center justify-center transition-all ${
              activeUser.isRestricted || !inputText.trim()
                ? 'bg-[#242f3d] text-[#7f91a4] cursor-not-allowed'
                : 'bg-[#0088cc] hover:bg-[#0077b3] active:scale-95 shadow-md shadow-[#0088cc]/30'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Column: Simulation Control Panel */}
      <div className="lg:col-span-4 space-y-6">
        {/* User Role Switcher */}
        <div className="bg-[#17212b] rounded-2xl border border-[#242f3d] p-5 shadow-xl">
          <h3 className="font-bold text-white text-sm mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0088cc]" />
              Select Active User Persona
            </span>
          </h3>

          <div className="space-y-2">
            {users.map((u) => {
              const isSelected = u.id === activeUserId;
              const missingCount = getMissingChannels(u).length;
              const isSubbed = missingCount === 0;

              return (
                <button
                  key={u.id}
                  onClick={() => setActiveUserId(u.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#242f3d] border-[#0088cc] shadow-md shadow-[#0088cc]/10 ring-1 ring-[#0088cc]'
                      : 'bg-[#182533] border-[#242f3d] hover:bg-[#1f2c3a]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: u.avatarColor }}
                    >
                      {u.avatarText}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white leading-tight">{u.name}</h4>
                      <p className="text-[11px] text-[#7f91a4]">@{u.username}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {u.isRestricted ? (
                      <span className="inline-flex items-center text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-medium border border-rose-500/30">
                        <VolumeX className="w-3 h-3 mr-1" />
                        Muted
                      </span>
                    ) : isSubbed ? (
                      <span className="inline-flex items-center text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-500/30">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Joined All
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-medium border border-amber-500/30">
                        <UserX className="w-3 h-3 mr-1" />
                        Missing {missingCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Channel Subscription Toggles for Active User */}
        <div className="bg-[#17212b] rounded-2xl border border-[#242f3d] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {activeUser.name}&apos;s Subscriptions
            </h3>
          </div>
          <p className="text-xs text-[#7f91a4] mb-3">
            Toggle which required channels this user is currently joined to:
          </p>

          <div className="space-y-2">
            {config.channels.map((channel) => {
              const isJoined = activeUser.isSubscribedTo.includes(channel.id);
              return (
                <div
                  key={channel.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isJoined
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-[#182533] border-[#242f3d] text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div className={`p-1.5 rounded-lg ${isJoined ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#242f3d] text-[#7f91a4]'}`}>
                      {isJoined ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-xs text-white leading-tight">{channel.title}</h4>
                      <p className="text-[10px] text-[#7f91a4]">@{channel.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleUserSubscription(activeUser.id, channel.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isJoined
                        ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                    }`}
                  >
                    {isJoined ? 'Leave Channel' : 'Join Channel'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Bot Rules Summary */}
        <div className="bg-[#17212b] rounded-2xl border border-[#242f3d] p-5 shadow-xl text-xs space-y-2 text-[#7f91a4]">
          <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#0088cc]" />
            Protection Guard Status
          </h4>
          <div className="flex justify-between border-b border-[#242f3d] pb-1.5">
            <span>Action Mode:</span>
            <span className="font-semibold text-white capitalize">{config.actionMode.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between border-b border-[#242f3d] pb-1.5">
            <span>Auto-Delete Notice:</span>
            <span className="font-semibold text-white">{config.autoDeleteTimerSec} seconds</span>
          </div>
          <div className="flex justify-between border-b border-[#242f3d] pb-1.5">
            <span>Admin Exempt:</span>
            <span className="font-semibold text-emerald-400">{config.whitelistAdmins ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span>Required Channels:</span>
            <span className="font-semibold text-white">{config.channels.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
