import { Icon } from '@/components/Icon';
import type { FrequentTask } from '@/types';

interface SelectFrequentTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  frequentTasks: FrequentTask[];
  onSelect: (task: FrequentTask) => void;
}

export const SelectFrequentTaskModal = ({
  isOpen,
  onClose,
  frequentTasks,
  onSelect,
}: SelectFrequentTaskModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">よくあるタスクから選択</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <Icon name="fa-times" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          {frequentTasks.length > 0 ? (
            <ul className="space-y-2">
              {frequentTasks.map((task) => (
                <li key={task.id}>
                  <button
                    onClick={() => {
                      onSelect(task);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-cyan-50 rounded-md border border-slate-200 transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-slate-700 font-bold block">{task.text}</span>
                      {task.defaultSubTasks && task.defaultSubTasks.length > 0 && (
                        <span className="text-xs text-slate-500 truncate block">
                          {task.defaultSubTasks.length}個の詳細項目を含む
                        </span>
                      )}
                    </div>
                    <Icon
                      name="fa-plus"
                      className="text-slate-300 group-hover:text-cyan-600"
                      size={16}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 py-4">
              登録されたタスクはありません。
              <br />
              設定画面から登録できます。
            </p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <button onClick={onClose} className="text-slate-500 text-sm hover:text-slate-700">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
