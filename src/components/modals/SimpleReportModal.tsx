import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { generateReportText } from '@/utils/reportText';
import type { Visit } from '@/types';

interface SimpleReportModalProps {
  visit: Visit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleReportModal = ({ visit, isOpen, onClose }: SimpleReportModalProps) => {
  const [copyStatus, setCopyStatus] = useState('コピー');

  useEffect(() => {
    if (isOpen) {
      setCopyStatus('コピー');
    }
  }, [isOpen]);

  if (!isOpen || !visit) return null;

  const reportText = generateReportText(visit);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText).then(
      () => {
        setCopyStatus('コピーしました！');
        setTimeout(() => setCopyStatus('コピー'), 2000);
      },
      () => {
        setCopyStatus('失敗しました');
        setTimeout(() => setCopyStatus('コピー'), 2000);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-slate-800 mb-2">訪問レポート</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition">
            <Icon name="fa-times" size={24} />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          {visit.firmName} 様 ({visit.date})
        </p>

        <div className="bg-slate-50 p-4 rounded-md mb-6 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
            {reportText || 'レポート内容がありません。'}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
          >
            閉じる
          </button>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-white font-semibold rounded-md transition ${
              copyStatus === 'コピーしました！' ? 'bg-green-500' : 'bg-cyan-600 hover:bg-cyan-700'
            }`}
            disabled={!reportText}
          >
            <Icon name="fa-copy" className="mr-2" size={16} />
            {copyStatus}
          </button>
        </div>
      </div>
    </div>
  );
};
