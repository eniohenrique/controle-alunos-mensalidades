import {
  ArrowLeft,
  Building2,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import PropTypes from "prop-types";

function Perfil({ usuario, onVoltar, onLogout }) {
  return (
    <div className="app-page">
      <div className="app-shell perfil-shell">
        <header className="form-header">
          <button type="button" onClick={onVoltar}>
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1>Perfil</h1>
            <p>Dados da conta e configurações</p>
          </div>
        </header>

        <section className="perfil-main-card">
          <div className="perfil-avatar">
            {usuario?.nome?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <strong>{usuario?.nome}</strong>
          <span>{usuario?.empresa_nome}</span>
        </section>

        <section className="perfil-info-list">
          <div className="perfil-info-item">
            <div>
              <UserRound size={21} />
            </div>

            <span>
              <small>Nome</small>
              <strong>{usuario?.nome}</strong>
            </span>
          </div>

          <div className="perfil-info-item">
            <div>
              <Mail size={21} />
            </div>

            <span>
              <small>E-mail</small>
              <strong>{usuario?.email}</strong>
            </span>
          </div>

          <div className="perfil-info-item">
            <div>
              <Building2 size={21} />
            </div>

            <span>
              <small>Empresa</small>
              <strong>{usuario?.empresa_nome || "Não informado"}</strong>
            </span>
          </div>

          <div className="perfil-info-item">
            <div>
              <ShieldCheck size={21} />
            </div>

            <span>
              <small>Acesso</small>
              <strong>{usuario?.role}</strong>
            </span>
          </div>
        </section>

        <section className="perfil-version-card">
          <WalletCards size={34} />

          <div>
            <strong>Controle de Alunos e Mensalidades</strong>
            <p>
              Sistema criado para controlar alunos, pagamentos, vencimentos e
              mensalidades atrasadas.
            </p>
          </div>
        </section>

        <button
          className="perfil-logout-button"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={20} />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

Perfil.propTypes = {
  usuario: PropTypes.object.isRequired,
  onVoltar: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Perfil;
