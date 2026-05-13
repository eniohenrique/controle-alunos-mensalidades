import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AlunoForm from "./pages/AlunoForm";
import Alunos from "./pages/Alunos";
import Mensalidades from "./pages/Mensalidades";
import Perfil from "./pages/Perfil";
import Relatorios from "./pages/Relatorios";
import Funcionarios from "./pages/Funcionarios";
import Comissoes from "./pages/Comissoes";

function App() {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  const [tela, setTela] = useState("dashboard");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [mensalidadesConfig, setMensalidadesConfig] = useState({
    filtroInicial: "TODOS",
    alunoPagamentoIdInicial: null,
  });

  function handleLogin(usuarioLogado) {
    setUsuario(usuarioLogado);
    setTela("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setTela("dashboard");
    setAlunoSelecionado(null);
  }

  function abrirNovoAluno() {
    setAlunoSelecionado(null);
    setTela("aluno-form");
  }

  function abrirEditarAluno(aluno) {
    setAlunoSelecionado(aluno);
    setTela("aluno-form");
  }

  function abrirMensalidades(config = {}) {
    setMensalidadesConfig({
      filtroInicial: config.filtroInicial || "TODOS",
      alunoPagamentoIdInicial: config.alunoPagamentoIdInicial || null,
    });

    setTela("mensalidades");
  }

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  if (tela === "aluno-form") {
    return (
      <AlunoForm
        alunoEdicao={alunoSelecionado}
        onVoltar={() => setTela("alunos")}
        onSalvo={() => {
          setAlunoSelecionado(null);
          setTela("alunos");
        }}
      />
    );
  }

  if (tela === "alunos") {
    return (
      <Alunos
        onVoltar={() => setTela("dashboard")}
        onNovoAluno={abrirNovoAluno}
        onEditarAluno={abrirEditarAluno}
      />
    );
  }

  if (tela === "mensalidades") {
    return (
      <Mensalidades
        onVoltar={() => setTela("dashboard")}
        filtroInicial={mensalidadesConfig.filtroInicial}
        alunoPagamentoIdInicial={mensalidadesConfig.alunoPagamentoIdInicial}
      />
    );
  }

  if (tela === "perfil") {
    return (
      <Perfil
        usuario={usuario}
        onVoltar={() => setTela("dashboard")}
        onLogout={handleLogout}
      />
    );
  }

  if (tela === "relatorios") {
    return <Relatorios onVoltar={() => setTela("dashboard")} />;
  }

  if (tela === "funcionarios") {
    return <Funcionarios onVoltar={() => setTela("dashboard")} />;
  }

  if (tela === "comissoes") {
    return <Comissoes onVoltar={() => setTela("dashboard")} />;
  }

  return (
    <Dashboard
      usuario={usuario}
      onLogout={handleLogout}
      onNovoAluno={abrirNovoAluno}
      onAbrirAlunos={() => setTela("alunos")}
      onAbrirMensalidades={abrirMensalidades}
      onAbrirPerfil={() => setTela("perfil")}
      onAbrirRelatorios={() => setTela("relatorios")}
      onAbrirFuncionarios={() => setTela("funcionarios")}
      onAbrirComissoes={() => setTela("comissoes")}
    />
  );
}

export default App;
