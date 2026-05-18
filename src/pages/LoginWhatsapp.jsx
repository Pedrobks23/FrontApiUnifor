import React from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { login, saveWhatsappSession } from '../services/api.js';

const logoFull = '/LOGO_UNIFOR_3_page-0001-removebg-preview.png';
const logoMark = '/images.png';

function getPhoneFromUrl() {
  return new URLSearchParams(window.location.search).get('phone');
}

function getWhatsappRedirectUrl() {
  const botNumber = import.meta.env.VITE_WHATSAPP_BOT_NUMBER;
  const message = 'Olá! Acabei de fazer login no Assistente Virtual Unifor.';

  if (!botNumber) {
    return null;
  }

  return `https://wa.me/${botNumber}?text=${encodeURIComponent(message)}`;
}

export default function LoginWhatsapp() {
  const phone = useMemo(() => getPhoneFromUrl(), []);
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [continuarConectado, setContinuarConectado] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!matricula.trim() || !senha) {
      setErro('Informe sua matrícula e senha para continuar.');
      return;
    }

    setLoading(true);

    try {
      const auth = await login({
        matricula: matricula.trim(),
        senha,
      });

      const accessToken = auth?.access_token;

      if (!accessToken) {
        throw new Error('Login realizado, mas a API não retornou o token de acesso.');
      }

      const storage = continuarConectado ? localStorage : sessionStorage;
      storage.setItem('access_token', accessToken);
      storage.setItem('token_type', auth?.token_type || 'bearer');

      if (phone) {
        await saveWhatsappSession({ accessToken, phone });
      }

      const redirectUrl = getWhatsappRedirectUrl();

      if (redirectUrl) {
        window.location.assign(redirectUrl);
      }
    } catch (error) {
      setErro(
        error?.message ||
          'Não foi possível acessar sua conta agora. Verifique os dados e tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="brand-panel" aria-label="Universidade de Fortaleza">
        <div className="brand-overlay" />
        <img className="brand-logo" src={logoFull} alt="Universidade de Fortaleza" />
        <div className="campus-frame" aria-hidden="true">
          <div className="campus-building">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="campus-dome" />
          <div className="campus-sign">Universidade de Fortaleza</div>
        </div>
        <footer className="brand-footer">
          Fundação Edson Queiroz | Universidade de Fortaleza
        </footer>
      </section>

      <section className="form-panel" aria-label="Login">
        <div className="pattern pattern-top" />
        <div className="pattern pattern-bottom" />

        <form className="login-card" onSubmit={handleSubmit}>
          <img className="card-logo" src={logoMark} alt="" aria-hidden="true" />

          <div className="card-heading">
            <h1>Acesse sua conta Unifor</h1>
            <p>Entre e utilize nossos serviços digitais em um só lugar</p>
          </div>

          {phone && (
            <div className="phone-notice" role="status">
              Vinculando login ao WhatsApp {phone}
            </div>
          )}

          {erro && (
            <div className="error-message" role="alert">
              {erro}
            </div>
          )}

          <div className="field-group">
            <label htmlFor="matricula">Matrícula</label>
            <input
              id="matricula"
              name="matricula"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              placeholder="Matrícula"
              value={matricula}
              onChange={(event) => setMatricula(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field-group">
            <label htmlFor="senha">Senha</label>
            <div className="password-field">
              <input
                id="senha"
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setMostrarSenha((value) => !value)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                disabled={loading}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-row">
            <label className="checkbox-label" htmlFor="continuar-conectado">
              <input
                id="continuar-conectado"
                type="checkbox"
                checked={continuarConectado}
                onChange={(event) => setContinuarConectado(event.target.checked)}
                disabled={loading}
              />
              <span>Continuar conectado</span>
            </label>
            <a href="https://www.unifor.br" target="_blank" rel="noreferrer">
              Esqueci minha senha
            </a>
          </div>

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="spinner" size={18} />
                Acessando
              </>
            ) : (
              'Acessar'
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
