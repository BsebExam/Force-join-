import React, { useState } from 'react';
import { BotConfig, LiveBotInfo, LiveChatMemberInfo } from '../types';
import {
  Radio,
  Key,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Globe,
  Terminal,
  ExternalLink,
  Bot,
  Layers,
} from 'lucide-react';

interface LiveBotConnectorProps {
  config: BotConfig;
  onUpdateConfig: (newConfig: Partial<BotConfig>) => void;
}

export const LiveBotConnector: React.FC<LiveBotConnectorProps> = ({ config, onUpdateConfig }) => {
  const [botTokenInput, setBotTokenInput] = useState(config.botToken || '');
  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState<LiveBotInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Membership Check Form
  const [testUserId, setTestUserId] = useState('');
  const [testChannelUsername, setTestChannelUsername] = useState(config.channels[0]?.username || '@mychannel');
  const [memberResult, setMemberResult] = useState<LiveChatMemberInfo | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Test Message Form
  const [testChatId, setTestChatId] = useState('');
  const [testMessageStatus, setTestMessageStatus] = useState<string | null>(null);

  // Test getMe API call via backend proxy
  const handleTestBotToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!botTokenInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setBotInfo(null);

    try {
      const response = await fetch('/api/telegram/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botTokenInput.trim(),
          method: 'getMe',
        }),
      });

      const data = await response.json();

      if (data.ok && data.result) {
        setBotInfo(data.result);
        onUpdateConfig({
          botToken: botTokenInput.trim(),
          botUsername: data.result.username || config.botUsername,
          botName: data.result.first_name || config.botName,
        });
      } else {
        setErrorMsg(data.description || 'Invalid Bot Token. Check @BotFather token.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to communicate with Telegram API server.');
    } finally {
      setLoading(false);
    }
  };

  // Test getChatMember live call
  const handleCheckMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botTokenInput.trim() || !testUserId || !testChannelUsername) {
      alert('Please connect Bot Token, User ID, and Channel Username.');
      return;
    }

    setMemberLoading(true);
    setMemberResult(null);

    try {
      let cleanChannel = testChannelUsername.trim();
      if (!cleanChannel.startsWith('@') && !cleanChannel.startsWith('-')) {
        cleanChannel = `@${cleanChannel}`;
      }

      const response = await fetch('/api/telegram/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botTokenInput.trim(),
          method: 'getChatMember',
          params: {
            chat_id: cleanChannel,
            user_id: parseInt(testUserId, 10) || testUserId,
          },
        }),
      });

      const data = await response.json();

      if (data.ok && data.result) {
        setMemberResult(data.result);
      } else {
        alert(`Telegram API Error: ${data.description}`);
      }
    } catch (err: any) {
      alert(`Request error: ${err.message}`);
    } finally {
      setMemberLoading(false);
    }
  };

  // Send test force join message to real chat ID
  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botTokenInput.trim() || !testChatId) {
      alert('Provide Bot Token and Target Chat ID.');
      return;
    }

    setTestMessageStatus('Sending...');

    try {
      const channelButtons = config.channels.map((ch) => [
        {
          text: `📢 Join ${ch.title}`,
          url: ch.inviteLink || `https://t.me/${ch.username.replace('@', '')}`,
        },
      ]);

      channelButtons.push([
        {
          text: '✅ Verify Membership',
          callback_data: 'verify_join_demo',
        },
      ]);

      const response = await fetch('/api/telegram/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botTokenInput.trim(),
          method: 'sendMessage',
          params: {
            chat_id: testChatId.trim(),
            text: `⚠️ **Force Join Protection Guard Test**\n\nYou must join required channel(s) to send messages!`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: channelButtons,
            },
          },
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setTestMessageStatus('✅ Message successfully sent to live Telegram chat!');
      } else {
        setTestMessageStatus(`❌ Failed: ${data.description}`);
      }
    } catch (err: any) {
      setTestMessageStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#0088cc] animate-pulse" />
            Live Telegram API Bot Connector
          </h2>
          <p className="text-xs text-[#7f91a4] mt-1">
            Connect your real Telegram Bot Token to test `getMe`, `getChatMember`, live channel checks, and message triggers.
          </p>
        </div>
      </div>

      {/* 1. Bot Token Verification Card */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" />
          1. Connect Real Bot Token
        </h3>
        <p className="text-xs text-[#7f91a4]">
          Get your HTTP API Bot Token from <span className="text-[#64b5ef] font-semibold">@BotFather</span> on Telegram.
        </p>

        <form onSubmit={handleTestBotToken} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="password"
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={botTokenInput}
              onChange={(e) => setBotTokenInput(e.target.value)}
              className="w-full bg-[#182533] text-white text-xs px-4 py-3 rounded-xl border border-[#242f3d] outline-none focus:border-[#0088cc] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !botTokenInput.trim()}
            className="px-5 py-3 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Test Connection</span>
          </button>
        </form>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Bot Info Result Card */}
        {botInfo && (
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  {botInfo.first_name}
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    ONLINE
                  </span>
                </h4>
                <p className="text-xs text-emerald-400 font-mono">@{botInfo.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-emerald-500/20 text-slate-300 font-mono">
              <div>Bot ID: <span className="text-white font-bold">{botInfo.id}</span></div>
              <div>Can Join Groups: <span className="text-emerald-400 font-bold">{botInfo.can_join_groups ? 'Yes' : 'No'}</span></div>
              <div>Read Group Msgs: <span className="text-emerald-400 font-bold">{botInfo.can_read_all_group_messages ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Live getChatMember Verification Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            2. Live Member Status Checker (`getChatMember`)
          </h3>
          <p className="text-xs text-[#7f91a4]">
            Query Telegram API directly to verify if a specific Telegram User ID is joined to a channel.
          </p>

          <form onSubmit={handleCheckMember} className="space-y-3">
            <input
              type="text"
              placeholder="Telegram User ID (e.g. 987654321)"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              required
              className="w-full bg-[#182533] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#242f3d] outline-none focus:border-[#0088cc]"
            />
            <input
              type="text"
              placeholder="Channel Username (@mychannel)"
              value={testChannelUsername}
              onChange={(e) => setTestChannelUsername(e.target.value)}
              required
              className="w-full bg-[#182533] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#242f3d] outline-none focus:border-[#0088cc]"
            />

            <button
              type="submit"
              disabled={memberLoading || !botTokenInput.trim()}
              className="w-full py-2.5 bg-[#242f3d] hover:bg-[#2b3a4c] text-[#64b5ef] text-xs font-semibold rounded-xl border border-[#2b3a4c] hover:border-[#0088cc]/50 transition-all flex items-center justify-center space-x-2"
            >
              {memberLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              <span>Execute `getChatMember` Call</span>
            </button>
          </form>

          {memberResult && (
            <div className="p-3 bg-[#182533] border border-[#242f3d] rounded-xl text-xs space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold uppercase ${['creator', 'administrator', 'member'].includes(memberResult.status) ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {memberResult.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User:</span>
                <span className="text-white">{memberResult.user.first_name} (@{memberResult.user.username || 'N/A'})</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Send Live Test Message */}
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-400" />
            3. Send Test Force Join Message
          </h3>
          <p className="text-xs text-[#7f91a4]">
            Send an actual test Force Join message with inline channel buttons to your real group or user ID.
          </p>

          <form onSubmit={handleSendTestMessage} className="space-y-3">
            <input
              type="text"
              placeholder="Group Chat ID or User ID (e.g. -100123456789)"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              required
              className="w-full bg-[#182533] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#242f3d] outline-none focus:border-[#0088cc]"
            />

            <button
              type="submit"
              disabled={!botTokenInput.trim() || !testChatId.trim()}
              className="w-full py-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message to Live Telegram</span>
            </button>
          </form>

          {testMessageStatus && (
            <div className="p-3 bg-[#182533] border border-[#242f3d] rounded-xl text-xs font-semibold text-slate-200">
              {testMessageStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
