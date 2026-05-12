type AiTaskPanelProps = {
  taskCount: number;
  isGenerating: boolean;
  onTaskCountChange: (value: number) => void;
  onGenerate: () => void;
};

export default function AiTaskPanel({
  taskCount,
  isGenerating,
  onTaskCountChange,
  onGenerate
}: AiTaskPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-white/85 p-3 shadow-[0_16px_50px_-36px_rgba(15,23,42,0.45)] sm:flex-row sm:items-center">
      <select
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
        value={taskCount}
        onChange={(event) => onTaskCountChange(Number(event.target.value))}
      >
        <option value={3}>3 tasks</option>
        <option value={5}>5 tasks</option>
        <option value={8}>8 tasks</option>
      </select>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isGenerating ? 'Generating tasks...' : 'Generate with AI'}
      </button>
    </div>
  );
}
