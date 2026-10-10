import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Halaman sebelumnya"><ChevronLeft size={16} /></button>
      <span>Halaman {page} dari {pages}</span>
      <button className="btn btn-ghost" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Halaman berikutnya"><ChevronRight size={16} /></button>
    </nav>
  );
}
