import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  MessageCircle,
  ReceiptText,
  Upload,
  Wallet,
  X,
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

function Mensalidades({
  onVoltar,
  filtroInicial = "TODOS",
  alunoPagamentoIdInicial = null,
}) {
  const [mensalidades, setMensalidades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mes, setMes] = useState(getMesAtual());
  const [ano, setAno] = useState(getAnoAtual());
  const [filtroStatus, setFiltroStatus] = useState(filtroInicial);
  const [modalAberto, setModalAberto] = useState(false);
  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("DINHEIRO");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [comprovanteUrl, setComprovanteUrl] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [modalInicialAberto, setModalInicialAberto] = useState(false);

  async function carregarMensalidades() {
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
      console.error("Erro ao carregar mensalidades:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMensalidades();
  }, [mes, ano]);

  useEffect(() => {
    setFiltroStatus(filtroInicial || "TODOS");
  }, [filtroInicial]);

  useEffect(() => {
    if (
      !carregando &&
      alunoPagamentoIdInicial &&
      mensalidades.length > 0 &&
      !modalInicialAberto
    ) {
      const mensalidade = mensalidades.find(
        (item) => Number(item.aluno_id) === Number(alunoPagamentoIdInicial),
      );

      if (mensalidade) {
        abrirModalPagamento(mensalidade);
        setModalInicialAberto(true);
      }
    }
  }, [carregando, mensalidades, alunoPagamentoIdInicial, modalInicialAberto]);

  const resumo = useMemo(() => {
    const pagas = mensalidades.filter(
      (item) => item.status_calculado === "PAGO",
    );
    const pendentes = mensalidades.filter(
      (item) => item.status_calculado === "PENDENTE",
    );
    const atrasadas = mensalidades.filter(
      (item) => item.status_calculado === "ATRASADO",
    );

    const recebido = pagas.reduce((total, item) => {
      return total + Number(item.valor || 0);
    }, 0);

    return {
      pagas: pagas.length,
      pendentes: pendentes.length,
      atrasadas: atrasadas.length,
      recebido,
    };
  }, [mensalidades]);

  const mensalidadesFiltradas = useMemo(() => {
    if (filtroStatus === "TODOS") {
      return mensalidades;
    }

    return mensalidades.filter(
      (item) => item.status_calculado === filtroStatus,
    );
  }, [mensalidades, filtroStatus]);

  function abrirWhatsApp(telefone) {
    if (!telefone) return;

    const numero = String(telefone).replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}`, "_blank");
  }

  function abrirModalPagamento(item) {
    setMensalidadeSelecionada(item);
    setFormaPagamento(item.forma_pagamento || "DINHEIRO");
    setValor(item.valor || item.valor_mensalidade || "");
    setObservacao(item.observacao || "");
    setComprovanteUrl(item.comprovante_url || "");
    setArquivo(null);
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setMensalidadeSelecionada(null);
    setErro("");
  }

  async function enviarComprovanteSeNecessario() {
    if (!arquivo) {
      return comprovanteUrl || "";
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("comprovante", arquivo);

    const response = await axios.post(
      `${API_URL}/api/upload/comprovante`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.url;
  }

  async function registrarPagamento(e) {
    e.preventDefault();

    if (!mensalidadeSelecionada) return;

    try {
      setSalvando(true);
      setErro("");

      const token = localStorage.getItem("token");
      const urlComprovante = await enviarComprovanteSeNecessario();

      await axios.post(
        `${API_URL}/api/mensalidades/${mensalidadeSelecionada.aluno_id}/pagamento`,
        {
          mes,
          ano,
          valor: Number(valor || 0),
          forma_pagamento: formaPagamento,
          comprovante_url: urlComprovante || null,
          observacao,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fecharModal();
      await carregarMensalidades();
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          error.message ||
          "Erro ao registrar pagamento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function getStatusClass(status) {
    if (status === "PAGO") return "paid";
    if (status === "ATRASADO") return "late";
    return "pending";
  }

  function getStatusLabel(status) {
    if (status === "PAGO") return "Pago";
    if (status === "ATRASADO") return "Atrasado";
    return "Pendente";
  }

  return (
    <div className="app-page">
      <div className="app-shell mensalidades-shell">
        <header className="form-header">
          <button type="button" onClick={onVoltar}>
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1>Mensalidades</h1>
            <p>Controle de pagamentos do mês</p>
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
          <button
            type="button"
            className={`payment-summary-card clickable ${
              filtroStatus === "TODOS" ? "selected" : ""
            }`}
            onClick={() => setFiltroStatus("TODOS")}
          >
            <Wallet size={22} />
            <span>Recebido</span>
            <strong>{formatMoney(resumo.recebido)}</strong>
          </button>

          <button
            type="button"
            className={`payment-summary-card clickable ${
              filtroStatus === "PAGO" ? "selected" : ""
            }`}
            onClick={() => setFiltroStatus("PAGO")}
          >
            <CheckCircle2 size={22} />
            <span>Pagas</span>
            <strong>{resumo.pagas}</strong>
          </button>

          <button
            type="button"
            className={`payment-summary-card clickable ${
              filtroStatus === "PENDENTE" ? "selected" : ""
            }`}
            onClick={() => setFiltroStatus("PENDENTE")}
          >
            <Clock3 size={22} />
            <span>Pendentes</span>
            <strong>{resumo.pendentes}</strong>
          </button>

          <button
            type="button"
            className={`payment-summary-card clickable late ${
              filtroStatus === "ATRASADO" ? "selected" : ""
            }`}
            onClick={() => setFiltroStatus("ATRASADO")}
          >
            <CalendarDays size={22} />
            <span>Atrasadas</span>
            <strong>{resumo.atrasadas}</strong>
          </button>
        </section>

        {carregando ? (
          <div className="loading-card">Carregando mensalidades...</div>
        ) : (
          <section className="payments-list">
            {mensalidadesFiltradas.length === 0 ? (
              <div className="empty-card">
                Nenhuma mensalidade encontrada para esse filtro.
              </div>
            ) : (
              mensalidadesFiltradas.map((item) => (
                <article className="payment-card" key={item.aluno_id}>
                  <div className="payment-card-top">
                    <div className="payment-avatar">
                      {item.aluno_nome?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                      <strong>{item.aluno_nome}</strong>
                      <span>Vence dia {item.dia_vencimento}</span>
                    </div>

                    <span
                      className={`payment-status ${getStatusClass(
                        item.status_calculado,
                      )}`}
                    >
                      {getStatusLabel(item.status_calculado)}
                    </span>
                  </div>

                  <div className="payment-details">
                    <div>
                      <Wallet size={16} />
                      {formatMoney(item.valor || item.valor_mensalidade)}
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirWhatsApp(item.telefone)}
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </button>
                  </div>

                  {item.status_calculado === "PAGO" && (
                    <div className="payment-paid-info">
                      <ReceiptText size={16} />
                      <span>
                        Pago via {item.forma_pagamento || "não informado"}
                      </span>

                      {item.comprovante_url && (
                        <a
                          href={`${API_URL}${item.comprovante_url}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver comprovante
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    className="register-payment-button"
                    type="button"
                    onClick={() => abrirModalPagamento(item)}
                  >
                    <CreditCard size={18} />
                    {item.status_calculado === "PAGO"
                      ? "Editar pagamento"
                      : "Registrar pagamento"}
                  </button>
                </article>
              ))
            )}
          </section>
        )}

        {modalAberto && mensalidadeSelecionada && (
          <div className="payment-modal-backdrop">
            <div className="payment-modal">
              <div className="payment-modal-header">
                <div>
                  <h2>Registrar pagamento</h2>
                  <p>{mensalidadeSelecionada.aluno_nome}</p>
                </div>

                <button type="button" onClick={fecharModal}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={registrarPagamento} className="payment-form">
                <label>Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />

                <label>Forma de pagamento</label>
                <div className="payment-methods">
                  <button
                    type="button"
                    className={formaPagamento === "DINHEIRO" ? "selected" : ""}
                    onClick={() => {
                      setFormaPagamento("DINHEIRO");
                      setErro("");
                    }}
                  >
                    Dinheiro
                  </button>

                  <button
                    type="button"
                    className={formaPagamento === "PIX" ? "selected" : ""}
                    onClick={() => setFormaPagamento("PIX")}
                  >
                    PIX
                  </button>
                </div>

                {formaPagamento === "PIX" && (
                  <>
                    <label>Comprovante PIX</label>

                    {comprovanteUrl ? (
                      <div className="current-receipt">
                        <ReceiptText size={18} />
                        <span>Comprovante já vinculado</span>
                        <button
                          type="button"
                          onClick={() => setComprovanteUrl("")}
                        >
                          Trocar
                        </button>
                      </div>
                    ) : (
                      <label className="upload-box">
                        <Upload size={22} />
                        <span>
                          {arquivo ? arquivo.name : "Selecionar comprovante"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setArquivo(e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </>
                )}

                <label>Observação</label>
                <textarea
                  rows="3"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Observação do pagamento..."
                />

                {erro && <div className="login-error">{erro}</div>}

                <button
                  className="save-payment-button"
                  type="submit"
                  disabled={salvando}
                >
                  <CheckCircle2 size={20} />
                  {salvando ? "Salvando..." : "Confirmar pagamento"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Mensalidades.propTypes = {
  onVoltar: PropTypes.func.isRequired,
  filtroInicial: PropTypes.string,
  alunoPagamentoIdInicial: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
};

export default Mensalidades;
