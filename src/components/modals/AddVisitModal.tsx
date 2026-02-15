import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@/components/Icon';
import { SelectFrequentTaskModal } from './SelectFrequentTaskModal';
import { RecentTasksModal } from './RecentTasksModal';
import type { Firm, FrequentTask, CarriedOverTodos, Visit } from '@/types';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  firms: Firm[];
  onAddVisit: (data: {
    firmId: string;
    date: string;
    todos: { text: string; subTasks: { text: string }[] }[];
    isClientVisit: boolean;
  }) => void;
  date: string;
  carriedOverTodos: CarriedOverTodos;
  frequentTasks: FrequentTask[];
  allVisits: Visit[];
}

export const AddVisitModal = ({
  isOpen,
  onClose,
  firms,
  onAddVisit,
  date,
  carriedOverTodos,
  frequentTasks,
  allVisits,
}: AddVisitModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [todos, setTodos] = useState<{ text: string; subTasks: { text: string }[] }[]>([
    { text: '', subTasks: [] },
  ]);
  const [showResults, setShowResults] = useState(false);
  const [isClientVisit, setIsClientVisit] = useState(false);
  const [isFreqModalOpen, setIsFreqModalOpen] = useState(false);
  const [isRecentModalOpen, setIsRecentModalOpen] = useState(false);
  const [expandedTodoIndex, setExpandedTodoIndex] = useState<number | null>(null);
  const [autocompleteFocusIndex, setAutocompleteFocusIndex] = useState<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const pastTaskNames = useMemo(() => {
    const names = new Set<string>();
    for (const visit of allVisits) {
      for (const todo of visit.todos) {
        if (todo.text.trim()) names.add(todo.text.trim());
      }
    }
    return Array.from(names);
  }, [allVisits]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedFirm(null);
      setTodos([{ text: '', subTasks: [] }]);
      setShowResults(false);
      setIsClientVisit(false);
      setExpandedTodoIndex(null);
      setAutocompleteFocusIndex(null);
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

  useEffect(() => {
    if (selectedFirm) {
      const firmData = carriedOverTodos[selectedFirm.id] || { firm: [], client: [] };
      const carried = isClientVisit ? firmData.client || [] : firmData.firm || [];
      const initialTodos =
        carried.length > 0
          ? carried.map((t) => ({ text: t.text, subTasks: (t.subTasks || []).map((s) => ({ text: s.text })) }))
          : [{ text: '', subTasks: [] }];
      setTodos(initialTodos);
    } else {
      setTodos([{ text: '', subTasks: [] }]);
    }
  }, [selectedFirm, carriedOverTodos, isClientVisit]);

  const filteredFirms = useMemo(() => {
    if (!isOpen || !searchQuery || selectedFirm) return [];
    const lowerCaseQuery = searchQuery.toLowerCase();
    return firms
      .filter(
        (firm) =>
          (firm.name || '').toLowerCase().includes(lowerCaseQuery) ||
          (firm.code || '').includes(searchQuery)
      )
      .slice(0, 10);
  }, [isOpen, searchQuery, firms, selectedFirm]);

  const getAutocompleteSuggestions = (text: string) => {
    if (!text || text.length < 1) return [];
    const lower = text.toLowerCase();
    return pastTaskNames.filter((name) => name.toLowerCase().includes(lower) && name !== text).slice(0, 5);
  };

  if (!isOpen) return null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedFirm(null);
    setShowResults(true);
  };

  const handleSelectFirm = (firm: Firm) => {
    setSelectedFirm(firm);
    setSearchQuery(`${firm.code} ${firm.name}`);
    setShowResults(false);
  };

  const handleTodoChange = (index: number, value: string) => {
    const newTodos = [...todos];
    newTodos[index].text = value;
    setTodos(newTodos);
    setAutocompleteFocusIndex(index);
  };

  const handleSelectAutocomplete = (index: number, value: string) => {
    const newTodos = [...todos];
    newTodos[index].text = value;
    setTodos(newTodos);
    setAutocompleteFocusIndex(null);
  };

  const handleSubTasksChange = (index: number, textBlock: string) => {
    const subTasks = textBlock
      .split('\n')
      .filter((t) => t.trim() !== '')
      .map((t) => ({ text: t.trim() }));
    const newTodos = [...todos];
    newTodos[index].subTasks = subTasks;
    setTodos(newTodos);
  };

  const handleAddTodoInput = () => {
    setTodos([...todos, { text: '', subTasks: [] }]);
  };

  const handleRemoveTodoInput = (index: number) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
    if (expandedTodoIndex === index) setExpandedTodoIndex(null);
  };

  const handleSelectFrequentTask = (taskObj: FrequentTask) => {
    const subTasks = (taskObj.defaultSubTasks || []).map((t) => ({ text: t }));
    const newItem = { text: taskObj.text, subTasks };

    const emptyIndex = todos.findIndex((t) => t.text.trim() === '');
    if (emptyIndex !== -1) {
      const newTodos = [...todos];
      newTodos[emptyIndex] = newItem;
      setTodos(newTodos);
    } else {
      setTodos([...todos, newItem]);
    }
  };

  const handleAddRecentTasks = (tasks: { text: string; subTasks: { text: string }[] }[]) => {
    const emptyFiltered = todos.filter((t) => t.text.trim() !== '');
    setTodos([...emptyFiltered, ...tasks, { text: '', subTasks: [] }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTodos = todos
      .filter((t) => t.text.trim() !== '')
      .map((t) => ({
        text: t.text.trim(),
        subTasks: t.subTasks,
      }));

    if (selectedFirm && date) {
      onAddVisit({ firmId: selectedFirm.id, date, todos: finalTodos, isClientVisit });
      onClose();
    }
  };

  const canSubmit = selectedFirm && date;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-2">訪問予定の追加</h2>
        <p className="text-slate-500 mb-4 font-semibold">{date}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div ref={searchContainerRef} className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              訪問先 (コード/名称で検索)
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
              placeholder="事務所を検索..."
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition bg-white"
              autoComplete="off"
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
              id="client-visit-checkbox"
              checked={isClientVisit}
              onChange={(e) => setIsClientVisit(e.target.checked)}
              className="h-5 w-5 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
            />
            <label
              htmlFor="client-visit-checkbox"
              className="ml-3 text-sm font-bold text-slate-700 cursor-pointer"
            >
              関与先訪問（顧客面談）
            </label>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-slate-700">ToDoリスト</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setIsRecentModalOpen(true)}
                  className="text-xs text-slate-600 hover:text-slate-800 font-semibold border border-slate-200 bg-slate-50 px-2 py-1 rounded"
                >
                  <Icon name="fa-clock-rotate-left" className="mr-1" size={12} />
                  最近のタスク
                </button>
                <button
                  type="button"
                  onClick={() => setIsFreqModalOpen(true)}
                  className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold border border-cyan-200 bg-cyan-50 px-2 py-1 rounded"
                >
                  <Icon name="fa-star" className="mr-1" size={12} />
                  よくあるタスク
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {todos.map((todo, index) => {
                const suggestions = autocompleteFocusIndex === index ? getAutocompleteSuggestions(todo.text) : [];
                return (
                  <div key={index} className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="flex items-center gap-2 relative">
                      <div className="flex-grow relative">
                        <input
                          type="text"
                          value={todo.text}
                          onChange={(e) => handleTodoChange(index, e.target.value)}
                          onFocus={() => setAutocompleteFocusIndex(index)}
                          onBlur={() => setTimeout(() => setAutocompleteFocusIndex(null), 200)}
                          placeholder={`ToDo ${index + 1}`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                        />
                        {suggestions.length > 0 && (
                          <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {suggestions.map((s, si) => (
                              <li
                                key={si}
                                onMouseDown={() => handleSelectAutocomplete(index, s)}
                                className="px-3 py-2 hover:bg-cyan-50 cursor-pointer text-sm"
                              >
                                {s}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTodoIndex(expandedTodoIndex === index ? null : index)
                        }
                        className={`w-8 h-8 flex-shrink-0 rounded transition ${
                          expandedTodoIndex === index
                            ? 'bg-cyan-100 text-cyan-700'
                            : 'text-slate-400 hover:text-cyan-600'
                        }`}
                        title="詳細を追加"
                      >
                        <Icon name="fa-list-ul" size={16} />
                      </button>
                      {todos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTodoInput(index)}
                          className="w-8 h-8 flex-shrink-0 text-slate-400 hover:text-red-500 transition"
                        >
                          <Icon name="fa-minus-circle" size={16} />
                        </button>
                      )}
                    </div>
                    {(expandedTodoIndex === index ||
                      (todo.subTasks && todo.subTasks.length > 0)) && (
                      <div className="mt-2 pl-4 border-l-2 border-cyan-100 animate-fade-in-up">
                        <label className="text-xs text-slate-500 block mb-1">
                          詳細項目 (改行で区切りで入力)
                        </label>
                        <textarea
                          value={todo.subTasks.map((s) => s.text).join('\n')}
                          onChange={(e) => handleSubTasksChange(index, e.target.value)}
                          className="w-full p-2 text-sm border border-slate-300 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          rows={3}
                          placeholder={'例：〇〇資料の回収\n次回の提案'}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleAddTodoInput}
              className="mt-2 text-sm text-cyan-600 hover:text-cyan-800 font-semibold"
            >
              <Icon name="fa-plus" className="mr-1" size={12} />
              ToDoを追加
            </button>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-slate-400 transition"
              disabled={!canSubmit}
            >
              追加
            </button>
          </div>
        </form>

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
    </div>
  );
};
