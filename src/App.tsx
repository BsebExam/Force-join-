import React, { useState } from 'react';
import { BotConfig } from './types';
import { Navbar } from './components/Navbar';
import { Simulator } from './components/Simulator';
import { Configurator } from './components/Configurator';
import { LiveBotConnector } from './components/LiveBotConnector';
import { CodeGenerator } from './components/CodeGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'configurator' | 'live' | 'code'>('simulator');

  const [botConfig, setBotConfig] = useState<BotConfig>({
    botToken: '',
    botUsername: 'ForceJoinGuardBot',
    botName: 'Force Join Protection Guard',
    groupTitle: 'Crypto & Tech Global Chat',
    groupUsername: '@crypto_tech_discussion',
    actionMode: 'delete_mute',
    autoDeleteTimerSec: 30,
    warningMessageText:
      '⚠️ Hey {mention}, you must subscribe to our required channel(s) before sending messages in this group!\n\n👉 Required Channels: {channels}',
    successMessageText: '🎉 Verification Successful! You are un-muted and can now post in the group.',
    whitelistAdmins: true,
    whitelistBots: true,
    whitelistedUsers: [],
    exemptCommands: ['/start', '/help', '/rules'],
    channels: [
      {
        id: 'ch1',
        title: 'Crypto Signals & News',
        username: '@crypto_signals_official',
        inviteLink: 'https://t.me/crypto_signals_official',
      },
      {
        id: 'ch2',
        title: 'Tech Updates Daily',
        username: '@tech_updates_daily',
        inviteLink: 'https://t.me/tech_updates_daily',
      },
    ],
    customButtons: [],
  });

  const handleUpdateConfig = (newConfig: Partial<BotConfig>) => {
    setBotConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-slate-100 font-sans selection:bg-[#0088cc] selection:text-white flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        botName={botConfig.botName}
        botUsername={botConfig.botUsername}
        isBotActive={true}
        channelCount={botConfig.channels.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'simulator' && (
          <Simulator config={botConfig} onUpdateConfig={handleUpdateConfig} />
        )}

        {activeTab === 'configurator' && (
          <Configurator config={botConfig} onUpdateConfig={handleUpdateConfig} />
        )}

        {activeTab === 'live' && (
          <LiveBotConnector config={botConfig} onUpdateConfig={handleUpdateConfig} />
        )}

        {activeTab === 'code' && (
          <CodeGenerator config={botConfig} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#242f3d] bg-[#17212b] py-4 text-center text-xs text-[#7f91a4]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Telegram Force Join Bot Studio • Protecting Telegram Supergroups</span>
          <span className="font-mono text-[11px] bg-[#242f3d] px-2 py-0.5 rounded text-[#64b5ef]">
            Supports Aiogram 3, Pyrogram, Telebot, Telegraf, Grammy
          </span>
        </div>
      </footer>
    </div>
  );
}
