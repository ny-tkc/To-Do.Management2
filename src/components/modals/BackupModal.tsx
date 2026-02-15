import { Icon } from '@/components/Icon';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackup: () => void;
}

export const BackupModal = ({ isOpen, onClose, onBackup }: BackupModalProps) => {
  if (!isOpen) return null;

  const handleBackup = () => {
    onBackup();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-fade-in-up">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="fa-cloud-arrow-down" size={32} className="text-cyan-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">バックアップの作成</h2>
          <p className="text-sm text-slate-500 mt-2">
            データのバックアップを作成しますか？<br />
            万が一のデータ消失に備えて、定期的なバックアップをおすすめします。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition font-medium"
          >
            スキップ
          </button>
          <button
            onClick={handleBackup}
            className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-bold"
          >
            <Icon name="fa-download" className="mr-2" size={14} />
            作成する
          </button>
        </div>
      </div>
    </div>
  );
};
