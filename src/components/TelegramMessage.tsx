import React from 'react';
import { SimMessage } from '../types';
import { Bot, ExternalLink, CheckCircle2, AlertTriangle, Timer, Trash2 } from 'lucide-react';

interface TelegramMessageProps {
  message: SimMessage;
  onButtonClick: (buttonId: string, buttonType: string, url?: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  currentUserId: string;
}

export const TelegramMessage: React.FC<TelegramMessageProps> = ({
  message,
  onButtonClick,
  onDeleteMessage,
  currentUserId,
}) => {
  if (message.isDeleted) {
    return (
      <div className="flex items-center justify-center py-1.5 my-1 text-xs text-[#7f91a4] italic bg-[#17212b]/60 rounded-lg px-3 border border-[#242f3d]">
        <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
        Message deleted by {message.senderName} (Force Join Protection)
      </div>
    );
  }

  const isBot = message.senderRole === 'bot';
  const isMe = message.senderId === currentUserId;

  return (
    <div className={`flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'} group transition-all`}>
      <div className="flex items-start gap-2 max-w-[90%] sm:max-w-[80%]">
        {/* User Avatar */}
        {!isMe && (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm text-white`}
            style={{ backgroundColor: message.senderAvatarColor || '#0088cc' }}
          >
            {isBot ? <Bot className="w-4 h-4 text-white" /> : message.senderAvatarText}
          </div>
        )}

        <div className="flex flex-col">
          {/* Sender Header */}
          {!isMe && (
            <div className="flex items-center space-x-1.5 mb-1 px-1">
              <span className="font-semibold text-xs text-[#64b5ef]">
                {message.senderName}
              </span>
              {isBot && (
                <span className="bg-[#0088cc]/20 text-[#64b5ef] border border-[#0088cc]/30 text-[10px] font-bold px-1.5 py-0.2 rounded tracking-wide">
                  BOT
                </span>
              )}
              {message.senderRole === 'admin' && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium px-1.5 py-0.2 rounded">
                  admin
                </span>
              )}
            </div>
          )}

          {/* Bubble Content */}
          <div
            className={`relative rounded-2xl px-3.5 py-2.5 text-sm shadow-md transition-all ${
              isMe
                ? 'bg-[#2b5278] text-white rounded-tr-none'
                : isBot
                ? 'bg-[#182533] border border-[#0088cc]/40 text-slate-100 rounded-tl-none shadow-[#0088cc]/5'
                : 'bg-[#182533] border border-[#242f3d] text-slate-100 rounded-tl-none'
            }`}
          >
            {/* Auto Delete Timer Banner for Bot Notice */}
            {message.isBotNotice && message.autoDeleteCountdown !== undefined && message.autoDeleteCountdown > 0 && (
              <div className="flex items-center space-x-1 text-[11px] font-medium text-amber-400/90 mb-2 pb-1.5 border-b border-[#242f3d]">
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span>Auto-clearing notice in {message.autoDeleteCountdown}s</span>
              </div>
            )}

            {/* Message Body */}
            <div className="whitespace-pre-wrap leading-relaxed break-words">
              {message.text}
            </div>

            {/* Timestamp & Info Footer */}
            <div className="flex items-center justify-end space-x-1 text-[10px] text-[#7f91a4] mt-1.5 select-none">
              <span>{message.timestamp}</span>
            </div>

            {/* Inline Buttons Keyboard Grid */}
            {message.buttons && message.buttons.length > 0 && (
              <div className="mt-3 pt-2 border-t border-[#242f3d] flex flex-col gap-1.5">
                {message.buttons.map((btn) => {
                  const isVerify = btn.type === 'verify';
                  return (
                    <button
                      key={btn.id}
                      onClick={() => onButtonClick(btn.id, btn.type, btn.url)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                        isVerify
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/30'
                          : 'bg-[#242f3d] hover:bg-[#2b3a4c] text-[#64b5ef] border border-[#2b3a4c] hover:border-[#0088cc]/50'
                      }`}
                    >
                      {isVerify ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 text-[#64b5ef]" />
                      )}
                      <span>{btn.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
