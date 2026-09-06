'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layers, Lock, User, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';
import { Botao } from '@/componentes/ui/Botao';
import { Input } from '@/componentes/ui/Input';
import { AlternadorTema } from '@/componentes/layout/AlternadorTema';

function FormularioLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!usuario.trim() || !senha.trim()) {
      setErro('Por favor, informe o usuário e a senha.');
      return;
    }

    try {
      setCarregando(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha, lembrar }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || 'Falha ao autenticar.');
      }

      // Redireciona para a página solicitada ou dashboard
      window.location.href = redirectUrl;
    } catch (err: any) {
      setErro(err.message || 'Credenciais inválidas. Tente novamente.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-fundo px-4 py-8 relative selection:bg-acento selection:text-white">
      {/* Botão de Tema no Canto Superior Direito */}
      <div className="w-full max-w-md flex justify-end">
        <AlternadorTema compacto />
      </div>

      {/* Card Central */}
      <div className="w-full max-w-md my-auto">
        <div className="bg-superficie border border-borda rounded-g p-6 sm:p-8 shadow-3 backdrop-blur-xl relative overflow-hidden">
          {/* Efeito sutil de iluminação */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-acento/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo e Cabeçalho */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-m bg-acento flex items-center justify-center text-white shadow-2 mb-4 animate-in zoom-in-90 duration-300">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-texto tracking-tight font-display">
              FLUXO
            </h1>
            <p className="text-xs text-texto-3 tracking-widest uppercase mt-1 font-medium">
              Workspace Pessoal
            </p>
            <p className="text-sm text-texto-2 mt-3">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <div className="mb-6 p-3.5 rounded-m bg-alerta/10 border border-alerta/30 text-alerta text-xs flex items-center gap-2.5 animate-in fade-in-50 duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-alerta flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                rotulo="Usuário"
                type="text"
                placeholder="Ex: admin"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                iconeEsquerda={<User className="w-4 h-4 text-texto-3" />}
                autoComplete="username"
                autoFocus
                required
                disabled={carregando}
              />
            </div>

            <div>
              <Input
                rotulo="Senha de Acesso"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                iconeEsquerda={<Lock className="w-4 h-4 text-texto-3" />}
                autoComplete="current-password"
                required
                disabled={carregando}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-texto-2 hover:text-texto transition-colors">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                  className="rounded border-borda bg-superficie-2 text-acento focus:ring-acento w-4 h-4 accent-acento cursor-pointer"
                />
                <span>Manter conectado (30 dias)</span>
              </label>
            </div>

            <div className="pt-2">
              <Botao
                type="submit"
                variante="primario"
                className="w-full justify-center h-11 text-sm font-medium"
                carregando={carregando}
                iconeDireita={!carregando && <ArrowRight className="w-4 h-4" />}
              >
                {carregando ? 'Autenticando...' : 'Acessar Painel'}
              </Botao>
            </div>
          </form>

          {/* Dica para PWA Mobile */}
          <div className="mt-6 pt-5 border-t border-borda/60 flex items-start gap-2.5 text-texto-3 text-[11px] leading-relaxed">
            <Smartphone className="w-4 h-4 text-acento-claro flex-shrink-0 mt-0.5" />
            <span>
              <strong>Dica no celular:</strong> Ao marcar &ldquo;Manter conectado&rdquo;, o PWA não solicitará senha novamente ao ser aberto na tela inicial.
            </span>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="text-center text-xs text-texto-3 flex items-center gap-1.5 opacity-80">
        <ShieldCheck className="w-3.5 h-3.5 text-sucesso" />
        <span>Ambiente seguro protegido por criptografia</span>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-fundo">
          <div className="w-8 h-8 border-2 border-acento border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FormularioLogin />
    </Suspense>
  );
}
