/**
 * ==============================================================================
 * REPOSITÓRIO LOCAL (CAMADA DE DADOS SIMULADA)
 * ==============================================================================
 * Este arquivo implementa a interface `Repositorio` utilizando `localStorage`
 * (chave 'fluxo:v1') e simula a latência de rede com atraso artificial (200-400ms).
 *
 * ⚠️ ATENÇÃO: NA FASE 2, ESTE ARQUIVO É O ÚNICO PONTO A SER SUBSTITUÍDO
 * pela integração com a API real (fetch / Prisma). Todos os componentes, hooks
 * e telas consomem apenas a interface `Repositorio` através de TanStack Query
 * e permanecerão 100% inalterados.
 * ==============================================================================
 */

import {
  ColunaDetectada,
  Configuracao,
  Importacao,
  LinhaImportada,
  MapeamentoColunas,
  Projeto,
  ProjetoComResumo,
  ResumoFinanceiro,
  StatusProjeto,
  Tarefa,
} from './tipos';
import { Repositorio } from './repositorio';
import { DadosArmazenamento, gerarDadosIniciais } from './seed';
import { calcularRecebimentoPrevisto, derivarStatusRecebimento, diasAte } from '../prazo';
import { obterHojeISO } from '../datas';
import { traduzirDescricaoParaPtBr } from '../traducao/tradutor';
import { calcularMinhaParteCentavos } from '../dinheiro';

const CHAVE_STORAGE = 'fluxo:v1';

function simularLatencia(): Promise<void> {
  const ms = Math.floor(Math.random() * 200) + 200; // 200 a 400ms
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function carregarDados(): DadosArmazenamento {
  if (typeof window === 'undefined') {
    return gerarDadosIniciais();
  }

  try {
    const raw = localStorage.getItem(CHAVE_STORAGE);
    if (!raw) {
      const iniciais = gerarDadosIniciais();
      salvarDados(iniciais);
      return iniciais;
    }
    return JSON.parse(raw);
  } catch (erro) {
    console.error('Erro ao ler localStorage, reinicializando com seed:', erro);
    const iniciais = gerarDadosIniciais();
    salvarDados(iniciais);
    return iniciais;
  }
}

function salvarDados(dados: DadosArmazenamento): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
  } catch (erro) {
    console.error('Erro ao salvar no localStorage:', erro);
  }
}

function clonar<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function enriquecerProjeto(projeto: Projeto, todasTarefas: Tarefa[]): ProjetoComResumo {
  const tarefasDoProjeto = todasTarefas.filter((t) => t.projetoId === projeto.id);
  const totalTarefas = tarefasDoProjeto.length;
  const tarefasConcluidas = tarefasDoProjeto.filter((t) => t.status === 'concluida').length;
  const progresso = totalTarefas === 0 ? 0 : Math.round((tarefasConcluidas / totalTarefas) * 100);

  const statusRecebimento = derivarStatusRecebimento(projeto);
  const diasAteRecebimento = projeto.recebimentoPrevistoPara
    ? diasAte(projeto.recebimentoPrevistoPara)
    : null;

  return {
    ...clonar(projeto),
    porcentagem: typeof projeto.porcentagem === 'number' ? projeto.porcentagem : 45,
    totalTarefas,
    tarefasConcluidas,
    progresso,
    statusRecebimento,
    diasAteRecebimento,
  };
}

class RepositorioLocalImpl implements Repositorio {
  async listarProjetos(filtro?: {
    status?: StatusProjeto | 'todos';
    busca?: string;
    ordem?: 'recentes' | 'prazo' | 'valor' | 'progresso';
  }): Promise<ProjetoComResumo[]> {
    await simularLatencia();
    const dados = carregarDados();
    let projetos = dados.projetos.map((p) => enriquecerProjeto(p, dados.tarefas));

    if (filtro?.status && filtro.status !== 'todos') {
      projetos = projetos.filter((p) => p.status === filtro.status);
    }

    if (filtro?.busca && filtro.busca.trim() !== '') {
      const termo = filtro.busca.toLowerCase().trim();
      projetos = projetos.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          (p.cliente && p.cliente.toLowerCase().includes(termo)) ||
          (p.descricao && p.descricao.toLowerCase().includes(termo))
      );
    }

