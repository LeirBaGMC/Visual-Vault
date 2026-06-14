import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import useLogout from "../../hooks/useLogout";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const Configuracion = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const [seccion, setSeccion] = useState("perfil");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    website: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  // 1. Carga inicial de datos blindada
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    fetch(`${apiUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          logout(); // Si el token expiró al entrar, lo expulsamos inmediatamente
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((u) => {
        if (!u) return;
        setUser(u);
        setForm({
          name: u.name || "",
          username: u.username || "",
          bio: u.bio || "",
          website: u.website || "",
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setGuardado(false);
    if (error) setError(""); // Limpia el error visual al escribir
  };

  const guardar = async () => {
    setGuardando(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${apiUrl}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await r.json();

      // 2. Traductor Extremo de Errores (Anti 401 y 422)
      if (!r.ok) {
        if (r.status === 401) {
          logout(); // Expulsión de emergencia si el token muere justo al guardar
          return;
        }

        let mensajeError = "No se pudo guardar la información.";
        if (data && data.detail) {
          if (Array.isArray(data.detail)) {
            mensajeError = data.detail
              .map((err) => err.msg || "Dato inválido")
              .join(" | ");
          } else if (typeof data.detail === "string") {
            mensajeError = data.detail;
          }
        }
        throw new Error(mensajeError);
      }

      setUser(data);
      localStorage.setItem("username", data.name || data.username);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const restablecer = () => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        website: user.website || "",
      });
      setError("");
    }
  };

  const iniciales = (form.name || form.username || "VV")
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { key: "perfil", label: "Editar perfil" },
    { key: "cuenta", label: "Gestión de la cuenta" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Barra superior */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate("/perfil")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50 text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Volver
        </button>
        <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-sm ml-auto shadow-sm">
          {iniciales.charAt(0)}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-10 flex flex-col md:flex-row gap-10 animate-in fade-in duration-500">
        {/* Nav izquierda */}
        <nav className="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto hide-scrollbar">
          {navItems.map((it) => (
            <button
              key={it.key}
              onClick={() => setSeccion(it.key)}
              className={`text-left whitespace-nowrap px-4 py-2.5 rounded-xl text-[15px] font-semibold transition-all duration-300 ${
                seccion === it.key
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {it.label}
            </button>
          ))}
        </nav>

        {/* Contenido principal */}
        <main className="flex-1 max-w-xl">
          {seccion === "perfil" ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-display font-semibold tracking-tight mb-2">
                Editar perfil
              </h1>
              <p className="text-slate-500 mb-8 text-base">
                Mantén la privacidad de tus datos. Cualquiera que vea tu perfil
                puede ver esta información.
              </p>

              {/* Alerta de Error Premium */}
              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium shadow-sm animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Foto */}
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Foto
                </p>
                <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                  {iniciales}
                </div>
              </div>

              <div className="space-y-6">
                <Campo label="Nombre">
                  <input
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Tu nombre"
                    className={inputCls}
                  />
                </Campo>

                <Campo label="Info" ayuda="Cuenta tu historia">
                  <textarea
                    value={form.bio}
                    onChange={set("bio")}
                    rows={4}
                    placeholder="Escribe algo sobre ti..."
                    className={`${inputCls} resize-none`}
                  />
                </Campo>

                <Campo
                  label="Sitio web"
                  ayuda="Añade un enlace para impulsar el tráfico a tu sitio"
                >
                  <input
                    value={form.website}
                    onChange={set("website")}
                    placeholder="https://"
                    className={inputCls}
                  />
                </Campo>

                <Campo
                  label="Nombre de usuario"
                  ayuda={`visualvault.com/${form.username || "usuario"}`}
                >
                  <input
                    value={form.username}
                    onChange={set("username")}
                    placeholder="usuario"
                    className={inputCls}
                  />
                </Campo>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-display font-semibold tracking-tight mb-2">
                Gestión de la cuenta
              </h1>
              <p className="text-slate-500 mb-8 text-base">
                Modifica tu información personal o tu cuenta.
              </p>

              <Campo label="Correo electrónico">
                <input
                  value={user?.email || ""}
                  disabled
                  className={`${inputCls} bg-slate-50/50 text-slate-400 cursor-not-allowed`}
                />
              </Campo>

              <div className="flex items-center justify-between py-5 border-t border-slate-100 mt-6">
                <div>
                  <p className="font-semibold text-slate-900">
                    Nivel de Acceso
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {user?.is_admin
                      ? "Administrador de la Bóveda"
                      : "Usuario Estándar"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-5 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-900">Cerrar sesión</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Salir de tu cuenta en este dispositivo.
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-all duration-300 active:scale-95"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Barra de guardado fija con Botones Premium */}
      {seccion === "perfil" && (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 px-5 py-4 flex justify-center gap-4 animate-in slide-in-from-bottom-full duration-500">
          <button
            onClick={restablecer}
            className="px-8 py-3 !rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:shadow-sm transition-all duration-300 active:scale-95"
          >
            Restablecer
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="px-8 py-3 !rounded-full bg-slate-900 text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2 min-w-[140px]"
          >
            {guardado ? (
              <>
                <Check className="w-4 h-4" /> Guardado
              </>
            ) : guardando ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando
              </span>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// Estilos de input modernos (Focus ring negro estilo Vercel)
const inputCls =
  "w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-sm transition-all placeholder:text-slate-400";

const Campo = ({ label, ayuda, children }) => (
  <div className="mb-6">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </label>
    {children}
    {ayuda && (
      <p className="text-xs text-slate-400 mt-2 font-medium">{ayuda}</p>
    )}
  </div>
);

export default Configuracion;
