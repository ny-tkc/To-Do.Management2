import type { Visit } from '@/types';

export const generateReportText = (visit: Visit | null): string => {
  if (!visit || !visit.todos) return '';

  const completedTodos = visit.todos
    .filter((todo) => todo.completed)
    .sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
      }
      return 0;
    });

  return completedTodos
    .map((todo, index) => {
      const lines: string[] = [];
      lines.push(`(${index + 1}) ${todo.text}`);

      if (todo.subTasks && todo.subTasks.length > 0) {
        const checkedSubs = todo.subTasks.filter((sub) => sub.completed);
        checkedSubs.forEach((sub) => {
          lines.push(`  ・${sub.text}`);
        });
      }

      if (todo.details && todo.details.trim() !== '') {
        const detailLines = todo.details
          .split('\n')
          .filter((line) => line.trim() !== '')
          .map((line) => `  ・${line.trim()}`);
        lines.push(...detailLines);
      }

      return lines.join('\n');
    })
    .join('\n');
};