    const ordem = filtro?.ordem || 'recentes';
    projetos.sort((a, b) => {
      if (ordem === 'recentes') {
        return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
      }
      if (ordem === 'prazo') {
        return (a.dataFimPrevista || '').localeCompare(b.dataFimPrevista || '');
      }
      if (ordem === 'valor') {
        return b.valorCentavos - a.valorCentavos;
      }
      if (ordem === 'progresso') {
        return b.progresso - a.progresso;
      }
      return 0;
    });

    return projetos;
  }

  async obterProjeto(id: string): Promise<ProjetoComResumo | null> {
    await simularLatencia();
    const dados = carregarDados();
    const projeto = dados.projetos.find((p) => p.id === id);
    if (!projeto) return null;
    return enriquecerProjeto(projeto, dados.tarefas);
  }

  async criarProjeto(dadosEntrada: Omit<Projeto, 'id' | 'status' | 'concluidoEm' |
    'recebimentoPrevistoPara' | 'recebidoEm' | 'valorRecebidoCentavos' |
    'criadoEm' | 'atualizadoEm'>): Promise<Projeto> {
    await simularLatencia();
    const dados = carregarDados();
    const agoraIso = new Date().toISOString();

    const novoProjeto: Projeto = {
      ...clonar(dadosEntrada),
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      porcentagem: typeof dadosEntrada.porcentagem === 'number' ? dadosEntrada.porcentagem : 45,
      status: 'em_andamento',
      concluidoEm: null,
      recebimentoPrevistoPara: null,
      recebidoEm: null,
      valorRecebidoCentavos: null,
      criadoEm: agoraIso,
      atualizadoEm: agoraIso,
    };

    dados.projetos.unshift(novoProjeto);
    salvarDados(dados);
    return clonar(novoProjeto);
  }

  async atualizarProjeto(id: string, dadosAtualizacao: Partial<Projeto>): Promise<Projeto> {
    await simularLatencia();
    const dados = carregarDados();
    const index = dados.projetos.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Projeto ${id} não encontrado`);
    }

    const projetoExistente = dados.projetos[index];
    const projetoAtualizado: Projeto = {
      ...projetoExistente,
      ...clonar(dadosAtualizacao),
      atualizadoEm: new Date().toISOString(),
    };

    dados.projetos[index] = projetoAtualizado;
    salvarDados(dados);
    return clonar(projetoAtualizado);
  }

  async excluirProjeto(id: string): Promise<void> {
    await simularLatencia();
    const dados = carregarDados();
    dados.projetos = dados.projetos.filter((p) => p.id !== id);
    dados.tarefas = dados.tarefas.filter((t) => t.projetoId !== id);
    dados.importacoes = dados.importacoes.filter((i) => i.projetoId !== id);
    dados.linhas = dados.linhas.filter((l) => l.projetoId !== id);
    salvarDados(dados);
  }

  async finalizarProjeto(id: string): Promise<Projeto> {
    await simularLatencia();
    const dados = carregarDados();
    const index = dados.projetos.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Projeto ${id} não encontrado`);

    const projeto = dados.projetos[index];
    const agora = new Date();
    const agoraIso = agora.toISOString();
    const janela = dados.configuracao?.janelaRecebimentoDias || 10;
    const previstoPara = calcularRecebimentoPrevisto(agora, janela);

    const atualizado: Projeto = {
      ...projeto,
      status: 'finalizado',
      concluidoEm: agoraIso,
      recebimentoPrevistoPara: previstoPara,
      atualizadoEm: agoraIso,
    };

    dados.projetos[index] = atualizado;
    salvarDados(dados);
    return clonar(atualizado);
  }

  async reabrirProjeto(id: string): Promise<Projeto> {
    await simularLatencia();
    const dados = carregarDados();
    const index = dados.projetos.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Projeto ${id} não encontrado`);

    const projeto = dados.projetos[index];
    if (projeto.recebidoEm !== null) {
      throw new Error('Este projeto já foi recebido. Desfaça o recebimento antes de reabrir.');
    }

    const agoraIso = new Date().toISOString();
    const atualizado: Projeto = {
      ...projeto,
      status: 'em_andamento',
      concluidoEm: null,
      recebimentoPrevistoPara: null,
      atualizadoEm: agoraIso,
    };

    dados.projetos[index] = atualizado;
    salvarDados(dados);
    return clonar(atualizado);
  }

  async receberProjeto(id: string, recebidoEm: string): Promise<Projeto> {
    await simularLatencia();
    const dados = carregarDados();
    const index = dados.projetos.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Projeto ${id} não encontrado`);

    const projeto = dados.projetos[index];
    const agoraIso = new Date().toISOString();
    const atualizado: Projeto = {
      ...projeto,
      recebidoEm: recebidoEm || obterHojeISO(),
      valorRecebidoCentavos: projeto.valorCentavos,
      atualizadoEm: agoraIso,
    };

    dados.projetos[index] = atualizado;
    salvarDados(dados);
    return clonar(atualizado);
  }

  async listarTarefas(projetoId: string): Promise<Tarefa[]> {
    await simularLatencia();
    const dados = carregarDados();
    const tarefas = dados.tarefas.filter((t) => t.projetoId === projetoId);
    return clonar(tarefas.sort((a, b) => a.ordem - b.ordem));
  }

  async criarTarefa(projetoId: string, dadosEntrada: { titulo: string; tituloTraduzido?: string | null; observacoes?: string; prazo?: string }): Promise<Tarefa> {
    await simularLatencia();
    const dados = carregarDados();
    const tarefasDoProjeto = dados.tarefas.filter((t) => t.projetoId === projetoId);
    const proximaOrdem = tarefasDoProjeto.length > 0
      ? Math.max(...tarefasDoProjeto.map((t) => t.ordem)) + 1
      : 1;

    const tituloTraduzido = dadosEntrada.tituloTraduzido !== undefined
      ? dadosEntrada.tituloTraduzido
      : traduzirDescricaoParaPtBr(dadosEntrada.titulo);

    const novaTarefa: Tarefa = {
      id: `tar-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projetoId,
      titulo: dadosEntrada.titulo,
      tituloTraduzido: tituloTraduzido || null,
      observacoes: dadosEntrada.observacoes || null,
      status: 'a_fazer',
      prazo: dadosEntrada.prazo || null,
      ordem: proximaOrdem,
      linhaOrigemId: null,
      concluidaEm: null,
      criadoEm: new Date().toISOString(),
    };

    dados.tarefas.push(novaTarefa);
    salvarDados(dados);
    return clonar(novaTarefa);
  }

  async atualizarTarefa(id: string, dadosAtualizacao: Partial<Tarefa>): Promise<Tarefa> {
    await simularLatencia();
    const dados = carregarDados();
    const index = dados.tarefas.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Tarefa ${id} não encontrada`);

    const tarefaExistente = dados.tarefas[index];
    let concluidaEm = tarefaExistente.concluidaEm;

    if (dadosAtualizacao.status !== undefined) {
      if (dadosAtualizacao.status === 'concluida' && tarefaExistente.status !== 'concluida') {
        concluidaEm = new Date().toISOString();
      } else if (dadosAtualizacao.status !== 'concluida') {
        concluidaEm = null;
      }
    }

    const tarefaAtualizada: Tarefa = {
      ...tarefaExistente,
      ...clonar(dadosAtualizacao),
      concluidaEm,
    };

    dados.tarefas[index] = tarefaAtualizada;
    salvarDados(dados);
    return clonar(tarefaAtualizada);
  }

  async excluirTarefa(id: string): Promise<void> {
    await simularLatencia();
    const dados = carregarDados();
    dados.tarefas = dados.tarefas.filter((t) => t.id !== id);
    salvarDados(dados);
  }

  async concluirTarefas(ids: string[]): Promise<void> {
    await simularLatencia();
    const dados = carregarDados();
    const agoraIso = new Date().toISOString();
    const setIds = new Set(ids);

    dados.tarefas = dados.tarefas.map((t) => {
      if (setIds.has(t.id)) {
        return {
          ...t,
          status: 'concluida',
          concluidaEm: agoraIso,
        };
      }
      return t;
    });

    salvarDados(dados);
  }

  async listarImportacoes(projetoId: string): Promise<Importacao[]> {
    await simularLatencia();
    const dados = carregarDados();
    const imps = dados.importacoes.filter((i) => i.projetoId === projetoId);
    return clonar(imps);
  }

  async listarLinhas(projetoId: string): Promise<LinhaImportada[]> {
    await simularLatencia();
    const dados = carregarDados();
    const linhas = dados.linhas.filter((l) => l.projetoId === projetoId);
    return clonar(linhas);
  }

  async criarImportacao(projetoId: string, payload: {
    nomeArquivo: string;
    tamanhoBytes: number;
    totalPaginas: number;
    colunasDetectadas: ColunaDetectada[];
    colunasEscolhidas: number[];
    mapeamento: MapeamentoColunas;
    linhaCabecalho: number;
    linhas: Record<string, string>[];
  }): Promise<{ importacao: Importacao; tarefasCriadas: number }> {
    await simularLatencia();
    const dados = carregarDados();
    const importacaoId = `imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const agoraIso = new Date().toISOString();

    const importacao: Importacao = {
      id: importacaoId,
      projetoId,
      nomeArquivo: payload.nomeArquivo,
      tamanhoBytes: payload.tamanhoBytes,
      totalPaginas: payload.totalPaginas,
      colunasDetectadas: clonar(payload.colunasDetectadas),
      colunasEscolhidas: clonar(payload.colunasEscolhidas),
      mapeamento: clonar(payload.mapeamento),
      linhaCabecalho: payload.linhaCabecalho,
      totalLinhas: payload.linhas.length,
      criadoEm: agoraIso,
    };

    const nomeColunaTitulo = payload.colunasDetectadas.find((c) => c.indice === payload.mapeamento.titulo)?.nome || '';
    const nomeColunaPrazo = payload.mapeamento.prazo !== null
      ? payload.colunasDetectadas.find((c) => c.indice === payload.mapeamento.prazo)?.nome
      : null;
    const nomeColunaObs = payload.mapeamento.observacoes !== null
      ? payload.colunasDetectadas.find((c) => c.indice === payload.mapeamento.observacoes)?.nome
      : null;

    const tarefasExistentes = dados.tarefas.filter((t) => t.projetoId === projetoId);
    let ordemAtual = tarefasExistentes.length > 0 ? Math.max(...tarefasExistentes.map((t) => t.ordem)) + 1 : 1;

    const novasLinhas: LinhaImportada[] = [];
    const novasTarefas: Tarefa[] = [];

    payload.linhas.forEach((linhaDados, i) => {
      const linhaId = `lin-${Date.now()}-${i + 1}`;
      const tarefaId = `tar-${Date.now()}-${i + 1}`;
      const titulo = linhaDados[nomeColunaTitulo] || `Item importado #${i + 1}`;
      const tituloTraduzido = linhaDados['Tradução'] || linhaDados['tituloTraduzido'] || traduzirDescricaoParaPtBr(titulo);
      const observacao = nomeColunaObs ? linhaDados[nomeColunaObs] || null : null;
      let prazo: string | null = null;

      if (nomeColunaPrazo && linhaDados[nomeColunaPrazo]) {
        const strPrazo = linhaDados[nomeColunaPrazo].trim();
        // Se vier como dd/mm/yyyy
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(strPrazo)) {
          const [d, m, y] = strPrazo.split('/');
          prazo = `${y}-${m}-${d}`;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(strPrazo)) {
          prazo = strPrazo;
        }
      }

      novasLinhas.push({
        id: linhaId,
        importacaoId,
        projetoId,
        numeroLinha: i + 1,
        dados: linhaDados,
        tarefaId,
      });

      novasTarefas.push({
        id: tarefaId,
        projetoId,
        titulo,
        tituloTraduzido: tituloTraduzido || null,
        observacoes: observacao,
        status: 'a_fazer',
        prazo,
        ordem: ordemAtual++,
        linhaOrigemId: linhaId,
        concluidaEm: null,
        criadoEm: agoraIso,
      });
    });

    dados.importacoes.push(importacao);
    dados.linhas.push(...novasLinhas);
    dados.tarefas.push(...novasTarefas);
    salvarDados(dados);

    return {
      importacao: clonar(importacao),
      tarefasCriadas: novasTarefas.length,
    };
  }

  async excluirImportacao(id: string): Promise<void> {
    await simularLatencia();
    const dados = carregarDados();
    dados.importacoes = dados.importacoes.filter((i) => i.id !== id);
    dados.linhas = dados.linhas.filter((l) => l.importacaoId !== id);
    salvarDados(dados);
  }

  async obterResumoFinanceiro(): Promise<ResumoFinanceiro> {
    await simularLatencia();
    const dados = carregarDados();
    const projetosComResumo = dados.projetos.map((p) => enriquecerProjeto(p, dados.tarefas));

    let aReceberCentavos = 0;
    let aReceberQuantidade = 0;
    let recebidoNoMesCentavos = 0;
    let recebidoNoMesQuantidade = 0;
    let atrasadoCentavos = 0;
    let atrasadoQuantidade = 0;
    let emExecucaoCentavos = 0;
    let emExecucaoQuantidade = 0;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    projetosComResumo.forEach((p) => {
      const porcentagem = typeof p.porcentagem === 'number' ? p.porcentagem : 45;
      const minhaParte = calcularMinhaParteCentavos(p.valorCentavos, porcentagem);

      if (p.status === 'em_andamento') {
        emExecucaoCentavos += minhaParte;
        emExecucaoQuantidade += 1;
      }

      if (p.statusRecebimento === 'a_receber') {
        aReceberCentavos += minhaParte;
        aReceberQuantidade += 1;
      } else if (p.statusRecebimento === 'atrasado') {
        atrasadoCentavos += minhaParte;
        atrasadoQuantidade += 1;
        // Projetos atrasados também constam como valores a receber
        aReceberCentavos += minhaParte;
        aReceberQuantidade += 1;
      } else if (p.statusRecebimento === 'recebido' && p.recebidoEm) {
        try {
          const dataReceb = new Date(p.recebidoEm);
          if (dataReceb.getMonth() === mesAtual && dataReceb.getFullYear() === anoAtual) {
            const valorRecebido = p.valorRecebidoCentavos || p.valorCentavos;
            recebidoNoMesCentavos += calcularMinhaParteCentavos(valorRecebido, porcentagem);
            recebidoNoMesQuantidade += 1;
          }
        } catch {
          // caso a data falhe
        }
      }
    });

    return {
      aReceberCentavos,
      aReceberQuantidade,
      recebidoNoMesCentavos,
      recebidoNoMesQuantidade,
      atrasadoCentavos,
      atrasadoQuantidade,
      emExecucaoCentavos,
      emExecucaoQuantidade,
    };
  }

  async listarRecebimentos(): Promise<ProjetoComResumo[]> {
    await simularLatencia();
    const dados = carregarDados();
    const projetos = dados.projetos
      .filter((p) => p.status === 'finalizado' || p.recebidoEm !== null)
      .map((p) => enriquecerProjeto(p, dados.tarefas));

    // Ordenar por prazo / urgência
    projetos.sort((a, b) => {
      // Recebidos vão para o final
      if (a.statusRecebimento === 'recebido' && b.statusRecebimento !== 'recebido') return 1;
      if (a.statusRecebimento !== 'recebido' && b.statusRecebimento === 'recebido') return -1;
      // Menor dias até recebimento primeiro (atrasados com menor valor negativo vêm primeiro)
      const dA = a.diasAteRecebimento ?? 999;
      const dB = b.diasAteRecebimento ?? 999;
      return dA - dB;
    });

    return projetos;
  }

  async obterConfiguracao(): Promise<Configuracao> {
    await simularLatencia();
    const dados = carregarDados();
    return (
      dados.configuracao || {
        janelaRecebimentoDias: 10,
        moeda: 'USD',
        tema: 'escuro',
      }
    );
  }

  async salvarConfiguracao(dadosAtualizacao: Partial<Configuracao>): Promise<Configuracao> {
    await simularLatencia();
    const dados = carregarDados();
    dados.configuracao = {
      ...dados.configuracao,
      ...dadosAtualizacao,
    };
    salvarDados(dados);
    return clonar(dados.configuracao);
  }

  async restaurarDadosIniciais(): Promise<void> {
    await simularLatencia();
    const iniciais = gerarDadosIniciais();
    salvarDados(iniciais);
  }
}

export const repositorioLocal: Repositorio = new RepositorioLocalImpl();
