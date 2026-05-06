import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Bell,
  Users,
  Wallet,
  Clock3,
  UserCheck,
  Plus,
  ReceiptText,
  CalendarDays,
  MessageCircle,
  CreditCard,
  Home,
  UserRound,
  BarChart3,
  LogOut,
} from "lucide-react";
import PropTypes from "prop-types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Dashboard({
  usuario,
  onLogout,
  onNovoAluno,
  onAbrirAlunos,
  onAbrirMensalidades,
  onAbrirPerfil,
  onAbrirRelatorios,
}) {
  const [mensalidades, setMensalidades] = useState([]);
  const [atrasadas, setAtrasadas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const token = localStorage.getItem("token");

  async function carregarDashboard() {
    try {
      setCarregando(true);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [mensalidadesRes, atrasadasRes] = await Promise.all([
        axios.get(`${API_URL}/api/mensalidades`, { headers }),
        axios.get(`${API_URL}/api/mensalidades/atrasadas`, { headers }),
      ]);

      setMensalidades(mensalidadesRes.data || []);
      setAtrasadas(atrasadasRes.data?.alunos || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  const resumo = useMemo(() => {
    const pagas = mensalidades.filter((m) => m.status_calculado === "PAGO");
    const pendentes = mensalidades.filter(
      (m) => m.status_calculado === "PENDENTE",
    );
    const ativos = mensalidades.filter((m) => m.ativo);

    const recebido = pagas.reduce((total, item) => {
      return total + Number(item.valor || 0);
    }, 0);

    return {
      recebido,
      pendentes: pendentes.length,
      atrasados: atrasadas.length,
      ativos: ativos.length,
    };
  }, [mensalidades, atrasadas]);

  function abrirWhatsApp(telefone) {
    if (!telefone) return;

    const numero = String(telefone).replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}`, "_blank");
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        <div className="dashboard-watermark watermark-1">
          <ReceiptText size={80} />
        </div>

        <div className="dashboard-watermark watermark-2">
          <BarChart3 size={82} />
        </div>

        <header className="dashboard-header">
          <div>
            <h1>Controle de Alunos</h1>
            <h2>e Mensalidades</h2>
          </div>

          <button
            className="notification-button"
            type="button"
            onClick={() =>
              onAbrirMensalidades({
                filtroInicial: "ATRASADO",
              })
            }
          >
            <Bell size={26} />
            {resumo.atrasados > 0 && (
              <span className="notification-badge">{resumo.atrasados}</span>
            )}
          </button>
        </header>

        <section className="welcome-card">
          <div className="avatar-letter">
            {usuario?.nome?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <p>Olá,</p>
            <strong>{usuario?.nome}</strong>
            <span>{usuario?.empresa_nome}</span>
          </div>

          <button onClick={onLogout} className="logout-button" type="button">
            <LogOut size={18} />
          </button>
        </section>

        {carregando ? (
          <div className="loading-card">Carregando informações...</div>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon green">
                  <Wallet size={24} />
                </div>
                <span>Recebido no mês</span>
                <strong>{formatMoney(resumo.recebido)}</strong>
                <Wallet className="stat-watermark" size={68} />
              </div>

              <div className="stat-card">
                <div className="stat-icon gold">
                  <Users size={24} />
                </div>
                <span>Pendentes</span>
                <strong className="orange">{resumo.pendentes}</strong>
                <small>alunos</small>
                <Users className="stat-watermark" size={70} />
              </div>

              <div className="stat-card">
                <div className="stat-icon red">
                  <Clock3 size={24} />
                </div>
                <span>Atrasados</span>
                <strong className="red-text">{resumo.atrasados}</strong>
                <small>alunos</small>
                <Clock3 className="stat-watermark" size={70} />
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <UserCheck size={24} />
                </div>
                <span>Alunos ativos</span>
                <strong>{resumo.ativos}</strong>
                <UserCheck className="stat-watermark" size={70} />
              </div>
            </section>

            <button
              className="add-student-card"
              type="button"
              onClick={onNovoAluno}
            >
              <div>
                <Plus size={32} />
              </div>

              <span>
                <strong>+ Cadastrar aluno</strong>
                <small>Adicione um novo aluno ao sistema</small>
              </span>

              <UserRound size={54} className="add-watermark" />
            </button>

            <button
              className="report-shortcut-card"
              type="button"
              onClick={onAbrirRelatorios}
            >
              <div>
                <BarChart3 size={30} />
              </div>

              <span>
                <strong>Relatório financeiro</strong>
                <small>Veja o resumo completo do mês</small>
              </span>

              <ReceiptText size={54} className="add-watermark" />
            </button>

            <section className="section-title-row">
              <div>
                <Clock3 size={21} />
                <h3>Mensalidades atrasadas</h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  onAbrirMensalidades({
                    filtroInicial: "ATRASADO",
                  })
                }
              >
                Ver todas
              </button>
            </section>

            <section className="overdue-list">
              {atrasadas.length === 0 ? (
                <div className="empty-card">
                  Nenhuma mensalidade atrasada no momento 🎉
                </div>
              ) : (
                atrasadas.slice(0, 3).map((item) => (
                  <article className="overdue-card" key={item.aluno_id}>
                    <div className="overdue-avatar">
                      {item.aluno_nome?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="overdue-info">
                      <strong>{item.aluno_nome}</strong>

                      <span>
                        <CalendarDays size={15} />
                        Vencimento: dia {item.dia_vencimento}
                      </span>

                      <button
                        type="button"
                        className="whatsapp-line"
                        onClick={() => abrirWhatsApp(item.telefone)}
                      >
                        <MessageCircle size={16} />
                        {item.telefone || "Sem telefone"}
                      </button>
                    </div>

                    <div className="overdue-actions">
                      <span className="status-pill">Atrasado</span>

                      <button
                        type="button"
                        onClick={() =>
                          onAbrirMensalidades({
                            filtroInicial: "ATRASADO",
                            alunoPagamentoIdInicial: item.aluno_id,
                          })
                        }
                      >
                        <CreditCard size={16} />
                        Registrar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
          </>
        )}

        <nav className="bottom-nav">
          <button className="active" type="button">
            <Home size={22} />
            <span>Dashboard</span>
          </button>

          <button type="button" onClick={onAbrirAlunos}>
            <Users size={22} />
            <span>Alunos</span>
          </button>

          <button type="button" onClick={onAbrirMensalidades}>
            <ReceiptText size={22} />
            <span>Mensalidades</span>
          </button>

          <button type="button" onClick={onAbrirPerfil}>
            <UserRound size={22} />
            <span>Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  usuario: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  onNovoAluno: PropTypes.func.isRequired,
  onAbrirAlunos: PropTypes.func.isRequired,
  onAbrirMensalidades: PropTypes.func.isRequired,
  onAbrirPerfil: PropTypes.func.isRequired,
  onAbrirRelatorios: PropTypes.func.isRequired,
};
export default Dashboard;
