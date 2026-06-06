import { useEffect, useState } from 'react'
import { supabase, type PersonalTodoGlobal } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckSquare, Square, Plus, Trash2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PersonalTodoProps {
  searchQuery: string
}

interface LocalTodo {
  id: string
  text: string
  done: boolean
  createdAt: string
}

const STORAGE_KEY = 'section-zero-personal-todos'

function loadLocalTodos(): LocalTodo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveLocalTodos(todos: LocalTodo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function PersonalTodoView({ searchQuery }: PersonalTodoProps) {
  const [globalItems, setGlobalItems] = useState<PersonalTodoGlobal[]>([])
  const [loading, setLoading] = useState(true)
  const [localTodos, setLocalTodos] = useState<LocalTodo[]>(loadLocalTodos)
  const [newTask, setNewTask] = useState('')
  const [globalChecked, setGlobalChecked] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sz-global-checked') ?? '[]')) } catch { return new Set() }
  })

  useEffect(() => {
    supabase.from('personal_todo_global').select('*').order('priority').then(({ data }) => {
      setGlobalItems(data ?? [])
      setLoading(false)
    })
  }, [])

  function toggleGlobal(id: string) {
    setGlobalChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('sz-global-checked', JSON.stringify([...next]))
      return next
    })
  }

  function addLocalTodo() {
    if (!newTask.trim()) return
    const todo: LocalTodo = { id: crypto.randomUUID(), text: newTask.trim(), done: false, createdAt: new Date().toISOString() }
    const updated = [todo, ...localTodos]
    setLocalTodos(updated)
    saveLocalTodos(updated)
    setNewTask('')
  }

  function toggleLocalTodo(id: string) {
    const updated = localTodos.map((t) => t.id === id ? { ...t, done: !t.done } : t)
    setLocalTodos(updated)
    saveLocalTodos(updated)
  }

  function deleteLocalTodo(id: string) {
    const updated = localTodos.filter((t) => t.id !== id)
    setLocalTodos(updated)
    saveLocalTodos(updated)
  }

  const filteredGlobal = globalItems.filter((item) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return item.title.toLowerCase().includes(q) || (item.description ?? '').toLowerCase().includes(q)
  })

  const filteredLocal = localTodos.filter((t) => {
    if (!searchQuery) return true
    return t.text.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const groupedGlobal = filteredGlobal.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, PersonalTodoGlobal[]>)

  const doneCount = globalItems.filter((i) => globalChecked.has(i.id)).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">My To-Do List</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Shared cohort checklist and your private tasks.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Global Cohort Checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Cohort Checklist</h3>
            {!loading && (
              <span className="text-xs text-muted-foreground">
                {doneCount}/{globalItems.length} done
              </span>
            )}
          </div>

          {!loading && globalItems.length > 0 && (
            <div className="mb-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-darden-orange transition-all"
                style={{ width: `${(doneCount / globalItems.length) * 100}%` }}
              />
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedGlobal).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 capitalize">{category}</h4>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const checked = globalChecked.has(item.id)
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleGlobal(item.id)}
                          className={cn(
                            'w-full text-left flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-accent/30',
                            checked ? 'bg-muted/50 border-border/50' : 'bg-card border-border'
                          )}
                        >
                          {checked
                            ? <CheckSquare className="h-4 w-4 text-darden-orange shrink-0 mt-0.5" />
                            : <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          }
                          <div className="flex-1 min-w-0">
                            <div className={cn('text-xs font-medium', checked && 'line-through text-muted-foreground')}>
                              {item.title}
                            </div>
                            {item.due_hint && !checked && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">{item.due_hint}</div>
                            )}
                          </div>
                          {item.priority <= 1 && !checked && (
                            <Circle className="h-2.5 w-2.5 fill-red-500 text-red-500 shrink-0 mt-1" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personal To-Do */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">My Private Tasks</h3>
            <span className="text-xs text-muted-foreground">Saved locally · not synced</span>
          </div>

          <div className="flex gap-2 mb-3">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLocalTodo()}
              placeholder="Add a task..."
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={addLocalTodo}
              disabled={!newTask.trim()}
              className="h-8 shrink-0 bg-darden-navy text-white hover:bg-darden-navy/90 dark:bg-darden-orange dark:hover:bg-darden-orange/90"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {filteredLocal.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-xs text-muted-foreground">
                {searchQuery ? `No tasks match "${searchQuery}"` : 'No personal tasks yet. Add one above!'}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredLocal.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2.5',
                    todo.done ? 'bg-muted/50 border-border/50' : 'bg-card border-border'
                  )}
                >
                  <button onClick={() => toggleLocalTodo(todo.id)}>
                    {todo.done
                      ? <CheckSquare className="h-4 w-4 text-darden-orange" />
                      : <Square className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    }
                  </button>
                  <span className={cn('flex-1 text-xs', todo.done && 'line-through text-muted-foreground')}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteLocalTodo(todo.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
