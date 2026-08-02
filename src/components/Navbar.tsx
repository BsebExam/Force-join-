import React from 'react';
import { Bot, MessageSquareText, Settings, Code, Radio, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  activeTab: 'simulator' | 'configurator' | 'live' | 'code';
  setActiveTab: (tab: 'simulator' | 'configurator' | 'live' | 'code') => void;
  botName: string;
  botUsername: string;
  isBotActive: boolean;
  channelCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  botName,
  botUsername,
  isBotActive,
  channelCount,
}) => {
  return (
    <header className="bg-[#17212b] border-b border-[#242f3d] sticky top-0 z-50 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Status */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0088cc] to-[#33a5e5] flex items-center justify-center shadow-md shadow-[#0088cc]/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg tracking-tight text-white">{botName || 'Force Join Bot'}</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#2b5278] text-[#64b5ef]">
                  @{botUsername || 'ForceJoinGuardBot'}
                </span>
              </div>
              <p className="text-xs text-[#7f91a4] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isBotActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isBotActive ? 'Bot Protection Active' : 'Simulation Mode'} • {channelCount} Required Channel{channelCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-[#0e1621] p-1.5 rounded-xl border border-[#242f3d]">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-[#0088cc] text-white shadow-md shadow-[#0088cc]/30'
                  : 'text-[#7f91a4] hover:text-white hover:bg-[#1f2c3a]'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span className="hidden md:inline">Group Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('configurator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'configurator'
                  ? 'bg-[#0088cc] text-white shadow-md shadow-[#0088cc]/30'
                  : 'text-[#7f91a4] hover:text-white hover:bg-[#1f2c3a]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Bot Rules</span>
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'live'
                  ? 'bg-[#0088cc] text-white shadow-md shadow-[#0088cc]/30'
                  : 'text-[#7f91a4] hover:text-white hover:bg-[#1f2c3a]'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span className="hidden md:inline">Live API Test</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-[#0088cc] text-white shadow-md shadow-[#0088cc]/30'
                  : 'text-[#7f91a4] hover:text-white hover:bg-[#1f2c3a]'
              }`}
            >
              <Code className="w-4 h-4" />
              <span className="hidden md:inline">Get Code</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
