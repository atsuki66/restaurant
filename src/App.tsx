import { useState, useEffect, useCallback } from "react";
// ─── Types ───
interface Reservation {
  id: string;
  tableId: number;
  name: string;
  phone: string;
  date: string;
  time: string;
  comment: string;
  createdAt: string;
}
interface TableInfo {
  id: number;
  seats: number;
  label: string;
  description: string;
}
const TABLES: TableInfo[] = [
  { id: 1, seats: 2, label: "Столик №1", description: "Уютный столик у окна для двоих" },
  { id: 2, seats: 2, label: "Столик №2", description: "Романтический столик при свечах" },
  { id: 3, seats: 3, label: "Столик №3", description: "Столик в центре зала" },
  { id: 4, seats: 4, label: "Столик №4", description: "Просторный столик для компании" },
  { id: 5, seats: 5, label: "Столик №5", description: "Большой столик у камина" },
  { id: 6, seats: 6, label: "Столик №6", description: "VIP-столик в отдельной зоне" },
];
const API_URL = "http://localhost:5000/api";
export default function App() {
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const handlePath = () => {
      setIsAdminPath(window.location.pathname === "/admin");
    };
    handlePath();
    window.addEventListener("popstate", handlePath);
    return () => window.removeEventListener("popstate", handlePath);
  }, []);
  if (isAdminPath && !isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} onBack={() => {
      window.history.pushState({}, "", "/");
      setIsAdminPath(false);
    }} />;
  }
  if (isAdminPath && isLoggedIn) {
    return (
      <Layout onNavigateMain={() => {
         window.history.pushState({}, "", "/");
         setIsAdminPath(false);
      }}>
        <AdminPage />
      </Layout>
    );
  }
  return (
    <Layout>
      <MainPage />
    </Layout>
  );
}
function Layout({ children, onNavigateMain }: { children: React.ReactNode; onNavigateMain?: () => void }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => {
              if (onNavigateMain) onNavigateMain();
              else {
                window.history.pushState({}, "", "/");
                window.dispatchEvent(new Event("popstate"));
              }
            }} 
            className="flex items-center gap-3 cursor-pointer"
          >
            <span className="text-3xl">🍷</span>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-amber-400 font-serif">Миньоны</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">минён</p>
            </div>
          </button>
        </div>
      </nav>
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
}
function AdminLogin({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === "admin" && pass === "restaurant2024") {
      onLogin();
    } else {
      setError("Неверный логин или пароль");
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-serif font-bold text-center mb-6">Вход в админ-панель</h2>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Логин"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
          />
          <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all cursor-pointer">Войти</button>
          <button type="button" onClick={onBack} className="w-full text-white/40 text-sm hover:text-white transition-all cursor-pointer">Вернуться на главную</button>
        </form>
      </div>
    </div>
  );
}
function MainPage() {
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleBookingSubmit = async (data: any) => {
    if (!selectedTable) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: selectedTable.id, ...data }),
      });
      if (res.ok) {
        setSelectedTable(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || "Ошибка при бронировании");
      }
    } catch {
      setError("Сервер недоступен. Запустите python server.py");
    }
  };
  return (
    <div>
      <section className="relative py-20 px-6 text-center">
        <div className="relative max-w-3xl mx-auto">
          <p className="text-amber-400/80 text-sm uppercase tracking-[0.4em] mb-4">Миньоны</p>
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-white">Забронируйте столик</h2>
          <p className="text-white/50 text-lg">Выберите подходящее место и время. <br/>Разница между бронированиями одного столика должна быть не менее 1 часа.</p>
        </div>
      </section>
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/20 border border-emerald-500/50 rounded-xl px-8 py-4 text-emerald-400 backdrop-blur-md animate-fade-in shadow-2xl">
          ✅ Столик успешно забронирован!
        </div>
      )}
      <section className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TABLES.map((table) => (
          <TableCard key={table.id} table={table} onSelect={() => setSelectedTable(table)} />
        ))}
      </section>
      {selectedTable && (
        <BookingModal
          table={selectedTable}
          onClose={() => { setSelectedTable(null); setError(null); }}
          onSubmit={handleBookingSubmit}
          error={error}
        />
      )}
    </div>
  );
}
function TableCard({ table, onSelect }: { table: TableInfo; onSelect: () => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-3xl">🪑</span>
        <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full font-medium">{table.seats} мест</span>
      </div>
      <h3 className="text-xl font-serif font-semibold mb-2">{table.label}</h3>
      <p className="text-white/40 text-sm mb-6 h-10">{table.description}</p>
      <button
        onClick={onSelect}
        className="w-full py-3 bg-white/5 hover:bg-amber-600 text-white rounded-xl font-medium border border-white/10 hover:border-amber-600 transition-all cursor-pointer"
      >
        Выбрать
      </button>
    </div>
  );
}
function BookingModal({ table, onClose, onSubmit, error }: any) {
  const [formData, setFormData] = useState({ name: "", phone: "", date: "", time: "", comment: "" });
  const [vError, setVError] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVError("");
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    if (selectedDateTime <= new Date()) {
      setVError("Дата и время должны быть в будущем!");
      return;
    }
    onSubmit(formData);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg">
        <h3 className="text-2xl font-serif font-bold mb-1">{table.label}</h3>
        <p className="text-white/40 text-sm mb-6">Бронирование на {table.seats} чел.</p>
        {(vError || error) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">
            ⚠️ {vError || error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Ваше имя *"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input
            required
            placeholder="Телефон *"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white [color-scheme:dark] outline-none"
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
            <input
              required
              type="time"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white [color-scheme:dark] outline-none"
              onChange={e => setFormData({...formData, time: e.target.value})}
            />
          </div>
          <textarea
            placeholder="Комментарии"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-24 resize-none outline-none"
            onChange={e => setFormData({...formData, comment: e.target.value})}
          />
          <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all cursor-pointer">
            Забронировать
          </button>
        </form>
      </div>
    </div>
  );
}
function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const fetchReservations = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/reservations`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);
  const handleDelete = async (id: string) => {
    if (!confirm("Удалить это бронирование?")) return;
    const res = await fetch(`${API_URL}/reservations/${id}`, { method: "DELETE" });
    if (res.ok) fetchReservations();
  };
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-serif font-bold mb-8 text-amber-400">Панель управления</h2>
      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="text-white/30 text-center py-20 border border-white/5 rounded-2xl">Бронирований пока нет</div>
        ) : (
          reservations.map(r => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <div className="flex gap-2 items-center mb-2">
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded uppercase">Столик №{r.tableId}</span>
                  <span className="text-white font-bold">{r.name}</span>
                </div>
                <div className="text-white/50 text-sm space-x-4">
                  <span>📞 {r.phone}</span>
                  <span>📅 {r.date} в {r.time}</span>
                </div>
                {r.comment && <div className="text-white/30 text-xs mt-2 italic">"{r.comment}"</div>}
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                🗑 Отменить
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}