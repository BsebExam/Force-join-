import React, { useState } from 'react';
import { BotConfig, FrameworkTarget } from '../types';
import {
  generateBotCode,
  generateDockerfile,
  generateRequirementsTxt,
  generateEnvFile,
  generateRenderYaml,
  generateDeploymentGuide,
} from '../data/codeTemplates';
import {
  Code,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Box,
  Layers,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface CodeGeneratorProps {
  config: BotConfig;
}

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({ config }) => {
  const [framework, setFramework] = useState<FrameworkTarget>('aiogram3');
  const [activeFileTab, setActiveFileTab] = useState<'main' | 'requirements' | 'env' | 'docker' | 'render' | 'guide'>('main');
  const [copied, setCopied] = useState(false);

  const mainCode = generateBotCode(config, framework);
  const requirementsTxt = generateRequirementsTxt();
  const envFile = generateEnvFile(config.botToken);
  const dockerfile = generateDockerfile();
  const renderYaml = generateRenderYaml();
  const deployGuide = generateDeploymentGuide();

  const getActiveCode = () => {
    switch (activeFileTab) {
      case 'main':
        return mainCode;
      case 'requirements':
        return requirementsTxt;
      case 'env':
        return envFile;
      case 'docker':
        return dockerfile;
      case 'render':
        return renderYaml;
      case 'guide':
        return deployGuide;
      default:
        return mainCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const filenameMap: Record<string, string> = {
      main: framework.includes('tele') || framework.includes('grammy') ? 'bot.ts' : 'bot.py',
      requirements: 'requirements.txt',
      env: '.env',
      docker: 'Dockerfile',
      render: 'render.yaml',
      guide: 'DEPLOYMENT.md',
    };

    const fileName = filenameMap[activeFileTab] || 'bot.py';
    const blob = new Blob([getActiveCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code className="w-6 h-6 text-[#0088cc]" />
            Production Bot Source Code Generator
          </h2>
          <p className="text-xs text-[#7f91a4] mt-1">
            Export ready-to-run code generated dynamically from your configured channels and rules.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-[#242f3d] hover:bg-[#2b3a4c] text-white text-xs font-semibold rounded-xl border border-[#2b3a4c] transition-all flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Framework Selector Tabs */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-4 shadow-xl space-y-3">
        <label className="text-xs font-bold text-[#7f91a4] uppercase tracking-wider block">
          Select Framework / Language
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'aiogram3', name: 'Aiogram 3', lang: 'Python (Async)' },
            { id: 'pyrogram', name: 'Pyrogram', lang: 'Python (MTProto)' },
            { id: 'telebot', name: 'Telebot', lang: 'Python' },
            { id: 'telegraf', name: 'Telegraf', lang: 'Node.js (JS)' },
            { id: 'grammy', name: 'Grammy', lang: 'TypeScript' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFramework(item.id as FrameworkTarget)}
              className={`p-3 rounded-xl border text-left transition-all ${
                framework === item.id
                  ? 'bg-[#0088cc] border-[#0088cc] text-white shadow-lg shadow-[#0088cc]/20'
                  : 'bg-[#182533] border-[#242f3d] text-[#7f91a4] hover:bg-[#1f2c3a] hover:text-white'
              }`}
            >
              <h4 className="font-bold text-xs">{item.name}</h4>
              <p className="text-[10px] opacity-80 mt-0.5">{item.lang}</p>
            </button>
          ))}
        </div>
      </div>

      {/* File View Switcher */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl overflow-hidden shadow-2xl">
        {/* File Tabs */}
        <div className="bg-[#0e1621] border-b border-[#242f3d] px-4 py-2 flex items-center space-x-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveFileTab('main')}
            className={`px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5 transition-all ${
              activeFileTab === 'main'
                ? 'bg-[#182533] text-[#64b5ef] border border-[#0088cc]/40 font-bold'
                : 'text-[#7f91a4] hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{framework.includes('tele') || framework.includes('grammy') ? 'bot.ts' : 'bot.py'}</span>
          </button>

          <button
            onClick={() => setActiveFileTab('requirements')}
            className={`px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5 transition-all ${
              activeFileTab === 'requirements'
                ? 'bg-[#182533] text-[#64b5ef] border border-[#0088cc]/40 font-bold'
                : 'text-[#7f91a4] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>requirements.txt</span>
          </button>

          <button
            onClick={() => setActiveFileTab('env')}
            className={`px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5 transition-all ${
              activeFileTab === 'env'
                ? 'bg-[#182533] text-[#64b5ef] border border-[#0088cc]/40 font-bold'
                : 'text-[#7f91a4] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>.env</span>
          </button>

          <button
            onClick={() => setActiveFileTab('docker')}
            className={`px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5 transition-all ${
              activeFileTab === 'docker'
                ? 'bg-[#182533] text-[#64b5ef] border border-[#0088cc]/40 font-bold'
                : 'text-[#7f91a4] hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Dockerfile</span>
          </button>

          <button
            onClick={() => setActiveFileTab('render')}
            className={`px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5 transition-all ${
              activeFileTab === 'render'
                ? 'bg-[#182533] text-[#64b5ef] border border-[#0088cc]/40 font-bold'
                : 'text-[#7f91a4] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>render.yaml</span>
          </button>

          <button
            onClick={() => setActiveFileTab('guide')}
            className={`px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5 transition-all ${
              activeFileTab === 'guide'
                ? 'bg-[#182533] text-[#64b5ef] border border-[#0088cc]/40 font-bold'
                : 'text-[#7f91a4] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>DEPLOYMENT.md</span>
          </button>
        </div>

        {/* Code Content Block */}
        <div className="p-4 bg-[#0e1621] overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre selection:bg-[#0088cc] selection:text-white">
            {getActiveCode()}
          </pre>
        </div>
      </div>
    </div>
  );
};
