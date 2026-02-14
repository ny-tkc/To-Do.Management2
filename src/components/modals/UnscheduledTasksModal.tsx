import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@/components/Icon';
import type { Firm, CarriedOverTodos, CarriedOverTodoItem } from '@/types';

interface UnscheduledTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  firms: Firm[];
  carriedOverTodos: CarriedOverTodos;
  onUpdateCarriedOverTodos: (firmId: string, todos: CarriedOverTodoItem[], isClientVisit: boolean) => void;
}

export const UnscheduledTasksModal = ({
  isOpen,
  onClose,
  firms,
  carriedOverTodos,
  onUpdateCarriedOverTodos,
}: UnscheduledTasksModalProps) => {
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [todos, setTodos] = useState<CarriedOverTodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isClientVisit, setIsClientVisit] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFirm(null);
      setSearchQuery('');
      setShowResults(false);
      setTodos([]);
      setNewTodoText('');
      setIsClientVisit(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFirms = useMemo(() => {
    if (!searchQuery || selectedFirm) return [];
    const lowerCaseQuery = searchQuery.toLowerCase();
    return firms
      .filter(
        (firm) =>
          (firm.name || '').toLowerCase().includes(lowerCaseQuery) ||
          (firm.code || '').includes(searchQuery)
      )
      .slice(0, 10);
  }, [searchQuery, firms, selectedFirm]);

  const handleSelectFirm = (firm: Firm) => {
    setSelectedFirm(firm);
    setSearchQuery(`${firm.code} ${firm.name}`);
    setShowResults(false);
  };

  useEffect(() => {
    if (selectedFirm) {
      const firmData = carriedOverTodos[selectedFirm.id] || { firm: [], client: [] };
      const currentTodos = isClientVisit ? firmData.client || [] : firmData.firm || [];
      setTodos(currentTodos);
    } else {
      setTodos([]);
    }
    setNewTodoText('');
  }, [selectedFirm, carriedOverTodos, isClientVisit]);

  if (!isOpen) return null;

  const handleAddTodo = () => {
    if (newTodoText.trim() === '' || !selectedFirm) return;
    const newTodo: CarriedOverTodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      subTasks: [],
    };
    setTodos((prev) => [...prev, newTodo]);
    setNewTodoText('');
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodos(todos.filter((t) => t.id !== todoId));
  };

  const handleSave = () => {
    if (selectedFirm) {
      onUpdateCarriedOverTodos(selectedFirm.id, todos, isClientVisit);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-slate-800 mb-4">日程未定ToDoの管理</h2>

        <div className="space-y-4">
          <div ref={searchContainerRef} className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">対象の事務所</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedFirm(null);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="事務所を検索..."
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
            />
            {showResults && filteredFirms.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredFirms.map((firm) => (
                  <li
                    key={firm.id}
                    onClick={() => handleSelectFirm(firm)}
                    className="px-4 py-2 hover:bg-cyan-50 cursor-pointer"
                  >
                    <span className="font-bold">{firm.code}</span> - {firm.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center p-2 bg-slate-50 rounded border border-slate-200">
            <input
              type="checkbox"
              id="unscheduled-client-visit"
              checked={isClientVisit}
              onChange={(e) => setIsClientVisit(e.target.checked)}
              className="h-4 w-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
            />
            <label
              htmlFor="unscheduled-client-visit"
              className="ml-2 text-sm font-bold text-slate-700 cursor-pointer select-none"
            >
              関与先訪問として管理
            </label>
          </div>

          <div className="bg-slate-50 p-3 rounded-md min-h-[150px] max-h-[30vh] overflow-y-auto">
            <h3 className="font-semibold text-slate-600 mb-2">登録済みToDo</h3>
            {selectedFirm ? (
              todos.length > 0 ? (
                <ul className="space-y-2">
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className="flex items-center justify-between bg-white p-2 rounded shadow-sm"
                    >
                      <span className="text-slate-800">{todo.text}</span>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <Icon name="fa-trash-alt" size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">登録なし</p>
              )
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">事務所を選択してください</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="新しいToDo"
              className="flex-grow px-4 py-2 border border-slate-300 rounded-md"
              disabled={!selectedFirm}
            />
            <button
              onClick={handleAddTodo}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:bg-slate-400"
              disabled={!selectedFirm || !newTodoText.trim()}
            >
              追加
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white font-bold rounded-md disabled:bg-slate-400"
            disabled={!selectedFirm}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
