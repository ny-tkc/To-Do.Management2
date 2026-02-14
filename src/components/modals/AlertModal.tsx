import { Icon } from '@/components/Icon';
import type { Alert } from '@/types';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onIgnore: (alert: Alert) => void;
}

export const AlertModal = ({ isOpen, onClose, alerts, onIgnore }: AlertModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <Icon name="fa-exclamation-triangle" className="text-amber-500 mr-2" size={24} />
          訪問アラート
        </h2>
        <p className="text-sm text-slate-600 mb-4">以下の事務所への訪問間隔が空いています。</p>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-4">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-md border-l-4 ${
                alert.level === 2 ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800">{alert.firm.name}</p>
                  <p className="text-xs text-slate-500">
                    最終訪問: {alert.lastVisitDate} ({alert.daysSince}日前)
                  </p>
                </div>
                <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={(e) => e.target.checked && onIgnore(alert)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>今後表示しない</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 transition"
          >
            確認しました
          </button>
        </div>
      </div>
    </div>
  );
};
