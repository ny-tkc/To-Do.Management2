interface ProgressBarProps {
  value: number;
  max: number;
}

export const ProgressBar = ({ value, max }: ProgressBarProps) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  let barColor = 'bg-red-400';
  if (percentage === 100) {
    barColor = 'bg-green-500';
  } else if (percentage >= 70) {
    barColor = 'bg-cyan-600';
  } else if (percentage >= 30) {
    barColor = 'bg-amber-400';
  }

  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div
        className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
