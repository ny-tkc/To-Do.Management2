import { useState, useRef } from 'react';
import { Icon } from '@/components/Icon';
import type { Firm, FrequentTask } from '@/types';

interface MasterPageProps {
  firms: Firm[];
  onAddFirm: () => void;
  onDeleteFirm: (firmId: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  frequentTasks: FrequentTask[];
  onAddFrequentTask: (text: string, defaultSubTasks: string[], id?: string) => void;
  onDeleteFrequentTask: (id: string) => void;
  onExportFirms: () => void;
  onImportFirms: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MasterPage = ({
  firms,
  onAddFirm,
  onDeleteFirm,
  onExportData,
  onImportData,
  onResetData,
  frequentTasks,
  onAddFrequentTask,
  onDeleteFrequentTask,
  onExportFirms,
  onImportFirms,
}: MasterPageProps) => {
  const [activeTab, setActiveTab] = useState('firms');
  const importInputRef = useRef<HTMLInputElement>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDefaults, setNewTaskDefaults] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskDefaults, setEditTaskDefaults] = useState('');

  const handleImportClick = () => {
    if (importInputRef.current) importInputRef.current.click();
  };

  const handleAddFreqTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      const defaultSubTasks = newTaskDefaults
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l);
      onAddFrequentTask(newTaskText.trim(), defaultSubTasks);
      setNewTaskText('');
      setNewTaskDefaults('');
    }
  };

  const startEditingTask = (task: FrequentTask) => {
    setEditingTaskId(task.id);
    setEditTaskText(task.text);
    setEditTaskDefaults((task.defaultSubTasks || []).join('\n'));
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditTaskText('');
    setEditTaskDefaults('');
  };

  const saveEditingTask = () => {
    if (editTaskText.trim() && editingTaskId) {
      const defaultSubTasks = editTaskDefaults
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l);
      onDeleteFrequentTask(editingTaskId);
      onAddFrequentTask(editTaskText.trim(), defaultSubTasks);
      setEditingTaskId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex space-x-1 rounded-lg bg-slate-200 p-1 mb-6">
        <button
          onClick={() => setActiveTab('firms')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            activeTab === 'firms'
              ? 'bg-white shadow text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          訪問先管理
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'bg-white shadow text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          よくあるタスク
        </button>
      </div>

      {activeTab === 'firms' && (
        <div className="animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">訪問先リスト</h2>
            <button
              onClick={onAddFirm}
              className="flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-full hover:bg-cyan-700 transition"
            >
              <Icon name="fa-plus" className="mr-2" size={16} />
              追加
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="p-3 bg-slate-50 border-b border-slate-200 rounded-t-lg flex font-bold text-slate-600 text-sm">
              <div className="w-1/5">コード</div>
              <div className="w-3/5">事務所名</div>
              <div className="w-1/5 text-right">削除</div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {firms.length > 0 ? (
                firms.map((firm) => (
                  <div
                    key={firm.id}
                    className="p-2 border-b border-slate-100 last:border-0 flex items-center justify-between hover:bg-slate-50"
                  >
                    <div className="w-1/5">
                      <span className="font-mono text-slate-700">{firm.code}</span>
                    </div>
                    <div className="w-3/5">
                      <span className="font-medium text-slate-800">{firm.name}</span>
                    </div>
                    <div className="w-1/5 flex items-center justify-end">
                      <button
                        onClick={() => onDeleteFirm(firm.id)}
                        className="text-slate-400 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition"
                      >
                        <Icon name="fa-trash-alt" size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">データがありません</div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mb-8">
            <button
              onClick={onExportFirms}
              className="flex-1 flex justify-center items-center bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-md font-bold text-sm hover:bg-indigo-100 transition"
            >
              <Icon name="fa-file-export" className="mr-2" size={14} />
              事務所データのみ書出
            </button>
            <label className="flex-1 flex justify-center items-center bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-md font-bold text-sm hover:bg-indigo-100 transition cursor-pointer">
              <Icon name="fa-file-import" className="mr-2" size={14} />
              事務所データ取込
              <input type="file" className="hidden" onChange={onImportFirms} accept=".csv" />
            </label>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="animate-fade-in-up">
          <h2 className="text-xl font-bold text-slate-800 mb-4">よくあるタスク設定</h2>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <form onSubmit={handleAddFreqTask} className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">タスク名</label>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="新しい定型タスクを入力"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  デフォルトの詳細項目 (1行に1項目)
                </label>
                <textarea
                  value={newTaskDefaults}
                  onChange={(e) => setNewTaskDefaults(e.target.value)}
                  placeholder={'例：\n資料回収\n次回の提案'}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 font-bold"
                >
                  追加
                </button>
              </div>
            </form>
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-600">登録済みリスト</h3>
              {frequentTasks.length > 0 ? (
                frequentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-50 rounded-md border border-slate-200"
                  >
                    {editingTaskId === task.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTaskText}
                          onChange={(e) => setEditTaskText(e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                        <textarea
                          value={editTaskDefaults}
                          onChange={(e) => setEditTaskDefaults(e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={cancelEditingTask} className="text-slate-500 text-sm">
                            キャンセル
                          </button>
                          <button
                            onClick={saveEditingTask}
                            className="text-cyan-600 font-bold text-sm"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-slate-800 font-bold block">{task.text}</span>
                          {task.defaultSubTasks && task.defaultSubTasks.length > 0 && (
                            <ul className="pl-4 mt-1 list-disc text-xs text-slate-500">
                              {task.defaultSubTasks.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEditingTask(task)}
                            className="text-slate-400 hover:text-cyan-600 transition"
                          >
                            <Icon name="fa-edit" size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteFrequentTask(task.id)}
                            className="text-slate-400 hover:text-red-500 transition"
                          >
                            <Icon name="fa-trash-alt" size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-slate-500">
                  よく使うタスクを登録しておくと、訪問予定作成時に簡単に呼び出せます。
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pt-8 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">システム全体管理</h2>
        <div className="p-4 bg-white rounded-lg shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onExportData}
              className="flex-1 justify-center items-center flex px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition"
            >
              <Icon name="fa-download" className="mr-2" size={16} />
              バックアップ (保存)
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 justify-center items-center flex px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
            >
              <Icon name="fa-upload" className="mr-2" size={16} />
              復元 (読み込み)
            </button>
            <input
              type="file"
              ref={importInputRef}
              onChange={onImportData}
              className="hidden"
              accept="application/json"
            />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onResetData}
              className="w-full justify-center items-center flex px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
            >
              <Icon name="fa-exclamation-triangle" className="mr-2" size={16} />
              全データの初期化
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
