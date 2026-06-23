import { useEffect, useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import { getTasks, addTask, toggleTask, deleteTask } from '../utils/storage';

export default function Tasks({ onBack, onChanged }) {
  const [tasks, setTasks] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const refresh = (next) => {
    setTasks(next);
    onChanged?.();
  };

  const handleAdd = () => {
    if (!draft.trim()) return;
    addTask(draft);
    setDraft('');
    refresh(getTasks());
  };

  const handleToggle = (id) => refresh(toggleTask(id));
  const handleDelete = (id) => refresh(deleteTask(id));

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <div className="px-5 pb-28 pt-2">
      <ScreenHeader title="Tasks" onBack={onBack} />

      <p className="mt-2 text-sm text-app-muted">{remaining} task{remaining === 1 ? '' : 's'} remaining</p>

      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a small, doable task..."
          className="flex-1 rounded-xl border border-app-border bg-app-card px-3.5 py-2.5 text-sm text-app-text placeholder:text-app-muted focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          aria-label="Add task"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {tasks.length === 0 && (
          <p className="mt-8 text-center text-sm text-app-muted">
            No tasks yet — add one small thing you can do today.
          </p>
        )}
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleToggle(task.id)}
              aria-pressed={task.completed}
              aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                task.completed ? 'border-brand bg-brand text-white' : 'border-app-border text-transparent'
              }`}
            >
              <Check size={14} />
            </button>
            <span
              className={`flex-1 text-sm ${
                task.completed ? 'text-app-muted line-through' : 'text-app-text'
              }`}
            >
              {task.title}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(task.id)}
              aria-label="Delete task"
              className="text-app-muted"
            >
              <Trash2 size={16} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
