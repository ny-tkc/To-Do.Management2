import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/Icon';
import type { Visit } from '@/types';

interface RecentTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  allVisits: Visit[];
  onAddTasks: (tasks: { text: string; subTasks: { text: string }[] }[]) => void;
}

export const RecentTasksModal = ({ isOpen, onClose, allVisits, onAddTasks }: RecentTasksModalProps) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  const recentTasks = useMemo(() => {
    if (!isOpen) return [];
    const taskMap = new Map<string, { text: string; subTasks: { text: string }[]; date: string }>();
    const sorted = [...allVisits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const visit of sorted) {
      for (const todo of visit.todos) {
        const key = todo.text.trim();
        if (key && !taskMap.has(key)) {
          taskMap.set(key, {
            text: todo.text,
            subTasks: (todo.subTasks || []).map((s) => ({ text: s.text })),
            date: visit.date,
          });
        }
      }
    }
    return Array.from(taskMap.values()).slice(0, 30);
  }, [isOpen, allVisits]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedTasks(new Set());
    onClose();
  };

  const toggleTask = (text: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(text)) {
        next.delete(text);
      } else {
        next.add(text);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const tasks = recentTasks.filter((t) => selectedTasks.has(t.text));
    if (tasks.length > 0) {
      onAddTasks(tasks.map((t) => ({ text: t.text, subTasks: t.subTasks })));
    }
    setSelectedTasks(new Set());
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div
        className="relative bg-white rounded-lg shadow-xl w-[calc(100%-2rem)] max-w-md p-6 mx-4 flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-800 mb-1">最近のタスクから追加</h2>
        <p className="text-xs text-slate-500 mb-3">追加したいタスクを選択してください</p>

        <div className="flex-1 overflow-y-auto overscroll-contain space-y-1 mb-4 -mx-2 px-2">
          {recentTasks.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">過去のタスクがありません</p>
          ) : (
            recentTasks.map((task, i) => (
              <label
                key={i}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
                  selectedTasks.has(task.text)
                    ? 'bg-cyan-50 border border-cyan-300'
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.text)}
                  onChange={() => toggleTask(task.text)}
                  className="h-5 w-5 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500 flex-shrink-0"
                />
                <div className="ml-3 min-w-0">
                  <span className="text-sm text-slate-700 block truncate">{task.text}</span>
                  {task.subTasks.length > 0 && (
                    <span className="text-xs text-slate-400">詳細 {task.subTasks.length}件</span>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedTasks.size === 0}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-slate-400 transition font-bold"
          >
            <Icon name="fa-plus" className="mr-1" size={12} />
            {selectedTasks.size}件追加
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
