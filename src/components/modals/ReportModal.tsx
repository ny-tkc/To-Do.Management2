import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { generateReportText } from '@/utils/reportText';
import type { Visit } from '@/types';

interface ReportModalProps {
  visit: Visit | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVisit: (visit: Visit) => void;
  onCompleteVisit?: (visitId: string) => void;
}

export const ReportModal = ({
  visit,
  isOpen,
  onClose,
  onUpdateVisit,
  onCompleteVisit,
}: ReportModalProps) => {
  const [copyStatus, setCopyStatus] = useState('コピー');
  const [isCopied, setIsCopied] = useState(false);
  const [internalVisit, setInternalVisit] = useState<Visit | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCopyStatus('コピー');
      setIsCopied(false);
      setInternalVisit(visit ? JSON.parse(JSON.stringify(visit)) : null);
    }
  }, [isOpen, visit]);

  const handleTodoChange = (todoId: string, field: string, value: string) => {
    if (!internalVisit) return;
    const updatedTodos = internalVisit.todos.map((todo) =>
      todo.id === todoId ? { ...todo, [field]: value } : todo
    );
    const updated = { ...internalVisit, todos: updatedTodos };
    setInternalVisit(updated);
    onUpdateVisit(updated);
  };

  const handleSubTaskToggle = (todoId: string, subTaskId: string) => {
    if (!internalVisit) return;
    const updatedTodos = internalVisit.todos.map((todo) => {
      if (todo.id === todoId && todo.subTasks) {
        const updatedSubTasks = todo.subTasks.map((sub) =>
          sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub
        );
        return { ...todo, subTasks: updatedSubTasks };
      }
      return todo;
    });
    const updated = { ...internalVisit, todos: updatedTodos };
    setInternalVisit(updated);
    onUpdateVisit(updated);
  };

  if (!isOpen || !internalVisit) return null;

  const completedTodos = (internalVisit.todos || [])
    .filter((todo) => todo.completed)
    .sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
      }
      return 0;
    });

  const reportText = generateReportText(internalVisit);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText).then(
      () => {
        setCopyStatus('コピーしました！');
        setIsCopied(true);
      },
      () => {
        setCopyStatus('失敗しました');
        setTimeout(() => setCopyStatus('コピー'), 2000);
      }
    );
  };

  const handleComplete = () => {
    if (onCompleteVisit) onCompleteVisit(internalVisit.id);
    onClose();
  };

  const showCompleteButton = !!onCompleteVisit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-start flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 mb-2">訪問レポート作成</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition">
            <Icon name="fa-times" size={24} />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-4 flex-shrink-0">
          {internalVisit.firmName} 様 ({internalVisit.date})
        </p>
        <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded mb-2">
          <Icon name="fa-info-circle" className="mr-1" size={12} />
          詳細項目のうち、チェックを入れたものだけがレポートに出力されます。
        </div>

        <div className="bg-slate-50 p-4 rounded-md mb-6 overflow-y-auto flex-1 space-y-6">
          {completedTodos.length > 0 ? (
            completedTodos.map((todo, idx) => (
              <div key={todo.id} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center mb-2">
                  <span className="font-bold text-cyan-700 mr-2">({idx + 1})</span>
                  <input
                    type="text"
                    value={todo.text}
                    onChange={(e) => handleTodoChange(todo.id, 'text', e.target.value)}
                    className="w-full p-1 border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-cyan-500 transition font-bold text-slate-800 bg-transparent"
                  />
                </div>

                <div className="pl-6 space-y-2 mb-3">
                  {todo.subTasks &&
                    todo.subTasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center group cursor-pointer hover:bg-slate-100 p-1 rounded -ml-1"
                        onClick={() => handleSubTaskToggle(todo.id, sub.id)}
                      >
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() => {}}
                          className="h-5 w-5 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500 pointer-events-none"
                        />
                        <span
                          className={`ml-2 text-sm flex-1 ${
                            sub.completed ? 'text-slate-800 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {sub.text}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="pl-6">
                  <textarea
                    value={todo.details}
                    onChange={(e) => handleTodoChange(todo.id, 'details', e.target.value)}
                    placeholder="その他の詳細（改行で箇条書きに追加）"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm block bg-white"
                    rows={3}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">完了したToDoがありません。</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
          {!isCopied && showCompleteButton ? (
            <button
              onClick={handleCopy}
              className={`w-full sm:w-auto px-4 py-2 text-white font-semibold rounded-md transition ${
                copyStatus === 'コピーしました！'
                  ? 'bg-green-500'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
              disabled={!reportText}
            >
              <Icon name="fa-copy" className="mr-2" size={16} />
              {copyStatus}
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
              >
                閉じる
              </button>
              {showCompleteButton && (
                <button
                  onClick={handleComplete}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition"
                >
                  <Icon name="fa-check" className="mr-2" size={16} />
                  訪問を完了する
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
