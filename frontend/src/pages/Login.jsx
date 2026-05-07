import { useState } from "react";
import {
  GraduationCap,
  Lock,
  Mail,
  WalletCards,
  Bell,
  ReceiptText,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import PropTypes from "prop-types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        senha,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));

      onLogin(response.data.usuario);
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao fazer login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-watermark login-watermark-1">
        <WalletCards size={90} />
      </div>

      <div className="login-watermark login-watermark-2">
        <ReceiptText size={80} />
      </div>

      <div className="login-watermark login-watermark-3">
        <BarChart3 size={85} />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <GraduationCap size={34} />
        </div>

        <h1>Controle de Alunos</h1>
        <h2>e Mensalidades</h2>

        <p className="login-subtitle">
          Organize seus alunos, pagamentos e mensalidades em um só lugar.
        </p>

        <div className="login-mini-card">
          <Bell size={20} />
          <span>Receba alertas de mensalidades atrasadas</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>E-mail</label>
          <div className="input-group">
            <Mail size={19} />
            <input
              type="email"
              value={email}
              placeholder="Digite seu e-mail"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label>Senha</label>
          <div className="input-group">
            <Lock size={19} />
            <input
              type="password"
              value={senha}
              placeholder="Digite sua senha"
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && <div className="login-error">{erro}</div>}

          <button disabled={carregando} type="submit" className="login-button">
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
