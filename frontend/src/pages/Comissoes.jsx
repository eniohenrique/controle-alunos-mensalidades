import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  UserRound,
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

function getMesAtual() {
  return new Date().getMonth() + 1;
}

function getAnoAtual() {
  return new Date().getFullYear();
}

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

function Comissoes({ onVoltar }) {
  const [mes, setMes] = useState(getMesAtual());
  const [ano, setAno] = useState(getAnoAtual());
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregarComissoes() {
    try {
      setCarregando(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/funcionarios/comissoes?mes=${mes}&ano=${ano}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDados(response.data);
    } catch (error) {
      console.error("Erro ao carregar comissões:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarComissoes();
  }, [mes, ano]);

  return (
    <div className="app-page">
      <div className="app-shell mensalidades-shell">
        <header className="form-header">
          <button type="button" onClick={onVoltar}>
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1>Comissões</h1>
            <p>Relatório de pagamento dos funcionários</p>
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

        <section className="payment-summary-grid">
          <div className="payment-summary-card">
            <Wallet size={22} />
            <span>Total de comissão</span>
            <strong>{formatMoney(dados?.total_geral_comissao || 0)}</strong>
          </div>

          <div className="payment-summary-card">
            <UserRound size={22} />
            <span>Funcionários</span>
            <strong>{dados?.total_funcionarios || 0}</strong>
          </div>
        </section>

        {carregando ? (
          <div className="loading-card">Carregando comissões...</div>
        ) : !dados?.funcionarios?.length ? (
          <div className="empty-card">
            Nenhuma comissão encontrada para esse mês.
          </div>
        ) : (
          <section className="payments-list">
            {dados.funcionarios.map((funcionario) => (
              <article
                className="payment-card"
                key={funcionario.funcionario_id}
              >
                <div className="payment-card-top">
                  <div className="payment-avatar">
                    {funcionario.funcionario_nome?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <strong>{funcionario.funcionario_nome}</strong>
                    <span>
                      Comissão de {Number(funcionario.percentual_comissao)}%
                    </span>
                  </div>

                  <span className="payment-status paid">
                    {formatMoney(funcionario.total_comissao)}
                  </span>
                </div>

                <div className="payment-details">
                  <div>
                    <Wallet size={16} />
                    Recebido: {formatMoney(funcionario.total_recebido)}
                  </div>

                  <div>
                    <CheckCircle2 size={16} />
                    {funcionario.quantidade_alunos} aluno(s)
                  </div>
                </div>

                <div className="payment-paid-info">
                  <CalendarDays size={16} />
                  <span>Alunos pagos no mês</span>
                </div>

                {funcionario.alunos.map((aluno) => (
                  <div className="payment-paid-info" key={aluno.aluno_id}>
                    <UserRound size={16} />
                    <span>
                      {aluno.aluno_nome}: {formatMoney(aluno.valor_pago)} →{" "}
                      {formatMoney(aluno.valor_comissao)}
                    </span>
                  </div>
                ))}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

Comissoes.propTypes = {
  onVoltar: PropTypes.func.isRequired,
};

export default Comissoes;
