import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Wallet,
} from "lucide-react";
import PropTypes from "prop-types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const meses = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Relatorios({ onVoltar }) {
  const hoje = new Date();

  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mensalidades, setMensalidades] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarRelatorio() {
    try {
      setCarregando(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/mensalidades?mes=${mes}&ano=${ano}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMensalidades(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRelatorio();
  }, [mes, ano]);

  const resumo = useMemo(() => {
    const alunosAtivos = mensalidades.filter((item) => item.ativo);

    const pagas = mensalidades.filter(
      (item) => item.status_calculado === "PAGO",
    );
    const pendentes = mensalidades.filter(
      (item) => item.status_calculado === "PENDENTE",
    );
    const atrasadas = mensalidades.filter(
      (item) => item.status_calculado === "ATRASADO",
    );

    const totalEsperado = alunosAtivos.reduce((total, item) => {
      return total + Number(item.valor || item.valor_mensalidade || 0);
    }, 0);

    const totalRecebido = pagas.reduce((total, item) => {
      return total + Number(item.valor || item.valor_mensalidade || 0);
    }, 0);

    const totalPendente = pendentes.reduce((total, item) => {
      return total + Number(item.valor || item.valor_mensalidade || 0);
    }, 0);

    const totalAtrasado = atrasadas.reduce((total, item) => {
      return total + Number(item.valor || item.valor_mensalidade || 0);
    }, 0);

    return {
      alunosAtivos: alunosAtivos.length,
      pagas,
      pendentes,
      atrasadas,
      totalEsperado,
      totalRecebido,
      totalPendente,
      totalAtrasado,
    };
  }, [mensalidades]);

  function renderLista(titulo, lista, tipo) {
    return (
      <section className="report-list-section">
        <div className="report-list-title">
          <h2>{titulo}</h2>
          <span>{lista.length}</span>
        </div>

        {lista.length === 0 ? (
          <div className="empty-card">Nenhum aluno nessa categoria.</div>
        ) : (
          <div className="report-list">
            {lista.map((item) => (
              <article
                className={`report-student-card ${tipo}`}
                key={item.aluno_id}
              >
                <div>
                  <strong>{item.aluno_nome}</strong>
                  <span>Vence dia {item.dia_vencimento}</span>
                </div>

                <b>{formatMoney(item.valor || item.valor_mensalidade)}</b>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="app-page">
      <div className="app-shell relatorios-shell">
        <header className="form-header">
          <button type="button" onClick={onVoltar}>
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1>Relatório</h1>
            <p>Resumo financeiro mensal</p>
          </div>
        </header>

        <section className="month-filter-card">
          <div className="month-field">
            <label>Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
            >
              {meses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="month-field">
            <label>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
            />
          </div>
        </section>

        {carregando ? (
          <div className="loading-card">Carregando relatório...</div>
        ) : (
          <>
            <section className="report-main-card">
              <div>
                <BarChart3 size={34} />
              </div>

              <span>Total recebido</span>
              <strong>{formatMoney(resumo.totalRecebido)}</strong>
              <small>
                De {formatMoney(resumo.totalEsperado)} esperado no mês
              </small>
            </section>

            <section className="report-grid">
              <div className="report-card">
                <Wallet size={22} />
                <span>Esperado</span>
                <strong>{formatMoney(resumo.totalEsperado)}</strong>
              </div>

              <div className="report-card paid">
                <CheckCircle2 size={22} />
                <span>Recebido</span>
                <strong>{formatMoney(resumo.totalRecebido)}</strong>
              </div>

              <div className="report-card pending">
                <Clock3 size={22} />
                <span>Pendente</span>
                <strong>{formatMoney(resumo.totalPendente)}</strong>
              </div>

              <div className="report-card late">
                <CalendarDays size={22} />
                <span>Atrasado</span>
                <strong>{formatMoney(resumo.totalAtrasado)}</strong>
              </div>
            </section>

            <section className="report-counts">
              <div>
                <strong>{resumo.alunosAtivos}</strong>
                <span>ativos</span>
              </div>

              <div>
                <strong>{resumo.pagas.length}</strong>
                <span>pagas</span>
              </div>

              <div>
                <strong>{resumo.pendentes.length}</strong>
                <span>pendentes</span>
              </div>

              <div>
                <strong>{resumo.atrasadas.length}</strong>
                <span>atrasadas</span>
              </div>
            </section>

            {renderLista("Mensalidades pagas", resumo.pagas, "paid")}
            {renderLista("Mensalidades pendentes", resumo.pendentes, "pending")}
            {renderLista("Mensalidades atrasadas", resumo.atrasadas, "late")}
          </>
        )}
      </div>
    </div>
  );
}

Relatorios.propTypes = {
  onVoltar: PropTypes.func.isRequired,
};

export default Relatorios;
