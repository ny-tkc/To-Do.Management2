import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import type { Visit } from '@/types';

interface ChangeDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit | null;
  onSave: (visitId: string, newDate: string) => void;
}

export const ChangeDateModal = ({ isOpen, onClose, visit, onSave }: ChangeDateModalProps) => {
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    if (isOpen && visit) {
      setNewDate(visit.date);
    }
  }, [isOpen, visit]);

  if (!isOpen || !visit) return null;

  const handleSave = () => {
    if (newDate) {
      onSave(visit.id, newDate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-slate-800 mb-4">訪問日程の変更</h2>
        <p className="text-sm text-slate-600 mb-4">「{visit.firmName}」の訪問日を変更します。</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">新しい日付</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 transition"
          >
            変更する
          </button>
        </div>
      </div>
    </div>
  );
};
