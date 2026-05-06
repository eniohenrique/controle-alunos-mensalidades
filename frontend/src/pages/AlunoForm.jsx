import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import PropTypes from "prop-types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const diasSemana = [
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
  "DOMINGO",
];

function formatDateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().split("T")[0];
}

function AlunoForm({ onVoltar, onSalvo, alunoEdicao }) {
  const editando = Boolean(alunoEdicao?.id);

  const [form, setForm] = useState({
    nome: "",
    data_nascimento: "",
    cpf: "",
    telefone: "",
    dia_vencimento: "",
    valor_mensalidade: "",
    ativo: true,
    observacao: "",
  });

  const [horarios, setHorarios] = useState([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (alunoEdicao) {
      setForm({
        nome: alunoEdicao.nome || "",
        data_nascimento: formatDateInput(alunoEdicao.data_nascimento),
        cpf: alunoEdicao.cpf || "",
        telefone: alunoEdicao.telefone || "",
        dia_vencimento: alunoEdicao.dia_vencimento || "",
        valor_mensalidade: alunoEdicao.valor_mensalidade || "",
        ativo: alunoEdicao.ativo === undefined ? true : alunoEdicao.ativo,
        observacao: alunoEdicao.observacao || "",
      });

      setHorarios(alunoEdicao.horarios || []);
    }
  }, [alunoEdicao]);

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function toggleDia(dia) {
    const existe = horarios.find((item) => item.dia_semana === dia);

    if (existe) {
      setHorarios((prev) => prev.filter((item) => item.dia_semana !== dia));
    } else {
      setHorarios((prev) => [
        ...prev,
        {
          dia_semana: dia,
          horario: "09:00",
        },
      ]);
    }
  }

  function alterarHorario(dia, horario) {
    setHorarios((prev) =>
      prev.map((item) =>
        item.dia_semana === dia ? { ...item, horario } : item,
      ),
    );
  }

  async function salvarAluno(e) {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do aluno.");
      return;
    }

    if (!form.dia_vencimento) {
      setErro("Informe o dia de vencimento.");
      return;
    }

    try {
      setSalvando(true);

      const token = localStorage.getItem("token");

      const payload = {
        ...form,
        dia_vencimento: Number(form.dia_vencimento),
        valor_mensalidade: Number(form.valor_mensalidade || 0),
        horarios,
      };

      if (editando) {
        await axios.put(`${API_URL}/api/alunos/${alunoEdicao.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post(`${API_URL}/api/alunos`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      onSalvo();
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao salvar aluno.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="app-page">
      <div className="app-shell form-shell">
        <header className="form-header">
          <button type="button" onClick={onVoltar}>
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1>{editando ? "Editar aluno" : "Cadastrar aluno"}</h1>
            <p>
              {editando
                ? "Atualize os dados e horários do aluno"
                : "Dados do aluno e horários das aulas"}
            </p>
          </div>
        </header>

        <form className="student-form" onSubmit={salvarAluno}>
          <section className="form-section">
            <div className="form-section-title">
              <UserRound size={20} />
              <h2>Dados pessoais</h2>
            </div>

            <label>Nome completo</label>
            <input
              value={form.nome}
              onChange={(e) => atualizarCampo("nome", e.target.value)}
              placeholder="Ex: Maria Fernanda"
            />

            <label>Data de nascimento</label>
            <div className="form-input-icon">
              <CalendarDays size={18} />
              <input
                type="date"
                value={form.data_nascimento}
                onChange={(e) =>
                  atualizarCampo("data_nascimento", e.target.value)
                }
              />
            </div>

            <label>CPF</label>
            <input
              value={form.cpf}
              onChange={(e) => atualizarCampo("cpf", e.target.value)}
              placeholder="000.000.000-00"
            />

            <label>Telefone</label>
            <div className="form-input-icon">
              <Phone size={18} />
              <input
                value={form.telefone}
                onChange={(e) => atualizarCampo("telefone", e.target.value)}
                placeholder="(19) 99999-9999"
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <CreditCard size={20} />
              <h2>Mensalidade</h2>
            </div>

            <label>Dia de vencimento</label>
            <input
              type="number"
              min="1"
              max="31"
              value={form.dia_vencimento}
              onChange={(e) => atualizarCampo("dia_vencimento", e.target.value)}
              placeholder="Ex: 10"
            />

            <label>Valor mensalidade</label>
            <input
              type="number"
              step="0.01"
              value={form.valor_mensalidade}
              onChange={(e) =>
                atualizarCampo("valor_mensalidade", e.target.value)
              }
              placeholder="Ex: 150.00"
            />

            <button
              className={`active-toggle ${form.ativo ? "active" : ""}`}
              type="button"
              onClick={() => atualizarCampo("ativo", !form.ativo)}
            >
              <CheckCircle2 size={20} />
              {form.ativo ? "Aluno ativo" : "Aluno inativo"}
            </button>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <Clock3 size={20} />
              <h2>Dias e horários</h2>
            </div>

            <div className="week-days">
              {diasSemana.map((dia) => {
                const selecionado = horarios.find(
                  (item) => item.dia_semana === dia,
                );

                return (
                  <div
                    className={`day-card ${selecionado ? "selected" : ""}`}
                    key={dia}
                  >
                    <button type="button" onClick={() => toggleDia(dia)}>
                      {dia.slice(0, 3)}
                    </button>

                    {selecionado && (
                      <input
                        type="time"
                        value={selecionado.horario}
                        onChange={(e) => alterarHorario(dia, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <label>Observação</label>
            <textarea
              value={form.observacao}
              onChange={(e) => atualizarCampo("observacao", e.target.value)}
              placeholder="Alguma observação sobre o aluno..."
              rows="3"
            />
          </section>

          {erro && <div className="login-error">{erro}</div>}

          <button className="save-button" disabled={salvando} type="submit">
            <Save size={20} />
            {salvando
              ? "Salvando..."
              : editando
                ? "Salvar alterações"
                : "Salvar aluno"}
          </button>
        </form>
      </div>
    </div>
  );
}

AlunoForm.propTypes = {
  onVoltar: PropTypes.func.isRequired,
  onSalvo: PropTypes.func.isRequired,
  alunoEdicao: PropTypes.object,
};

export default AlunoForm;
