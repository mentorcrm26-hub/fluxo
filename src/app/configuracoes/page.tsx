'use client';

import React, { useState, useEffect } from 'react';
import { useConfiguracao, useSalvarConfiguracao, useRestaurarDadosIniciais } from '@/lib/dados/hooks';
import { AlternadorTema } from '@/componentes/layout/AlternadorTema';
import { Botao } from '@/componentes/ui/Botao';
import { Input } from '@/componentes/ui/Input';
import { useToast } from '@/componentes/ui/Toast';
import { RotateCcw, Save, Palette, Clock, Database, UploadCloud } from 'lucide-react';

export default function ConfiguracoesPage() {
  const { sucesso, erro } = useToast();
  const { data: config, isLoading } = useConfiguracao();
  const salvarConfiguracao = useSalvarConfiguracao();
  const restaurarDados = useRestaurarDadosIniciais();

  const [janelaDias, setJanelaDias] = useState(10);
  const [migrando, setMigrando] = useState(false);
  const [dadosLocaisExistem, setDadosLocaisExistem] = useState(false);

  useEffect(() => {
    if (config) {
      setJanelaDias(config.janelaRecebimentoDias || 10);
    }
  }, [config]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('fluxo:v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.projetos && parsed.projetos.length > 0) {
            setDadosLocaisExistem(true);
          }
        }
      } catch {}
    }
  }, []);

  const handleSalvarJanela = async () => {
    try {
      await salvarConfiguracao.mutateAsync({
        janelaRecebimentoDias: Number(janelaDias) || 10,
      });
      sucesso('Configurações salvas com sucesso.');
    } catch (err: any) {
      erro('Erro ao salvar configurações.', err.message);
    }
  };

  const handleMigrarParaServidor = async () => {
    try {
      setMigrando(true);
      const raw = localStorage.getItem('fluxo:v1');
      if (!raw) {
        erro('Nenhum dado local encontrado para migrar.');
        return;
      }
      const dados = JSON.parse(raw);

      const res = await fetch('/api/migracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.erro?.mensagem || 'Falha ao migrar dados para o servidor.');
      }

      sucesso(
        'Migração concluída com sucesso!',
        `${json.projetos} projetos, ${json.tarefas} tarefas e ${json.importacoes} importações enviados.`
      );
      setDadosLocaisExistem(false);
    } catch (err: any) {
      erro('Erro na migração.', err.message);
    } finally {
      setMigrando(false);
    }
  };

  const handleRestaurarSeed = async () => {
    if (
      window.confirm(
        'Tem certeza que deseja restaurar os 6 projetos de exemplo originais? Todos os dados atuais serão substituídos pelo estado inicial do seed.'
      )
    ) {
      try {
        await restaurarDados.mutateAsync();
        sucesso('Dados de exemplo restaurados com sucesso.');
      } catch (err: any) {
        erro('Erro ao restaurar dados.', err.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-superficie-2 rounded-p w-48" />
        <div className="h-40 bg-superficie-2 rounded-g w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-texto tracking-tight">
          Configurações
        </h1>
        <p className="text-sm text-texto-2 mt-0.5">
          Preferências visuais, regras de negócio e gerenciamento de dados do Fluxo.
        </p>
      </div>

      {/* Seção 1: Tema da Interface */}
      <div className="p-6 rounded-g bg-superficie border border-borda space-y-4 shadow-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-m bg-superficie-2 border border-borda flex items-center justify-center text-acento-claro">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-texto">Aparência e Tema</h2>
            <p className="text-xs text-texto-2">
              Escolha entre o tema escuro padrão, claro ou acompanhe a preferência do seu sistema.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <AlternadorTema />
        </div>
      </div>

      {/* Seção 2: Janela de Recebimento */}
      <div className="p-6 rounded-g bg-superficie border border-borda space-y-4 shadow-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-m bg-superficie-2 border border-borda flex items-center justify-center text-sucesso">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-texto">Janela de Recebimento Padrão</h2>
            <p className="text-xs text-texto-2">
              Quantidade de dias corridos calculados após a finalização de cada projeto.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 pt-2">
          <div className="w-full sm:w-48">
            <Input
              rotulo="Dias Corridos"
              type="number"
              min={1}
              max={90}
              value={janelaDias}
              onChange={(e) => setJanelaDias(parseInt(e.target.value, 10))}
            />
          </div>

          <Botao
            variante="primario"
            carregando={salvarConfiguracao.isPending}
            onClick={handleSalvarJanela}
            iconeEsquerda={<Save className="w-4 h-4" />}
          >
            Salvar Regra
          </Botao>
        </div>

        <p className="text-xs text-texto-3">
          Projetos finalizados a partir de agora receberão este prazo limite por padrão (ex: 10 dias).
        </p>
      </div>

      {/* Seção 3: Migração de Dados Locais para Servidor */}
      {dadosLocaisExistem && (
        <div className="p-6 rounded-g bg-superficie border border-acento/40 space-y-4 shadow-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-m bg-acento/10 border border-acento/30 flex items-center justify-center text-acento">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-texto">Migração de Dados para o Servidor</h2>
              <p className="text-xs text-texto-2">
                Foram detectados projetos salvos localmente neste navegador. Envie-os para o banco de dados oficial do servidor.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Botao
              variante="primario"
              carregando={migrando}
              onClick={handleMigrarParaServidor}
              iconeEsquerda={<UploadCloud className="w-4 h-4" />}
            >
              Enviar dados locais para o servidor
            </Botao>
          </div>
        </div>
      )}

      {/* Seção 4: Dados de Exemplo (Desenvolvimento) */}
      <div className="p-6 rounded-g bg-superficie border border-borda space-y-4 shadow-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-m bg-superficie-2 border border-borda flex items-center justify-center text-alerta">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-texto">Dados de Demonstração</h2>
            <p className="text-xs text-texto-2">
              Restaura os 6 projetos com dados reais e estados financeiros variados no modo local.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Botao
            variante="secundario"
            carregando={restaurarDados.isPending}
            onClick={handleRestaurarSeed}
            iconeEsquerda={<RotateCcw className="w-4 h-4 text-alerta" />}
          >
            Restaurar Dados de Exemplo (Seed)
          </Botao>
        </div>
      </div>
    </div>
  );
}
