import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/Icon';
import type { Firm, TaskCategory, RecurringTaskTemplate } from '@/types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  firms: Firm[];
  recurringTemplates: RecurringTaskTemplate[];
  onCreateTask: (data: {
    title: string;
    category: TaskCategory;
    deadline: string;
    firmIds: string[];
  }) => void;
}

export const TaskCreateModal = ({
  isOpen,
  onClose,
  firms,
  recurringTemplates,
  onCreateTask,
}: TaskCreateModalProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('その他');
  const [deadline, setDeadline] = useState('');
  const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setCategory('その他');
      setDeadline('');
      setSelectedFirmIds([]);
      setTemplateId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const applyTemplate = (tId: string) => {
    const tmpl = recurringTemplates.find((t) => t.id === tId);
    if (tmpl) {
      setTitle(tmpl.title);
      setCategory(tmpl.category);
      const year = new Date().getFullYear();
      const d = new Date(year, tmpl.triggerMonth - 1, 1);
      setDeadline(d.toISOString().split('T')[0]);
      setSelectedFirmIds(firms.map((f) => f.id));
      setTemplateId(tId);
    }
  };

  const toggleFirm = (id: string) => {
    setSelectedFirmIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedFirmIds.length === firms.length) {
      setSelectedFirmIds([]);
    } else {
      setSelectedFirmIds(firms.map((f) => f.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline || selectedFirmIds.length === 0) return;
    onCreateTask({
      title: title.trim(),
      category,
      deadline,
      firmIds: selectedFirmIds,
    });
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className="relative bg-white rounded-lg shadow-xl w-[calc(100%-2rem)] max-w-lg mx-4 flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800">新規タスク登録</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icon name="fa-times" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
          {/* Template */}
          {recurringTemplates.length > 0 && (
            <div className="bg-cyan-50 p-3 rounded-lg">
              <label className="block text-xs font-medium text-cyan-800 mb-1">
                定期タスクから入力（任意）
              </label>
              <select
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="w-full bg-white border border-cyan-200 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="">テンプレートを選択...</option>
                {recurringTemplates
                  .sort((a, b) => a.triggerMonth - b.triggerMonth)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.triggerMonth}月 - {t.title}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Title + Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              タスク名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="例: 年末調整資料配布"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">区分</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="研修">研修</option>
                <option value="TPS">TPS</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                期限 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Firm Selection */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">
                対象事務所 ({selectedFirmIds.length}件選択) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-cyan-600 hover:underline"
              >
                {selectedFirmIds.length === firms.length ? '全解除' : '全選択'}
              </button>
            </div>
            <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto p-2 bg-slate-50 space-y-1">
              {firms.length === 0 && (
                <p className="text-sm text-slate-400 p-2">
                  設定画面から訪問先を登録してください。
                </p>
              )}
              {firms.map((firm) => (
                <label
                  key={firm.id}
                  className="flex items-center p-2 rounded hover:bg-white transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFirmIds.includes(firm.id)}
                    onChange={() => toggleFirm(firm.id)}
                    className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm text-slate-700 truncate">
                    <span className="font-mono text-slate-400 mr-1">{firm.code}</span>
                    {firm.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition text-sm"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !deadline || selectedFirmIds.length === 0}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-slate-400 transition font-bold text-sm"
          >
            登録する
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
