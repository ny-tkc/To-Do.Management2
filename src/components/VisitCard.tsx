import { useState, useMemo } from 'react';
import { Icon } from '@/components/Icon';
import { SelectFrequentTaskModal } from '@/components/modals/SelectFrequentTaskModal';
import { RecentTasksModal } from '@/components/modals/RecentTasksModal';
import type { Visit, FrequentTask } from '@/types';

interface VisitCardProps {
  visit: Visit;
  onUpdateVisit: (visit: Visit) => void;
  onGenerateReport: (visit: Visit) => void;
  onCompleteVisit: (visitId: string) => void;
  onRevertCompleteVisit: (visitId: string) => void;
  onCarryOverTodo: (visitId: string, todoId: string, isClientVisit: boolean) => void;
  onDeleteVisit: (visitId: string) => void;
  onChangeDate: (visit: Visit) => void;
  frequentTasks: FrequentTask[];
  allVisits?: Visit[];
  showCompleteButton?: boolean;
  showDate?: boolean;
  hideStatusBadge?: boolean;
}

export const VisitCard = ({
  visit,
  onUpdateVisit,
  onGenerateReport,
  onCompleteVisit,
  onRevertCompleteVisit,
  onCarryOverTodo,
  onDeleteVisit,
  onChangeDate,
  frequentTasks,
  allVisits = [],
  showCompleteButton = true,
  showDate = false,
  hideStatusBadge = false,
}: VisitCardProps) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [isFreqModalOpen, setIsFreqModalOpen] = useState(false);
  const [isRecentModalOpen, setIsRecentModalOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const isCompleted = visit.status === 'completed';
  const isClientVisit = visit.firmName.includes('関与先');

  const pastTaskNames = useMemo(() => {
    const names = new Set<string>();
    for (const v of allVisits) {
      for (const todo of v.todos) {
        if (todo.text.trim()) names.add(todo.text.trim());
      }
    }
    return Array.from(names);
  }, [allVisits]);

  const autocompleteSuggestions = useMemo(() => {
    if (!showAutocomplete || !newTodoText || newTodoText.length < 1) return [];
    const lower = newTodoText.toLowerCase();
    return pastTaskNames.filter((name) => name.toLowerCase().includes(lower) && name !== newTodoText).slice(0, 5);
  }, [showAutocomplete, newTodoText, pastTaskNames]);

  const handleAddTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newTodoText.trim() === '') return;
    const newTodo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      completedAt: null,
      details: '',
      subTasks: [],
    };
    const updatedVisit = { ...visit, todos: [...visit.todos, newTodo] };
    onUpdateVisit(updatedVisit);
    setNewTodoText('');
    setShowAutocomplete(false);
  };

  const handleSelectFrequentTask = (taskObj: FrequentTask) => {
    const subTasks = (taskObj.defaultSubTasks || []).map((t, i) => ({
      id: `${Date.now()}_sub_${i}`,
      text: t,
      completed: false,
    }));
    const newTodo = {
      id: Date.now().toString(),
      text: taskObj.text,
      completed: false,
      completedAt: null,
      details: '',
      subTasks,
    };
    const updatedVisit = { ...visit, todos: [...visit.todos, newTodo] };
    onUpdateVisit(updatedVisit);
  };

  const handleAddRecentTasks = (tasks: { text: string; subTasks: { text: string }[] }[]) => {
    const newTodos = tasks.map((t, i) => ({
      id: `${Date.now()}_${i}`,
      text: t.text,
      completed: false,
      completedAt: null,
      details: '',
      subTasks: (t.subTasks || []).map((s, si) => ({
        id: `${Date.now()}_${i}_sub_${si}`,
        text: s.text,
        completed: false,
      })),
    }));
    const updatedVisit = { ...visit, todos: [...visit.todos, ...newTodos] };
    onUpdateVisit(updatedVisit);
  };

  const handleToggleTodo = (todoId: string) => {
    const updatedTodos = visit.todos.map((todo) =>
      todo.id === todoId
        ? {
            ...todo,
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : null,
          }
        : todo
    );
    onUpdateVisit({ ...visit, todos: updatedTodos });
  };

  const handleDeleteTodo = (todoId: string) => {
    const todo = visit.todos.find((t) => t.id === todoId);
    if (!window.confirm(`「${todo?.text || 'このToDo'}」を削除しますか？`)) return;
    const updatedTodos = visit.todos.filter((t) => t.id !== todoId);
    onUpdateVisit({ ...visit, todos: updatedTodos });
  };

  const handleDeleteVisitClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`「${visit.firmName}」の訪問予定を削除しますか？`)) {
      onDeleteVisit(visit.id);
    }
  };

  const hasCompletedTodos = visit.todos.some((todo) => todo.completed);

  const handleStartEditing = (todo: { id: string; text: string }) => {
    if (isCompleted) return;
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  const handleSaveEdit = () => {
    if (editingTodoId === null) return;
    const updatedTodos = visit.todos.map((todo) =>
      todo.id === editingTodoId ? { ...todo, text: editingTodoText.trim() } : todo
    );
    onUpdateVisit({ ...visit, todos: updatedTodos });
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col">
      <header
        className={`p-4 border-b border-slate-200 flex justify-between items-center ${
          isCompleted ? 'bg-slate-100' : ''
        }`}
      >
        <div className="overflow-hidden">
          <h2 className="text-lg font-bold text-slate-800 truncate">{visit.firmName}</h2>
          {showDate && <p className="text-xs text-slate-500">{visit.date}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isCompleted && !hideStatusBadge && (
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              完了済み
            </span>
          )}
          {!isCompleted && (
            <>
              {onChangeDate && (
                <button
                  onClick={() => onChangeDate(visit)}
                  className="text-slate-400 hover:text-cyan-600 transition px-2"
                  title="日程変更"
                >
                  <Icon name="fa-calendar-alt" size={16} />
                </button>
              )}
              {onDeleteVisit && (
                <button
                  onClick={handleDeleteVisitClick}
                  className="text-slate-400 hover:text-red-500 transition px-2"
                  title="訪問予定を削除"
                >
                  <Icon name="fa-trash-alt" size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-3">
        {visit.todos.map((todo) => (
          <div key={todo.id} className="flex flex-col bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`todo-${visit.id}-${todo.id}`}
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id)}
                className="h-6 w-6 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500 cursor-pointer flex-shrink-0"
                disabled={isCompleted}
              />
              <div className="flex-1 ml-3 overflow-hidden">
                {editingTodoId === todo.id ? (
                  <input
                    type="text"
                    value={editingTodoText}
                    onChange={(e) => setEditingTodoText(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleEditKeyDown}
                    className="w-full text-slate-700 bg-white border border-cyan-500 rounded px-1"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => handleStartEditing(todo)}
                    className={`text-slate-700 block truncate ${
                      !isCompleted ? 'cursor-pointer' : 'cursor-default'
                    } ${todo.completed ? 'line-through text-slate-400' : ''}`}
                  >
                    {todo.text}
                  </span>
                )}
              </div>
              {!isCompleted && !todo.completed && (
                <button
                  onClick={() => onCarryOverTodo(visit.id, todo.id, isClientVisit)}
                  className="ml-2 text-slate-400 hover:text-cyan-600 transition px-2"
                  title="次回へ繰り越し"
                >
                  <Icon name="fa-share" size={16} />
                </button>
              )}
              {!isCompleted && (
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="ml-2 text-slate-400 hover:text-red-500 transition px-2"
                >
                  <Icon name="fa-trash-alt" size={16} />
                </button>
              )}
            </div>
            {todo.subTasks && todo.subTasks.length > 0 && (
              <div className="ml-9 mt-1">
                <p className="text-xs text-slate-400">
                  詳細 {todo.subTasks.length}件
                  {todo.completed && ' (レポート作成時に選択)'}
                </p>
              </div>
            )}
          </div>
        ))}
        {!isCompleted && (
          <div className="pt-2">
            <form onSubmit={handleAddTodo} className="flex gap-2 mb-2 relative">
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => { setNewTodoText(e.target.value); setShowAutocomplete(true); }}
                  onFocus={() => setShowAutocomplete(true)}
                  onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                  placeholder="ToDoを追加..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
                {autocompleteSuggestions.length > 0 && (
                  <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {autocompleteSuggestions.map((s, i) => (
                      <li
                        key={i}
                        onMouseDown={() => { setNewTodoText(s); setShowAutocomplete(false); }}
                        className="px-3 py-2 hover:bg-cyan-50 cursor-pointer text-sm"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                className="flex-shrink-0 w-10 h-10 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-slate-400 transition flex items-center justify-center"
              >
                <Icon name="fa-plus" size={16} />
              </button>
            </form>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsRecentModalOpen(true)}
                className="text-xs text-slate-600 hover:text-slate-800 font-semibold flex items-center"
              >
                <Icon name="fa-clock-rotate-left" className="mr-1" size={12} />
                最近のタスク
              </button>
              <button
                type="button"
                onClick={() => setIsFreqModalOpen(true)}
                className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold flex items-center"
              >
                <Icon name="fa-star" className="mr-1" size={12} />
                よくあるタスク
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 border-t border-slate-200 bg-slate-50/80 rounded-b-lg flex flex-col sm:flex-row gap-2">
        {hasCompletedTodos && (
          <button
            onClick={() => onGenerateReport(visit)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
          >
            {isCompleted ? 'レポートを表示' : '訪問レポート作成'}
          </button>
        )}
        {isCompleted
          ? onRevertCompleteVisit && (
              <button
                onClick={() => onRevertCompleteVisit(visit.id)}
                className="flex-1 px-4 py-2 bg-amber-500 text-white font-bold rounded-md hover:bg-amber-600 transition"
              >
                完了を取り消す
              </button>
            )
          : showCompleteButton && (
              <button
                onClick={() => onCompleteVisit(visit.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition"
              >
                訪問完了
              </button>
            )}
      </footer>

      <SelectFrequentTaskModal
        isOpen={isFreqModalOpen}
        onClose={() => setIsFreqModalOpen(false)}
        frequentTasks={frequentTasks}
        onSelect={handleSelectFrequentTask}
      />

      <RecentTasksModal
        isOpen={isRecentModalOpen}
        onClose={() => setIsRecentModalOpen(false)}
        allVisits={allVisits}
        onAddTasks={handleAddRecentTasks}
      />
    </div>
  );
};
