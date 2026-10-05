import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Library } from 'lucide-react';

type Status = 'want' | 'reading' | 'finished';

interface Book {
  id: string;
  title: string;
  status: Status;
}

const STATUS_META: Record<Status, { label: string; badge: string; dot: string }> = {
  want: {
    label: 'Want to Read',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  reading: {
    label: 'Reading',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
  },
  finished: {
    label: 'Finished',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const FILTERS: { key: Status | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'want', label: 'Want to Read' },
  { key: 'reading', label: 'Reading' },
  { key: 'finished', label: 'Finished' },
];

const STORAGE_KEY = 'reading-list-books';
const MAX_TITLE_LENGTH = 60;

function normalize(title: string): string {
  return title.trim().replace(/\s+/g, ' ').toLowerCase();
}

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Book =>
        b &&
        typeof b.id === 'string' &&
        typeof b.title === 'string' &&
        ['want', 'reading', 'finished'].includes(b.status)
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Status>('want');
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    setBooks(loadBooks());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim().replace(/\s+/g, ' ');
    if (!trimmed) return;
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError('Book title must be 60 characters or fewer.');
      return;
    }
    if (books.some((b) => normalize(b.title) === normalize(trimmed))) {
      setError('This book is already in your reading list.');
      return;
    }
    setError('');
    setBooks((prev) => [
      { id: crypto.randomUUID(), title: trimmed, status },
      ...prev,
    ]);
    setTitle('');
    setStatus('want');
  };

  const changeStatus = (id: string, next: Status) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: next } : b))
    );
  };

  const removeBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const visible =
    filter === 'all' ? books : books.filter((b) => b.status === filter);

  const counts = {
    all: books.length,
    want: books.filter((b) => b.status === 'want').length,
    reading: books.filter((b) => b.status === 'reading').length,
    finished: books.filter((b) => b.status === 'finished').length,
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-900 text-white">
              <Library size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Reading List
              </h1>
              <p className="text-sm text-stone-500">
                Track the books you want to read, are reading, and have finished.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Add book form */}
        <form
          onSubmit={addBook}
          className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2 text-stone-700 font-semibold">
            <Plus size={18} />
            <span>Add a book</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book title"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 bg-white"
            >
              <option value="want">Want to Read</option>
              <option value="reading">Reading</option>
              <option value="finished">Finished</option>
            </select>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </form>

        {/* Summary */}
        {books.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-stone-900">{counts.all}</p>
              <p className="text-xs text-stone-500 mt-0.5">Total Books</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-sky-600">{counts.reading}</p>
              <p className="text-xs text-stone-500 mt-0.5">Currently Reading</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-emerald-600">{counts.finished}</p>
              <p className="text-xs text-stone-500 mt-0.5">Finished</p>
            </div>
          </div>
        )}

        {/* Filters */}
        {books.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition border ${
                    active
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-900'
                  }`}
                >
                  {f.label}
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {counts[f.key]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* List / Empty state */}
        {books.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
              <BookOpen size={28} />
            </div>
            <p className="text-stone-500 text-sm">
              Your reading list is empty. Add your first book.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center py-12 text-stone-500 text-sm">
            No books in this category.
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((book) => (
              <li
                key={book.id}
                className="group bg-white rounded-xl border border-stone-200 p-4 shadow-sm transition hover:shadow-md hover:border-stone-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                        STATUS_META[book.status].dot
                      }`}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900 leading-snug break-words">
                        {book.title}
                      </h3>
                      <span
                        className={`inline-flex items-center mt-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          STATUS_META[book.status].badge
                        }`}
                      >
                        {STATUS_META[book.status].label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBook(book.id)}
                    aria-label={`Remove ${book.title}`}
                    className="text-stone-300 hover:text-red-500 transition shrink-0 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Status switcher */}
                <div className="flex flex-wrap gap-1.5 mt-3 pl-5">
                  {(Object.keys(STATUS_META) as Status[]).map((s) => {
                    const active = book.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => changeStatus(book.id, s)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition border ${
                          active
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-800'
                        }`}
                      >
                        {STATUS_META[s].label}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-4 pb-10 pt-2 text-center text-xs text-stone-400">
        Saved on this device.
      </footer>
    </div>
  );
}
