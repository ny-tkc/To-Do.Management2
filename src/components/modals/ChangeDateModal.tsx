import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen || !visit) return null;

  const handleSave = () => {
    if (newDate) {
      onSave(visit.id, newDate);
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className="relative bg-white rounded-lg shadow-xl w-[calc(100%-2rem)] max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-800 mb-4">訪問日程の変更</h2>
        <p className="text-sm text-slate-600 mb-4">{visit.firmName} の訪問日を変更します。</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">新しい日付</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 text-base"
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
    </div>,
    document.body
  );
};
