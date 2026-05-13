import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MessageCircle,
  Plus,
  Search,
  UserCheck,
  UserRound,
  UserX,
  Wallet,
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

function formatDate(value) {
  if (!value) return "Não informado";

  const date = new Date(value);

  return date.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

function Alunos({ onVoltar, onNovoAluno, onEditarAluno }) {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregarAlunos() {
    try {
      setCarregando(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/api/alunos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAlunos(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAlunos();
  }, []);

  function abrirWhatsApp(telefone) {
    if (!telefone) return;

    const numero = String(telefone).replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}`, "_blank");
  }

  const alunosFiltrados = alunos.filter((aluno) => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return true;

    return (
      aluno.nome?.toLowerCase().includes(termo) ||
      aluno.telefone?.toLowerCase().includes(termo) ||
      aluno.cpf?.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="app-page">
      <div className="app-shell alunos-shell">
        <header className="form-header">
          <button type="button" onClick={onVoltar}>
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1>Alunos</h1>
            <p>Lista de alunos cadastrados</p>
          </div>
        </header>

        <section className="alunos-top-card">
          <div>
            <UserRound size={28} />
          </div>

          <span>
            <strong>{alunos.length}</strong>
            <small>alunos cadastrados</small>
          </span>

          <button type="button" onClick={onNovoAluno}>
            <Plus size={20} />
          </button>
        </section>

        <section className="search-box">
          <Search size={19} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone ou CPF"
          />
        </section>

        {carregando ? (
          <div className="loading-card">Carregando alunos...</div>
        ) : (
          <section className="students-list">
            {alunosFiltrados.length === 0 ? (
              <div className="empty-card">Nenhum aluno encontrado.</div>
            ) : (
              alunosFiltrados.map((aluno) => (
                <article className="student-card" key={aluno.id}>
                  <div className="student-card-header">
                    <div className="student-avatar">
                      {aluno.nome?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                      <strong>{aluno.nome}</strong>
                      <span>{formatDate(aluno.data_nascimento)}</span>
                    </div>

                    <div
                      className={`student-status ${
                        aluno.ativo ? "active" : "inactive"
                      }`}
                    >
                      {aluno.ativo ? (
                        <>
                          <UserCheck size={14} />
                          Ativo
                        </>
                      ) : (
                        <>
                          <UserX size={14} />
                          Inativo
                        </>
                      )}
                    </div>
                  </div>

                  <div className="student-info-grid">
                    <div>
                      <CalendarDays size={17} />
                      <span>Vence dia {aluno.dia_vencimento}</span>
                    </div>

                    <div>
                      <Wallet size={17} />
                      <span>{formatMoney(aluno.valor_mensalidade)}</span>
                    </div>
                  </div>

                  {aluno.funcionario_nome && (
                    <div className="student-schedules">
                      <UserRound size={17} />

                      <div>
                        <span>Funcionário: {aluno.funcionario_nome}</span>
                      </div>
                    </div>
                  )}

                  <div className="student-schedules">
                    <Clock3 size={17} />

                    <div>
                      {aluno.horarios?.length > 0 ? (
                        aluno.horarios.map((horario) => (
                          <span key={horario.id}>
                            {horario.dia_semana.slice(0, 3)} {horario.horario}
                          </span>
                        ))
                      ) : (
                        <span>Sem horários</span>
                      )}
                    </div>
                  </div>

                  <div className="student-actions">
                    <button
                      type="button"
                      className="whatsapp-button"
                      onClick={() => abrirWhatsApp(aluno.telefone)}
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </button>

                    <button
                      type="button"
                      className="edit-student-button"
                      onClick={() => onEditarAluno(aluno)}
                    >
                      Editar
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
}

Alunos.propTypes = {
  onVoltar: PropTypes.func.isRequired,
  onNovoAluno: PropTypes.func.isRequired,
  onEditarAluno: PropTypes.func.isRequired,
};

export default Alunos;
