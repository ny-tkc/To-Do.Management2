import { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className="relative bg-white rounded-lg shadow-xl w-[calc(100%-2rem)] max-w-md p-6 mx-4 flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800">よくあるタスクから選択</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <Icon name="fa-times" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-1">
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
        <div className="mt-4 pt-4 border-t border-slate-100 text-center flex-shrink-0">
          <button onClick={onClose} className="text-slate-500 text-sm hover:text-slate-700">
            閉じる
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
