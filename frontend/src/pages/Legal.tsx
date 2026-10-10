import { usePageMeta } from '../hooks/usePageMeta';
import { PageHead } from '../components/ui';

const content = {
  privacy: {
    title: 'Privacy Policy',
    body: [
      'Dokumen ini adalah templat awal dan belum ditinjau secara hukum. Pemilik situs wajib menyesuaikannya sebelum produksi.',
      'Data akun yang disimpan: email, nama tampilan, hash password, paket, dan waktu pendaftaran. API key disimpan hanya dalam bentuk hash.',
      'Request log memuat method, route, status, durasi, waktu, dan awalan API key. Isi body, header, query, dan alamat IP tidak dicatat oleh aplikasi.',
      'Leaderboard menampilkan nama tampilan dan jumlah request; email tidak ditampilkan.',
      'Frontend ini tidak memasang pelacak pihak ketiga. Font dimuat dari Google Fonts.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'Dokumen ini adalah templat awal dan belum ditinjau secara hukum. Pemilik situs wajib menyesuaikannya sebelum produksi.',
      'Layanan disediakan apa adanya. Pengguna bertanggung jawab menjaga kerahasiaan API key dan mematuhi hukum yang berlaku.',
      'Penyalahgunaan (spam, otomatisasi berlebihan, upaya menembus limit) dapat dibatasi, dan key atau akun dapat dicabut.',
      'Limit harian dan batas key mengikuti paket yang aktif pada akun.',
    ],
  },
} as const;

export default function Legal({ kind }: { kind: keyof typeof content }) {
  const c = content[kind];
  usePageMeta(c.title);
  return (
    <section className="container section narrow">
      <PageHead eyebrow="Legal" title={c.title} />
      <div className="card block prose">{c.body.map((p) => <p key={p}>{p}</p>)}</div>
    </section>
  );
}
