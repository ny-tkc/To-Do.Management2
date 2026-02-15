import { useState, useEffect } from 'react';
import type { Firm, Visit, FrequentTask, CarriedOverTodos, CarriedOverTodoItem } from '@/types';

import { Icon } from '@/components/Icon';
import { BottomNav } from '@/components/BottomNav';
import { VisitCard } from '@/components/VisitCard';

import { AddFirmModal } from '@/components/modals/AddFirmModal';
import { AddVisitModal } from '@/components/modals/AddVisitModal';
import { ReportModal } from '@/components/modals/ReportModal';
import { SimpleReportModal } from '@/components/modals/SimpleReportModal';
import { ChangeDateModal } from '@/components/modals/ChangeDateModal';
import { UnscheduledTasksModal } from '@/components/modals/UnscheduledTasksModal';
import { BackupModal } from '@/components/modals/BackupModal';

import { TodayPage } from '@/pages/TodayPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { RatePage } from '@/pages/RatePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { MasterPage } from '@/pages/MasterPage';

export const App = () => {
  const [activePage, setActivePage] = useState('today');
  const [firms, setFirms] = useState<Firm[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [frequentTasks, setFrequentTasks] = useState<FrequentTask[]>([]);
  const [carriedOverTodos, setCarriedOverTodos] = useState<CarriedOverTodos>({});

  const [isAddFirmModalOpen, setIsAddFirmModalOpen] = useState(false);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSimpleReportModalOpen, setIsSimpleReportModalOpen] = useState(false);
  const [isChangeDateModalOpen, setIsChangeDateModalOpen] = useState(false);
  const [isUnscheduledModalOpen, setIsUnscheduledModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Initialize Data
  useEffect(() => {
    const loadedFirms = localStorage.getItem('firms');
    const loadedVisits = localStorage.getItem('visits');
    const loadedFreq = localStorage.getItem('frequentTasks');
    const loadedCarried = localStorage.getItem('carriedOverTodos');

    if (loadedFirms) setFirms(JSON.parse(loadedFirms));
    if (loadedVisits) setVisits(JSON.parse(loadedVisits));
    if (loadedFreq) setFrequentTasks(JSON.parse(loadedFreq));
    if (loadedCarried) setCarriedOverTodos(JSON.parse(loadedCarried));

    // Daily backup prompt
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastBackupPrompt = localStorage.getItem('lastBackupPromptDate');
    if (lastBackupPrompt !== todayStr) {
      localStorage.setItem('lastBackupPromptDate', todayStr);
      // Delay to let data load first
      setTimeout(() => setIsBackupModalOpen(true), 500);
    }
  }, []);

  // Save Data
  useEffect(() => { localStorage.setItem('firms', JSON.stringify(firms)); }, [firms]);
  useEffect(() => { localStorage.setItem('visits', JSON.stringify(visits)); }, [visits]);
  useEffect(() => { localStorage.setItem('frequentTasks', JSON.stringify(frequentTasks)); }, [frequentTasks]);
  useEffect(() => { localStorage.setItem('carriedOverTodos', JSON.stringify(carriedOverTodos)); }, [carriedOverTodos]);

  // -- Handlers --
  const addFirm = (newFirm: { code: string; name: string }) => {
    const firmWithId: Firm = { ...newFirm, id: Date.now().toString() };
    setFirms([...firms, firmWithId]);
  };

  const deleteFirm = (firmId: string) => {
    if (window.confirm('本当にこの事務所を削除しますか？訪問履歴は残ります。')) {
      setFirms(firms.filter((f) => f.id !== firmId));
    }
  };

  const addVisit = ({ firmId, date, todos, isClientVisit }: {
    firmId: string;
    date: string;
    todos: { text: string; subTasks: { text: string }[] }[];
    isClientVisit: boolean;
  }) => {
    const firm = firms.find((f) => f.id === firmId);
    if (!firm) return;
    const newVisit: Visit = {
      id: Date.now().toString(),
      firmId,
      firmName: isClientVisit ? `${firm.name} (関与先)` : firm.name,
      date,
      status: 'pending',
      todos: todos.map((t, i) => ({
        id: `${Date.now()}_${i}`,
        text: t.text,
        completed: false,
        completedAt: null,
        details: '',
        subTasks: t.subTasks.map((s, si) => ({
          id: `${Date.now()}_${i}_sub_${si}`,
          text: s.text,
          completed: false,
        })),
      })),
    };
    setVisits([...visits, newVisit]);

    // Remove carried over todos if used
    if (carriedOverTodos[firmId]) {
      const type = isClientVisit ? 'client' : 'firm';
      const updatedCarried = {
        ...carriedOverTodos,
        [firmId]: {
          ...carriedOverTodos[firmId],
          [type]: [],
        },
      };
      setCarriedOverTodos(updatedCarried);
    }
  };

  const updateVisit = (updatedVisit: Visit) => {
    setVisits(visits.map((v) => (v.id === updatedVisit.id ? updatedVisit : v)));
  };

  const deleteVisit = (visitId: string) => {
    setVisits(visits.filter((v) => v.id !== visitId));
  };

  const completeVisit = (visitId: string) => {
    setVisits(visits.map((v) => (v.id === visitId ? { ...v, status: 'completed' as const } : v)));
  };

  const revertCompleteVisit = (visitId: string) => {
    setVisits(visits.map((v) => (v.id === visitId ? { ...v, status: 'pending' as const } : v)));
  };

  const changeVisitDate = (visitId: string, newDate: string) => {
    setVisits(visits.map((v) => (v.id === visitId ? { ...v, date: newDate } : v)));
  };

  const openReport = (visit: Visit) => {
    setSelectedVisit(visit);
    if (visit.status === 'completed') {
      setIsSimpleReportModalOpen(true);
    } else {
      setIsReportModalOpen(true);
    }
  };

  const openChangeDate = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsChangeDateModalOpen(true);
  };

  const carryOverTodo = (visitId: string, todoId: string, isClientVisit: boolean) => {
    const visit = visits.find((v) => v.id === visitId);
    if (!visit) return;
    const todo = visit.todos.find((t) => t.id === todoId);
    if (!todo) return;

    // Remove from current visit
    const updatedVisitTodos = visit.todos.filter((t) => t.id !== todoId);
    setVisits(visits.map((v) => (v.id === visitId ? { ...v, todos: updatedVisitTodos } : v)));

    // Add to carried over
    const firmId = visit.firmId;
    const type = isClientVisit ? 'client' : 'firm';
    const currentCarried = carriedOverTodos[firmId] || { firm: [], client: [] };
    const newCarriedItem: CarriedOverTodoItem = {
      id: Date.now().toString(),
      text: todo.text,
      subTasks: todo.subTasks || [],
    };

    setCarriedOverTodos({
      ...carriedOverTodos,
      [firmId]: {
        ...currentCarried,
        [type]: [...(currentCarried[type as keyof typeof currentCarried] || []), newCarriedItem],
      },
    });
    alert('ToDoを次回持越しリストへ移動しました');
  };

  const updateCarriedOverTodos = (firmId: string, newTodos: CarriedOverTodoItem[], isClientVisit: boolean) => {
    const type = isClientVisit ? 'client' : 'firm';
    const currentCarried = carriedOverTodos[firmId] || { firm: [], client: [] };
    setCarriedOverTodos({
      ...carriedOverTodos,
      [firmId]: {
        ...currentCarried,
        [type]: newTodos,
      },
    });
  };

  // Master Data Handlers
  const exportData = () => {
    const data = { firms, visits, frequentTasks, carriedOverTodos };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.firms) setFirms(data.firms);
        if (data.visits) setVisits(data.visits);
        if (data.frequentTasks) setFrequentTasks(data.frequentTasks);
        if (data.carriedOverTodos) setCarriedOverTodos(data.carriedOverTodos);
        alert('データを復元しました');
      } catch {
        alert('データの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (window.confirm('全てのデータを削除して初期化しますか？この操作は取り消せません。')) {
      setFirms([]);
      setVisits([]);
      setFrequentTasks([]);
      setCarriedOverTodos({});
      localStorage.clear();
      alert('データを初期化しました');
    }
  };

  const addFrequentTask = (text: string, defaultSubTasks: string[] = [], id?: string) => {
    if (id) {
      setFrequentTasks(frequentTasks.map((t) => (t.id === id ? { ...t, text, defaultSubTasks } : t)));
    } else {
      setFrequentTasks([...frequentTasks, { id: Date.now().toString(), text, defaultSubTasks }]);
    }
  };

  const deleteFrequentTask = (id: string) => {
    setFrequentTasks(frequentTasks.filter((t) => t.id !== id));
  };

  const exportFirmsOnly = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Code,Name\n' +
      firms.map((f) => `${f.code},${f.name}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'firms_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFirmsOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newFirms: Firm[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const [code, name] = line.split(',');
          if (code && name) {
            newFirms.push({ id: Date.now().toString() + i, code: code.trim(), name: name.trim() });
          }
        }
      }
      if (newFirms.length > 0) {
        setFirms([...firms, ...newFirms]);
        alert(`${newFirms.length}件の事務所を取り込みました`);
      }
    };
    reader.readAsText(file);
  };

  // Pages Logic
  const getTodayVisits = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return visits.filter((v) => v.date === todayStr);
  };

  // Render Helpers
  const renderVisitCards = (visitList: Visit[], showDate = false) => {
    return visitList.map((visit) => (
      <VisitCard
        key={visit.id}
        visit={visit}
        onUpdateVisit={updateVisit}
        onGenerateReport={openReport}
        onCompleteVisit={completeVisit}
        onRevertCompleteVisit={revertCompleteVisit}
        onCarryOverTodo={carryOverTodo}
        onDeleteVisit={deleteVisit}
        onChangeDate={openChangeDate}
        frequentTasks={frequentTasks}
        allVisits={visits}
        showDate={showDate}
      />
    ));
  };

  return (
    <div className="pb-20 min-h-screen">
      <header className="bg-cyan-700 text-white p-4 shadow-md sticky top-0 z-40 pb-safe">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <h1 className="text-xl font-bold">訪問活動管理</h1>
          <button
            onClick={() => setActivePage('master')}
            className={`text-cyan-100 hover:text-white transition ${activePage === 'master' ? 'text-white' : ''}`}
            title="設定"
          >
            <Icon name="fa-gear" size={20} />
          </button>
        </div>
      </header>

      <main className="pb-safe">
        {activePage === 'today' && (
          <TodayPage
            visits={renderVisitCards(getTodayVisits())}
            onAddVisit={() => {
              setSelectedDate(new Date().toISOString().slice(0, 10));
              setIsAddVisitModalOpen(true);
            }}
            today={new Date()}
          />
        )}

        {activePage === 'calendar' && (
          <>
            <CalendarPage
              visits={visits}
              onDateSelect={(date) => setSelectedDate(date)}
              selectedDate={selectedDate}
              onOpenUnscheduledTasks={() => setIsUnscheduledModalOpen(true)}
              onDoubleClickDate={(date) => {
                setSelectedDate(date);
                setIsAddVisitModalOpen(true);
              }}
            />
            <div className="container mx-auto px-4 max-w-4xl">
              <button
                onClick={() => setIsAddVisitModalOpen(true)}
                className="w-full py-3 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 border-2 border-dashed border-slate-300 font-bold mt-4"
              >
                <Icon name="fa-plus" className="mr-2" />
                {new Date(selectedDate).toLocaleDateString()} に訪問を追加
              </button>
              <div className="space-y-4 py-4">
                {renderVisitCards(visits.filter((v) => v.date === selectedDate))}
              </div>
            </div>
          </>
        )}

        {activePage === 'rate' && <RatePage firms={firms} visits={visits} />}

        {activePage === 'history' && (
          <HistoryPage
            visits={visits}
            firms={firms}
            renderVisitCards={(filteredVisits) => renderVisitCards(filteredVisits, true)}
          />
        )}

        {activePage === 'master' && (
          <MasterPage
            firms={firms}
            onAddFirm={() => setIsAddFirmModalOpen(true)}
            onDeleteFirm={deleteFirm}
            onExportData={exportData}
            onImportData={importData}
            onResetData={resetData}
            frequentTasks={frequentTasks}
            onAddFrequentTask={addFrequentTask}
            onDeleteFrequentTask={deleteFrequentTask}
            onExportFirms={exportFirmsOnly}
            onImportFirms={importFirmsOnly}
          />
        )}
      </main>

      <BottomNav activePage={activePage} setActivePage={setActivePage} />

      <AddFirmModal
        isOpen={isAddFirmModalOpen}
        onClose={() => setIsAddFirmModalOpen(false)}
        onAddFirm={addFirm}
      />

      <AddVisitModal
        isOpen={isAddVisitModalOpen}
        onClose={() => setIsAddVisitModalOpen(false)}
        firms={firms}
        onAddVisit={addVisit}
        date={selectedDate}
        carriedOverTodos={carriedOverTodos}
        frequentTasks={frequentTasks}
        allVisits={visits}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        visit={selectedVisit}
        onUpdateVisit={updateVisit}
        onCompleteVisit={completeVisit}
      />

      <SimpleReportModal
        isOpen={isSimpleReportModalOpen}
        onClose={() => setIsSimpleReportModalOpen(false)}
        visit={selectedVisit}
      />

      <ChangeDateModal
        isOpen={isChangeDateModalOpen}
        onClose={() => setIsChangeDateModalOpen(false)}
        visit={selectedVisit}
        onSave={changeVisitDate}
      />

      <UnscheduledTasksModal
        isOpen={isUnscheduledModalOpen}
        onClose={() => setIsUnscheduledModalOpen(false)}
        firms={firms}
        carriedOverTodos={carriedOverTodos}
        onUpdateCarriedOverTodos={updateCarriedOverTodos}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onBackup={exportData}
      />
    </div>
  );
};
