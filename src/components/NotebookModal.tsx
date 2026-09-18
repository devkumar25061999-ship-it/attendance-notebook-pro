import React, { useState } from 'react';
import { BookOpen, Plus, Search, Pin, Trash2, Edit3, Check, Calendar, ArrowRight, Share2, DollarSign, Tag, X, FileText, Download } from 'lucide-react';
import { NoteItem, NoteCategory } from '../types';
import { formatDateDisplay } from '../utils/dateUtils';
import { exportAndSaveFile } from '../utils/fileExport';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<NoteItem>) => void;
  onDeleteNote: (id: string) => void;
  onClearAllNotes?: () => void;
  onSelectDateFromNote: (dateString: string) => void;
  currentSelectedDate: string;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onClearAllNotes,
  onSelectDateFromNote,
  currentSelectedDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('general');
  const [date, setDate] = useState(currentSelectedDate || new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartCreate = (defaultCat: NoteCategory = 'general') => {
    setTitle('');
    setContent('');
    setCategory(defaultCat);
    setDate(currentSelectedDate || new Date().toISOString().split('T')[0]);
    setAmount('');
    setIsPinned(false);
    setEditingId(null);
    setIsCreating(true);
  };

  const handleStartEdit = (note: NoteItem) => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setDate(note.date);
    setAmount(note.amount ? String(note.amount) : '');
    setIsPinned(Boolean(note.isPinned));
    setEditingId(note.id);
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const parsedAmount = amount ? Number(amount) || undefined : undefined;

    if (editingId) {
      onUpdateNote(editingId, {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        category,
        date,
        amount: parsedAmount,
        isPinned,
      });
    } else {
      onAddNote({
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        category,
        date,
        amount: parsedAmount,
        isPinned,
      });
    }

    setIsCreating(false);
    setEditingId(null);
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.date.includes(searchQuery);

    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'pinned') return n.isPinned;
    return n.category === selectedCategory;
  });

  // Sort notes: pinned first, then newest
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  // Category stats
  const totalAdvance = notes
    .filter((n) => n.category === 'khata' && n.amount)
    .reduce((sum, n) => sum + (n.amount || 0), 0);

  const exportNotesAsTxt = async () => {
    const lines = notes.map(
      (n, i) =>
        `#${i + 1} [${n.date}] ${n.title.toUpperCase()} (${n.category})\n` +
        (n.amount ? `Amount: ₹${n.amount}\n` : '') +
        `${n.content}\n----------------------------------------\n`
    );
    const content = `ATTENDANCE PLUS NOTEBOOK EXPORT\nTotal Notes: ${notes.length}\nDate: ${new Date().toLocaleDateString()}\n\n${lines.join('\n')}`;
    const filename = `attendance-notebook-notes-${new Date().toISOString().split('T')[0]}.txt`;

    setExportStatus('Exporting notes...');
    const result = await exportAndSaveFile({
      filename,
      content,
      mimeType: 'text/plain',
      title: 'Attendance Notebook Notes',
      dialogTitle: 'Save or Share Notes',
    });
    setExportStatus(result.message);
    setTimeout(() => setExportStatus(null), 4500);
  };

  const getCategoryBadge = (cat: NoteCategory) => {
    switch (cat) {
      case 'khata':
        return <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">💰 Khata / Advance</span>;
      case 'site_log':
        return <span className="bg-amber-800 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">🏗️ Site Log</span>;
      case 'task':
        return <span className="bg-purple-800 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md">📋 Task / Todo</span>;
      case 'meeting':
        return <span className="bg-blue-800 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md">🤝 Meeting</span>;
      default:
        return <span className="bg-slate-700 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">📝 General</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#121722] text-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border-2 border-cyan-500/40 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f172a] px-5 py-4 flex items-center justify-between border-b border-cyan-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  Notebook & Work Diary
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {notes.length} Notes
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Daily notes, site remarks, and cash advance ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notes.length > 0 && (
              <button
                onClick={exportNotesAsTxt}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Export Notes as TXT"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status notification */}
        {exportStatus && (
          <div className="bg-cyan-900/90 text-cyan-100 px-4 py-2 text-xs font-bold border-b border-cyan-700 flex items-center justify-between animate-in fade-in">
            <span>{exportStatus}</span>
            <button onClick={() => setExportStatus(null)} className="text-cyan-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Khata / Advance quick bar if any exists */}
        {totalAdvance > 0 && (
          <div className="bg-emerald-950/70 border-b border-emerald-800/40 px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
              <span>💰 Total Cash Advance Logged:</span>
              <strong className="text-emerald-100 font-black text-sm">
                ₹{totalAdvance.toLocaleString('en-IN')}
              </strong>
            </span>
            <button
              onClick={() => setSelectedCategory('khata')}
              className="text-emerald-400 hover:underline font-bold text-[11px]"
            >
              View Khata Notes
            </button>
          </div>
        )}

        {/* Search & Filter Bar - Only shown when notes actually exist and not currently creating */}
        {!isCreating && notes.length > 0 && (
          <div className="p-3 border-b border-slate-800 bg-[#161d2d] space-y-2">
            {/* Search input & New Note button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notes or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d121c] border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                id="btn-notebook-add-new"
                onClick={() => handleStartCreate('general')}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {[
                { id: 'all', label: 'All Notes' },
                { id: 'pinned', label: '📌 Pinned' },
                { id: 'general', label: 'General' },
                { id: 'khata', label: 'Khata / Advance' },
                { id: 'site_log', label: 'Site Log' },
                { id: 'task', label: 'Tasks' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create / Edit Form */}
        {isCreating ? (
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#161d2d]">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="font-extrabold text-sm text-cyan-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" />
                <span>{editingId ? 'Edit Note' : 'Create New Note / Diary Entry'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Note Title
              </label>
              <input
                type="text"
                placeholder="e.g. Site Work, Tool Advance, Supervisor Note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#0d121c] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoteCategory)}
                  className="w-full bg-[#0d121c] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                >
                  <option value="general">📝 General Note</option>
                  <option value="khata">💰 Khata / Advance Cash</option>
                  <option value="site_log">🏗️ Site Log / Material</option>
                  <option value="task">📋 Task / Todo</option>
                  <option value="meeting">🤝 Meeting / Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Calendar Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0d121c] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            {category === 'khata' && (
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  Advance / Expense Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0d121c] border border-emerald-600/60 rounded-xl px-3 py-2 text-sm text-emerald-300 font-extrabold focus:outline-hidden focus:border-emerald-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Note Details
              </label>
              <textarea
                rows={5}
                placeholder="Write your note details here... (work report, material receipt, overtime remark, etc.)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full bg-[#0d121c] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-cyan-500 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
                <span>Pin this note to top</span>
              </label>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Note</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Notes List */
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#121722]">
            {notes.length === 0 ? (
              <div className="py-14 px-4 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Notebook is Empty
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5 leading-relaxed">
                    Add a new note to log daily work remarks, site logs, or cash advances.
                  </p>
                </div>
                <button
                  id="btn-notebook-create-first"
                  onClick={() => handleStartCreate('general')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Note</span>
                </button>
              </div>
            ) : sortedNotes.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">
                    No matching notes found
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try different search terms or select another category filter.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-bold text-cyan-400 hover:underline"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className={`rounded-2xl p-3.5 border transition-all ${
                    note.isPinned
                      ? 'bg-[#182133] border-cyan-500/50 shadow-sm'
                      : 'bg-[#161d2d] border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {getCategoryBadge(note.category)}
                        {note.isPinned && (
                          <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                            <Pin className="w-2.5 h-2.5 fill-amber-300" /> Pinned
                          </span>
                        )}
                        {note.amount && (
                          <span className="text-xs text-emerald-300 font-extrabold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                            ₹{note.amount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white leading-snug">
                        {note.title}
                      </h4>
                    </div>

                    {/* Quick Tools */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onUpdateNote(note.id, { isPinned: !note.isPinned })
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.isPinned
                            ? 'text-amber-300 hover:bg-amber-900/40'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={note.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {deletingNoteId === note.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDeleteNote(note.id);
                              setDeletingNoteId(null);
                            }}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded transition-colors"
                            title="Confirm delete"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeletingNoteId(null)}
                            className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] rounded transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingNoteId(note.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {/* Card Footer: Date Linkage & Calendar Jump */}
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={() => {
                        onSelectDateFromNote(note.date);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition-colors group"
                      title="Jump to this date on Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDateDisplay(note.date)}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        const txt = `*${note.title}*\nDate: ${note.date}\n${note.amount ? `Amount: ₹${note.amount}\n` : ''}\n${note.content}`;
                        navigator.clipboard.writeText(txt);
                        alert('Note copied to clipboard!');
                      }}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
