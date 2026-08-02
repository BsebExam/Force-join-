import React, { useState } from 'react';
import { BotConfig, TelegramChannel, FileMode } from '../types';
import {
  Settings,
  Plus,
  Trash2,
  Shield,
  Clock,
  MessageSquare,
  Users,
  Terminal,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ConfiguratorProps {
  config: BotConfig;
  onUpdateConfig: (newConfig: Partial<BotConfig>) => void;
}

export const Configurator: React.FC<ConfiguratorProps> = ({ config, onUpdateConfig }) => {
  const [newChannelTitle, setNewChannelTitle] = useState('');
  const [newChannelUsername, setNewChannelUsername] = useState('');
  const [newChannelLink, setNewChannelLink] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Add new channel
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelUsername.trim()) return;

    let cleanUsername = newChannelUsername.trim();
    if (!cleanUsername.startsWith('@') && !cleanUsername.includes('t.me/')) {
      cleanUsername = `@${cleanUsername}`;
    }

    const newChannel: TelegramChannel = {
      id: `ch_${Date.now()}`,
      title: newChannelTitle.trim() || cleanUsername,
      username: cleanUsername,
      inviteLink: newChannelLink.trim() || `https://t.me/${cleanUsername.replace('@', '')}`,
    };

    onUpdateConfig({
      channels: [...config.channels, newChannel],
    });

    setNewChannelTitle('');
    setNewChannelUsername('');
    setNewChannelLink('');

    triggerSaveAlert();
  };

  const handleRemoveChannel = (id: string) => {
    if (config.channels.length <= 1) {
      alert('You must have at least one required channel configured.');
      return;
    }
    onUpdateConfig({
      channels: config.channels.filter((c) => c.id !== id),
    });
    triggerSaveAlert();
  };

  const triggerSaveAlert = () => {
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0088cc]" />
            Bot Rules & Force Join Configuration
          </h2>
          <p className="text-xs text-[#7f91a4] mt-1">
            Customize required channels, enforcement modes, auto-delete timers, and message templates.
          </p>
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold animate-pulse">
            <CheckCircle className="w-4 h-4" />
            <span>Settings Updated!</span>
          </div>
        )}
      </div>

      {/* 1. Target Channels Manager */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#242f3d] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0088cc]" />
              1. Required Channels / Groups
            </h3>
            <p className="text-xs text-[#7f91a4] mt-0.5">
              Users in your Telegram group must be subscribed to all listed channels to send messages.
            </p>
          </div>
          <span className="text-xs bg-[#242f3d] text-[#64b5ef] px-2.5 py-1 rounded-lg font-bold">
            {config.channels.length} Channel(s)
          </span>
        </div>

        {/* Existing Channels List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {config.channels.map((channel) => (
            <div
              key={channel.id}
              className="bg-[#182533] border border-[#242f3d] p-4 rounded-xl flex items-center justify-between group hover:border-[#0088cc]/50 transition-all"
            >
              <div className="truncate">
                <h4 className="font-semibold text-sm text-white">{channel.title}</h4>
                <p className="text-xs text-[#64b5ef] font-mono mt-0.5">{channel.username}</p>
                {channel.inviteLink && (
                  <a
                    href={channel.inviteLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#7f91a4] hover:underline truncate block mt-0.5"
                  >
                    {channel.inviteLink}
                  </a>
                )}
              </div>

              <button
                onClick={() => handleRemoveChannel(channel.id)}
                className="p-2 text-[#7f91a4] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Remove channel"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Channel Form */}
        <form
          onSubmit={handleAddChannel}
          className="bg-[#182533] border border-[#242f3d] p-4 rounded-xl space-y-3"
        >
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            Add New Target Channel
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Channel Name (e.g. Crypto Signals)"
              value={newChannelTitle}
              onChange={(e) => setNewChannelTitle(e.target.value)}
              className="bg-[#242f3d] text-white text-xs px-3 py-2.5 rounded-lg border border-[#2b3a4c] outline-none focus:border-[#0088cc]"
            />
            <input
              type="text"
              placeholder="Username (@my_channel_name)"
              value={newChannelUsername}
              onChange={(e) => setNewChannelUsername(e.target.value)}
              required
              className="bg-[#242f3d] text-white text-xs px-3 py-2.5 rounded-lg border border-[#2b3a4c] outline-none focus:border-[#0088cc]"
            />
            <input
              type="url"
              placeholder="Invite Link (Optional https://t.me/...)"
              value={newChannelLink}
              onChange={(e) => setNewChannelLink(e.target.value)}
              className="bg-[#242f3d] text-white text-xs px-3 py-2.5 rounded-lg border border-[#2b3a4c] outline-none focus:border-[#0088cc]"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channel to Protection Guard</span>
          </button>
        </form>
      </div>

      {/* 2. Action Mode & Auto Delete Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Mode */}
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            2. Action Mode
          </h3>
          <p className="text-xs text-[#7f91a4]">
            What action should the bot perform when an un-subscribed user sends a message?
          </p>

          <div className="space-y-2">
            {[
              {
                id: 'delete_mute',
                title: 'Delete Message & Mute User',
                desc: 'Deletes user message and restricts them from typing until verified.',
              },
              {
                id: 'delete_warn',
                title: 'Delete Message & Send Warning Notice',
                desc: 'Deletes message and posts a temporary join link notice.',
              },
              {
                id: 'mute_only',
                title: 'Mute User Only (Keep Message)',
                desc: 'Restricts user chat permissions without deleting existing text.',
              },
            ].map((mode) => (
              <label
                key={mode.id}
                className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  config.actionMode === mode.id
                    ? 'bg-[#242f3d] border-[#0088cc] text-white'
                    : 'bg-[#182533] border-[#242f3d] text-[#7f91a4] hover:bg-[#1f2c3a]'
                }`}
              >
                <input
                  type="radio"
                  name="actionMode"
                  checked={config.actionMode === mode.id}
                  onChange={() => {
                    onUpdateConfig({ actionMode: mode.id as FileMode });
                    triggerSaveAlert();
                  }}
                  className="mt-1 text-[#0088cc] focus:ring-0"
                />
                <div>
                  <h4 className="font-semibold text-xs text-white">{mode.title}</h4>
                  <p className="text-[11px] text-[#7f91a4] mt-0.5">{mode.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Auto Delete Timer */}
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            3. Auto-Delete Bot Warning Notice
          </h3>
          <p className="text-xs text-[#7f91a4]">
            Automatically delete the bot’s join warning message after X seconds to keep your group clean.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[0, 15, 30, 60].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  onUpdateConfig({ autoDeleteTimerSec: sec });
                  triggerSaveAlert();
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  config.autoDeleteTimerSec === sec
                    ? 'bg-[#0088cc] border-[#0088cc] text-white shadow-md'
                    : 'bg-[#182533] border-[#242f3d] text-[#7f91a4] hover:bg-[#1f2c3a] hover:text-white'
                }`}
              >
                {sec === 0 ? 'Disabled (Never Delete)' : `${sec} Seconds`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Custom Warning Message Customizer */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          4. Custom Bot Warning Template
        </h3>
        <p className="text-xs text-[#7f91a4]">
          Variables available: <code className="text-[#64b5ef] font-mono">{'{mention}'}</code>,{' '}
          <code className="text-[#64b5ef] font-mono">{'{channels}'}</code>,{' '}
          <code className="text-[#64b5ef] font-mono">{'{group_title}'}</code>
        </p>

        <textarea
          rows={3}
          value={config.warningMessageText}
          onChange={(e) => {
            onUpdateConfig({ warningMessageText: e.target.value });
            triggerSaveAlert();
          }}
          className="w-full bg-[#182533] text-white text-xs p-3.5 rounded-xl border border-[#242f3d] outline-none focus:border-[#0088cc] leading-relaxed"
        />
      </div>

      {/* 4. Whitelist & Exemptions */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          5. Whitelist & Exemption Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3.5 bg-[#182533] border border-[#242f3d] rounded-xl cursor-pointer">
            <div>
              <h4 className="font-semibold text-xs text-white">Exempt Group Admins</h4>
              <p className="text-[11px] text-[#7f91a4]">Group admins do not need to join channels</p>
            </div>
            <input
              type="checkbox"
              checked={config.whitelistAdmins}
              onChange={(e) => {
                onUpdateConfig({ whitelistAdmins: e.target.checked });
                triggerSaveAlert();
              }}
              className="w-4 h-4 text-[#0088cc] rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-[#182533] border border-[#242f3d] rounded-xl cursor-pointer">
            <div>
              <h4 className="font-semibold text-xs text-white">Exempt Other Bots</h4>
              <p className="text-[11px] text-[#7f91a4]">Do not block automated bot messages</p>
            </div>
            <input
              type="checkbox"
              checked={config.whitelistBots}
              onChange={(e) => {
                onUpdateConfig({ whitelistBots: e.target.checked });
                triggerSaveAlert();
              }}
              className="w-4 h-4 text-[#0088cc] rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
