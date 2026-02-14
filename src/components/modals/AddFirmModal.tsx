import { useState } from 'react';

interface AddFirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFirm: (firm: { code: string; name: string }) => void;
}

export const AddFirmModal = ({ isOpen, onClose, onAddFirm }: AddFirmModalProps) => {
  const [firmCode, setFirmCode] = useState('');
  const [firmName, setFirmName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firmCode.trim().length === 5 && firmName.trim()) {
      onAddFirm({ code: firmCode.trim(), name: firmName.trim() });
      setFirmCode('');
      setFirmName('');
      onClose();
    }
  };

  const canSubmit = firmCode.trim().length === 5 && firmName.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-slate-800 mb-4">訪問先の追加</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              事務所コード (5桁)
            </label>
            <input
              type="text"
              value={firmCode}
              onChange={(e) => setFirmCode(e.target.value.replace(/\D/g, ''))}
              placeholder="例: 12345"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              maxLength={5}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">会計事務所名</label>
            <input
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="会計事務所名"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-slate-400 transition"
              disabled={!canSubmit}
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
