import { useState, useMemo } from 'react';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import type { ProgressTask, Firm, TaskCategory } from '@/types';

interface TaskProgressPageProps {
  tasks: ProgressTask[];
  firms: Firm[];
  onToggleAssignment: (taskId: string, firmId: string) => void;
  onArchiveTask: (taskId: string) => void;
  onUnarchiveTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: ProgressTask) => void;
  onOpenCreateModal: () => void;
  onAddAssignment: (taskId: string, firmId: string) => void;
  onRemoveAssignment: (taskId: string, firmId: string) => void;
}

export const TaskProgressPage = ({
  tasks,
  firms,
  onToggleAssignment,
  onArchiveTask,
  onUnarchiveTask,
  onDeleteTask,
  onUpdateTask,
  onOpenCreateModal,
  onAddAssignment,
  onRemoveAssignment,
}: TaskProgressPageProps) => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TaskCategory>('ALL');

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<TaskCategory>('その他');
  const [editDeadline, setEditDeadline] = useState('');

  // Add firm state
  const [showAddFirm, setShowAddFirm] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => (filter === 'active' ? !t.archived : t.archived))
      .filter((t) => categoryFilter === 'ALL' || t.category === categoryFilter)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, filter, categoryFilter]);

  const getFirmName = (firmId: string) => {
    return firms.find((f) => f.id === firmId)?.name || '不明';
  };

  const getFirmCode = (firmId: string) => {
    return firms.find((f) => f.id === firmId)?.code || '';
  };

  const getDaysUntil = (deadline: string) => {
    return Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );
  };

  const getAlertBadge = (deadline: string, archived: boolean, isAllComplete: boolean) => {
    if (archived || isAllComplete) return null;
    const days = getDaysUntil(deadline);
    if (days <= 0) {
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse">
          <Icon name="fa-exclamation-triangle" size={10} className="mr-1" />
          期限超過
        </span>
      );
    }
    if (days <= 3) {
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">
          <Icon name="fa-exclamation-circle" size={10} className="mr-1" />
          あと{days}日
        </span>
      );
    }
    if (days <= 10) {
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
          あと{days}日
        </span>
      );
    }
    return null;
  };

  const openDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
    setView('detail');
    setIsEditing(false);
    setShowAddFirm(false);
  };

  const backToList = () => {
    setView('list');
    setSelectedTaskId(null);
    setIsEditing(false);
    setShowAddFirm(false);
  };

  const startEdit = () => {
    if (!selectedTask) return;
    setEditTitle(selectedTask.title);
    setEditCategory(selectedTask.category);
    setEditDeadline(selectedTask.deadline);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selectedTask || !editTitle.trim()) return;
    onUpdateTask({
      ...selectedTask,
      title: editTitle.trim(),
      category: editCategory,
      deadline: editDeadline,
    });
    setIsEditing(false);
  };

  // --- LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">タスク進捗管理</h2>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-full hover:bg-cyan-700 transition"
          >
            <Icon name="fa-plus" className="mr-2" size={14} />
            新規タスク
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                filter === 'active'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              進行中
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                filter === 'archived'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              完了済み
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="fa-filter" size={14} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | TaskCategory)}
              className="flex-1 text-sm border border-slate-300 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="ALL">全ての区分</option>
              <option value="研修">研修</option>
              <option value="TPS">TPS</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
              <Icon name="fa-clipboard-check" size={32} className="text-slate-300 mb-2" />
              <p className="text-slate-500 text-sm">表示するタスクがありません</p>
            </div>
          )}
          {filteredTasks.map((task) => {
            const completedCount = task.assignments.filter((a) => a.completed).length;
            const total = task.assignments.length;
            const isAllComplete = total > 0 && completedCount === total;
            const alertBadge = getAlertBadge(task.deadline, task.archived, isAllComplete);

            return (
              <button
                key={task.id}
                onClick={() => openDetail(task.id)}
                className={`w-full text-left bg-white p-4 rounded-lg border transition hover:shadow-md ${
                  alertBadge && getDaysUntil(task.deadline) <= 0
                    ? 'border-red-300 bg-red-50/30'
                    : alertBadge
                    ? 'border-amber-200'
                    : isAllComplete && !task.archived
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        task.category === '研修'
                          ? 'bg-blue-100 text-blue-700'
                          : task.category === 'TPS'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.category}
                    </span>
                    {alertBadge}
                    {task.archived && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                        完了済み
                      </span>
                    )}
                  </div>
                  <Icon name="fa-chevron-right" size={12} className="text-slate-400 mt-1" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{task.title}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">
                    <Icon name="fa-calendar" size={11} className="mr-1" />
                    期限: {task.deadline}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {completedCount} / {total} 件
                  </span>
                </div>
                <ProgressBar value={completedCount} max={total} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (!selectedTask) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <p className="text-slate-500 text-center py-8">タスクが見つかりません</p>
      </div>
    );
  }

  const completedCount = selectedTask.assignments.filter((a) => a.completed).length;
  const total = selectedTask.assignments.length;
  const isAllComplete = total > 0 && completedCount === total;
  const alertBadge = getAlertBadge(selectedTask.deadline, selectedTask.archived, isAllComplete);

  const sortedAssignments = [...selectedTask.assignments].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const fA = firms.find((f) => f.id === a.firmId);
    const fB = firms.find((f) => f.id === b.firmId);
    return (fA?.code || '').localeCompare(fB?.code || '');
  });

  // Firms not yet assigned
  const unassignedFirms = firms.filter(
    (f) => !selectedTask.assignments.some((a) => a.firmId === f.id)
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <button
        onClick={backToList}
        className="flex items-center text-slate-500 hover:text-slate-800 transition mb-4"
      >
        <Icon name="fa-arrow-left" size={16} className="mr-1" />
        一覧に戻る
      </button>

      <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
        {isEditing ? (
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-cyan-100">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-lg font-bold border border-slate-300 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <div className="flex gap-2">
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
                className="text-sm border border-slate-300 rounded-md p-2 focus:ring-cyan-500"
              >
                <option value="研修">研修</option>
                <option value="TPS">TPS</option>
                <option value="その他">その他</option>
              </select>
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="text-sm border border-slate-300 rounded-md p-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-300 rounded-md"
              >
                キャンセル
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1.5 text-sm text-white bg-cyan-600 rounded-md hover:bg-cyan-700"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  selectedTask.category === '研修'
                    ? 'bg-blue-100 text-blue-700'
                    : selectedTask.category === 'TPS'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {selectedTask.category}
              </span>
              {selectedTask.archived && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  完了済み
                </span>
              )}
              {alertBadge}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedTask.title}</h2>
            <p className="text-sm text-slate-500 mb-4">
              <Icon name="fa-calendar" size={12} className="mr-1" />
              期限: {selectedTask.deadline}
            </p>
          </>
        )}

        {/* Action buttons */}
        {!isEditing && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {!selectedTask.archived && (
              <button
                onClick={startEdit}
                className="flex items-center px-3 py-1.5 text-sm text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition"
              >
                <Icon name="fa-edit" size={12} className="mr-1" />
                編集
              </button>
            )}
            {!selectedTask.archived && isAllComplete && (
              <button
                onClick={() => { onArchiveTask(selectedTask.id); backToList(); }}
                className="flex items-center px-3 py-1.5 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition"
              >
                <Icon name="fa-check-circle" size={12} className="mr-1" />
                完了にする
              </button>
            )}
            {selectedTask.archived && (
              <button
                onClick={() => onUnarchiveTask(selectedTask.id)}
                className="flex items-center px-3 py-1.5 text-sm text-amber-700 bg-amber-50 rounded-md hover:bg-amber-100 transition border border-amber-200"
              >
                <Icon name="fa-undo" size={12} className="mr-1" />
                完了を取消
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm('このタスクを削除しますか？')) {
                  onDeleteTask(selectedTask.id);
                  backToList();
                }
              }}
              className="flex items-center px-3 py-1.5 text-sm text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition ml-auto"
            >
              <Icon name="fa-trash-alt" size={12} className="mr-1" />
              削除
            </button>
          </div>
        )}

        {/* Progress */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>
              {total > 0 ? Math.round((completedCount / total) * 100) : 0}% 完了
            </span>
            <span>{completedCount} / {total} 件</span>
          </div>
          <ProgressBar value={completedCount} max={total} />
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">進捗チェックリスト</h3>
          {!selectedTask.archived && (
            <button
              onClick={() => setShowAddFirm(!showAddFirm)}
              className={`flex items-center text-xs px-3 py-1.5 rounded-md font-medium transition ${
                showAddFirm
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon name={showAddFirm ? 'fa-times' : 'fa-plus'} size={11} className="mr-1" />
              {showAddFirm ? '閉じる' : '事務所追加'}
            </button>
          )}
        </div>

        {/* Add firm panel */}
        {showAddFirm && unassignedFirms.length > 0 && (
          <div className="mb-4 bg-cyan-50 border border-cyan-200 rounded-lg p-3">
            <p className="text-xs text-cyan-800 font-medium mb-2">追加する事務所を選択</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {unassignedFirms.map((firm) => (
                <button
                  key={firm.id}
                  onClick={() => onAddAssignment(selectedTask.id, firm.id)}
                  className="w-full text-left flex items-center justify-between px-3 py-2 bg-white border border-cyan-200 rounded-md hover:bg-cyan-100 transition text-sm"
                >
                  <span className="truncate">
                    <span className="font-mono text-slate-400 mr-1">{firm.code}</span>
                    {firm.name}
                  </span>
                  <Icon name="fa-plus" size={12} className="text-cyan-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
        {showAddFirm && unassignedFirms.length === 0 && (
          <div className="mb-4 bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">全ての事務所が追加済みです</p>
          </div>
        )}

        <div className="space-y-2">
          {sortedAssignments.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">事務所が割り当てられていません</p>
          )}
          {sortedAssignments.map((assignment) => (
            <div
              key={assignment.firmId}
              className={`flex items-center justify-between p-3 rounded-lg border transition select-none ${
                assignment.completed
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => !selectedTask.archived && onToggleAssignment(selectedTask.id, assignment.firmId)}
                disabled={selectedTask.archived}
                className={`flex-1 text-left flex items-center min-w-0 pr-3 ${
                  selectedTask.archived ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition mr-3 ${
                    assignment.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {assignment.completed && <Icon name="fa-check" size={12} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-mono">{getFirmCode(assignment.firmId)}</p>
                  <p
                    className={`font-medium truncate ${
                      assignment.completed ? 'text-slate-500 line-through' : 'text-slate-800'
                    }`}
                  >
                    {getFirmName(assignment.firmId)}
                  </p>
                </div>
              </button>
              {!selectedTask.archived && (
                <button
                  onClick={() => {
                    if (window.confirm(`${getFirmName(assignment.firmId)} をこのタスクから除外しますか？`)) {
                      onRemoveAssignment(selectedTask.id, assignment.firmId);
                    }
                  }}
                  className="text-slate-300 hover:text-red-500 transition flex-shrink-0 p-1"
                  title="除外"
                >
                  <Icon name="fa-times" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
