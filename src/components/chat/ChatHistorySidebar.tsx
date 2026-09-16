'use client';

import React, { useState } from 'react';
import {
  SquarePen,
  Search,
  MessageSquare,
  Trash2,
  X,
  Clock,
  MapPin,
  Check,
  AlertTriangle,
  PanelLeftClose,
} from 'lucide-react';
import { Conversation } from '@/lib/history/types';
import {
  groupConversationsChronologically,
  searchLocalConversations,
} from '@/lib/history/storage';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface ChatHistorySidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isOpenDesktop?: boolean;
  onToggleDesktop?: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAll,
  isOpenMobile,
  onCloseMobile,
  isOpenDesktop = true,
  onToggleDesktop,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Filter conversations with local search
  const filtered = React.useMemo(() => {
    return searchLocalConversations(conversations, searchQuery);
  }, [conversations, searchQuery]);

  // Group chronologically
  const grouped = React.useMemo(() => {
    return groupConversationsChronologically(filtered);
  }, [filtered]);

  const renderGroup = (title: string, list: Conversation[]) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </div>
        <div className="space-y-1 mt-1">
          {list.map((conv) => {
            const isActive = conv.id === activeId;
            const isDeleting = deletingId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200/80 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                >
                  <MessageSquare
                    className={`h-3.5 w-3.5 flex-shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="truncate block">{conv.title}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                      <MapPin className="h-2.5 w-2.5 text-slate-400" />
                      {conv.location.name}
                    </span>
                  </div>
                </button>

                {/* Delete button or confirm */}
                {isDeleting ? (
                  <div className="flex items-center gap-1 ml-1 bg-white px-1.5 py-0.5 rounded-lg border border-rose-200 shadow-sm animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                        setDeletingId(null);
                      }}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 px-1"
                      title="Confirm Delete"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                      title="Cancel"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-1 text-slate-400 transition-opacity rounded-md hover:bg-white"
                    title={t.chat.deleteChat}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 p-3 select-none">
      {/* Top action: New Chat button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1d68f5] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <SquarePen className="h-4 w-4" />
          <span>{t.chat.newChat}</span>
        </button>

        {/* Desktop collapse button */}
        {onToggleDesktop && (
          <button
            type="button"
            onClick={onToggleDesktop}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Local Search Input */}
      <div className="pt-3 pb-2 relative">
        <Search className="absolute left-2.5 top-5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.chat.searchHistory}
          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto pr-1 mt-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 px-3">
            <Clock className="h-6 w-6 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p>{searchQuery ? 'No matching conversations' : t.chat.noHistory}</p>
          </div>
        ) : (
          <>
            {renderGroup(t.chat.todayGroup, grouped.today)}
            {renderGroup(t.chat.yesterdayGroup, grouped.yesterday)}
            {renderGroup(t.chat.previous7DaysGroup, grouped.previous7Days)}
            {renderGroup(t.chat.olderGroup, grouped.older)}
          </>
        )}
      </div>

      {/* Bottom Footer Action */}
      {conversations.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          {confirmClearAll ? (
            <div className="flex items-center justify-between w-full bg-rose-50 p-1.5 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700">Clear all?</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClearAll(false);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-1.5 py-0.5 rounded-lg bg-white text-slate-600 text-[10px]"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors w-full justify-center"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear chat history</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:block h-full flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpenDesktop
            ? 'w-64 border-r border-slate-200/80 opacity-100'
            : 'w-0 border-none opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-64 h-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
