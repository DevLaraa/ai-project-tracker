import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, login } from '../api/auth';
import { setAccessToken } from '../utils/authStorage';
import { getApiErrorMessage } from '../utils/apiError';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const session = await login({
        email: normalizedEmail,
        password
      });

      setAccessToken(session.accessToken);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Unable to sign in. Please verify your credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_35%),linear-gradient(160deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[36px] border border-white/10 bg-white/6 p-8 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.75)] backdrop-blur xl:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
              Portfolio-ready delivery hub
            </p>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-white xl:text-5xl">
              A full-stack workspace focused on credible project execution.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              Client Project Tracker showcases a practical React, TypeScript, Express, and PostgreSQL stack
              with authentication, ownership checks, validation, and AI-assisted planning workflows.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
                <p className="text-sm font-semibold text-white">Structured backend</p>
                <p className="mt-2 text-sm text-slate-300">Layered services, repositories, and validation at the API boundary.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
                <p className="text-sm font-semibold text-white">Credible UX</p>
                <p className="mt-2 text-sm text-slate-300">Clear loading, empty, and error states with focused task management flows.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
                <p className="text-sm font-semibold text-white">AI done safely</p>
                <p className="mt-2 text-sm text-slate-300">Task generation is validated and persisted on the server, not trusted blindly from the client.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-white/10 bg-white p-8 text-slate-950 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.8)] xl:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Sign in</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Access the dashboard</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use an existing account to review projects, manage delivery tasks, and generate AI planning support.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  placeholder="engineer@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
