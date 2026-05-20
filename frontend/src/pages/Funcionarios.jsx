import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Edit,
  Mail,
  MessageCircle,
  Plus,
  Save,
  UserCheck,
  UserRound,
  UserX,
  X,
} from "lucide-react";
import PropTypes from "prop-types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Funcionarios({ onVoltar }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [funcionarioEdicao, setFuncionarioEdicao] = useState(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    ativo: true,
  });

  async function carregarFuncionarios() {
    try {
      setCarregando(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/api/funcionarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFuncionarios(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function abrirNovoFuncionario() {
    setFuncionarioEdicao(null);
    setErro("");
    setForm({
      nome: "",
      telefone: "",
      email: "",
      ativo: true,
    });
    setModalAberto(true);
  }

  function abrirEditarFuncionario(funcionario) {
    setFuncionarioEdicao(funcionario);
    setErro("");
    setForm({
      nome: funcionario.nome || "",
      telefone: funcionario.telefone || "",
      email: funcionario.email || "",
      ativo: funcionario.ativo === undefined ? true : funcionario.ativo,
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setFuncionarioEdicao(null);
    setErro("");
  }

  function abrirWhatsApp(telefone) {
    if (!telefone) return;

    const numero = String(telefone).replace(/\D/g, "");

    if (!numero) return;

    window.open(`https://wa.me/55${numero}`, "_blank");
  }

  function abrirEmail(email) {
    if (!email) return;

    const emailLimpo = String(email).trim();

    if (!emailLimpo) return;

    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      emailLimpo,
    )}`;

    window.open(url, "_blank");
  }

  async function copiarTexto(texto) {
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(String(texto));
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  }

  async function salvarFuncionario(e) {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do funcionário.");
      return;
    }

    try {
      setSalvando(true);

      const token = localStorage.getItem("token");

      const payload = {
        ...form,
      };

      if (funcionarioEdicao?.id) {
        await axios.put(
          `${API_URL}/api/funcionarios/${funcionarioEdicao.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.post(`${API_URL}/api/funcionarios`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      fecharModal();
      await carregarFuncionarios();
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao salvar funcionário.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="app-page">
      <div className="app-shell alunos-shell">
        <header className="form-header">
          <button type="button" onClick={onVoltar}>
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1>Funcionários</h1>
            <p>Cadastre e gerencie os funcionários</p>
          </div>
        </header>

        <section className="alunos-top-card">
          <div>
            <UserRound size={28} />
          </div>

          <span>
            <strong>{funcionarios.length}</strong>
            <small>funcionários cadastrados</small>
          </span>

          <button type="button" onClick={abrirNovoFuncionario}>
            <Plus size={20} />
          </button>
        </section>

        {carregando ? (
          <div className="loading-card">Carregando funcionários...</div>
        ) : (
          <section className="students-list">
            {funcionarios.length === 0 ? (
              <div className="empty-card">Nenhum funcionário cadastrado.</div>
            ) : (
              funcionarios.map((funcionario) => (
                <article className="student-card" key={funcionario.id}>
                  <div className="student-card-header">
                    <div className="student-avatar">
                      {funcionario.nome?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                      <strong>{funcionario.nome}</strong>

                      <span className="employee-email-line">
                        {funcionario.email || "Sem e-mail"}

                        {funcionario.email && (
                          <button
                            type="button"
                            className="copy-email-button"
                            onClick={() => copiarTexto(funcionario.email)}
                            title="Copiar e-mail"
                          >
                            <Copy size={14} />
                          </button>
                        )}
                      </span>
                    </div>

                    <div
                      className={`student-status ${
                        funcionario.ativo ? "active" : "inactive"
                      }`}
                    >
                      {funcionario.ativo ? (
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
                    <div className="employee-contact-info">
                      <UserRound size={17} />
                      <span>{funcionario.telefone || "Sem telefone"}</span>

                      {funcionario.telefone && (
                        <button
                          type="button"
                          className="copy-contact-button"
                          onClick={() => copiarTexto(funcionario.telefone)}
                          title="Copiar telefone"
                        >
                          <Copy size={15} />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="employee-whatsapp-button"
                      onClick={() => abrirWhatsApp(funcionario.telefone)}
                      disabled={!funcionario.telefone}
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </button>
                  </div>

                  <div className="student-actions">
                    <button
                      type="button"
                      className="edit-student-button"
                      onClick={() => abrirEditarFuncionario(funcionario)}
                    >
                      <Edit size={18} />
                      Editar
                    </button>

                    <button
                      type="button"
                      className="edit-student-button"
                      onClick={() => abrirEmail(funcionario.email)}
                      disabled={!funcionario.email}
                    >
                      <Mail size={18} />
                      E-mail
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {modalAberto && (
          <div className="payment-modal-backdrop">
            <div className="payment-modal">
              <div className="payment-modal-header">
                <div>
                  <h2>
                    {funcionarioEdicao
                      ? "Editar funcionário"
                      : "Cadastrar funcionário"}
                  </h2>
                  <p>Dados do funcionário</p>
                </div>

                <button type="button" onClick={fecharModal}>
                  <X size={22} />
                </button>
              </div>

              <form className="payment-form" onSubmit={salvarFuncionario}>
                <label>Nome</label>
                <input
                  value={form.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  placeholder="Ex: João Silva"
                />

                <label>Telefone</label>
                <input
                  value={form.telefone}
                  onChange={(e) => atualizarCampo("telefone", e.target.value)}
                  placeholder="(19) 99999-9999"
                />

                <label>E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => atualizarCampo("email", e.target.value)}
                  placeholder="funcionario@email.com"
                />

                <button
                  className={`active-toggle ${form.ativo ? "active" : ""}`}
                  type="button"
                  onClick={() => atualizarCampo("ativo", !form.ativo)}
                >
                  <CheckCircle2 size={20} />
                  {form.ativo ? "Funcionário ativo" : "Funcionário inativo"}
                </button>

                {erro && <div className="login-error">{erro}</div>}

                <button
                  className="save-payment-button"
                  type="submit"
                  disabled={salvando}
                >
                  <Save size={20} />
                  {salvando ? "Salvando..." : "Salvar funcionário"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Funcionarios.propTypes = {
  onVoltar: PropTypes.func.isRequired,
};

export default Funcionarios;
