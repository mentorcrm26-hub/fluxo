export const NOME_COOKIE_SESSAO = 'fluxo_sessao';
export const DURACAO_SESSAO_PADRAO_DIAS = 30;

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getSegredo(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.AUTH_SENHA ||
    'fluxo-pwa-chave-secreta-padrao-2026'
  );
}

async function getChaveCrypto(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(getSegredo());
  return await crypto.subtle.importKey(
    'raw',
    keyData as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export function comparacaoSegura(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let resultado = 0;
  for (let i = 0; i < a.length; i++) {
    resultado |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return resultado === 0;
}

export function validarCredenciais(usuarioInformado: string, senhaInformada: string): boolean {
  const usuarioEsperado = process.env.AUTH_USUARIO;
  const senhaEsperada = process.env.AUTH_SENHA;

  if (!usuarioEsperado || !senhaEsperada) {
    return false;
  }

  return (
    comparacaoSegura(usuarioInformado, usuarioEsperado) &&
    comparacaoSegura(senhaInformada, senhaEsperada)
  );
}

export interface PayloadSessao {
  usuario: string;
  exp: number; // timestamp em ms
  criadoEm: number;
}

export async function criarTokenSessao(
  usuario: string,
  diasValidade = DURACAO_SESSAO_PADRAO_DIAS
): Promise<string> {
  const agora = Date.now();
  const payload: PayloadSessao = {
    usuario,
    criadoEm: agora,
    exp: agora + diasValidade * 24 * 60 * 60 * 1000,
  };

  const enc = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadEncoded = base64UrlEncode(enc.encode(payloadJson));

  const chave = await getChaveCrypto();
  const assinaturaBuffer = await crypto.subtle.sign(
    'HMAC',
    chave,
    enc.encode(payloadEncoded) as unknown as BufferSource
  );
  const assinaturaEncoded = base64UrlEncode(assinaturaBuffer);

  return `${payloadEncoded}.${assinaturaEncoded}`;
}

export async function verificarTokenSessao(
  token: string | undefined | null
): Promise<{ valido: boolean; usuario?: string; payload?: PayloadSessao }> {
  if (!token || typeof token !== 'string') {
    return { valido: false };
  }

  const partes = token.split('.');
  if (partes.length !== 2) {
    return { valido: false };
  }

  const [payloadEncoded, assinaturaEncoded] = partes;

  try {
    const chave = await getChaveCrypto();
    const enc = new TextEncoder();
    const assinaturaBytes = base64UrlDecode(assinaturaEncoded);

    const assinaturaValida = await crypto.subtle.verify(
      'HMAC',
      chave,
      assinaturaBytes as unknown as BufferSource,
      enc.encode(payloadEncoded) as unknown as BufferSource
    );

    if (!assinaturaValida) {
      return { valido: false };
    }

    const payloadBytes = base64UrlDecode(payloadEncoded);
    const dec = new TextDecoder();
    const payloadJson = dec.decode(payloadBytes);
    const payload: PayloadSessao = JSON.parse(payloadJson);

    if (!payload.exp || Date.now() > payload.exp) {
      return { valido: false };
    }

    return {
      valido: true,
      usuario: payload.usuario,
      payload,
    };
  } catch (e) {
    return { valido: false };
  }
}
