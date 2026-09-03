import { repositorioApi } from './repositorioApi';
import { repositorioLocal } from './repositorioLocal';
import type { Repositorio } from './repositorio';

export const repositorio: Repositorio =
  process.env.NEXT_PUBLIC_FONTE_DADOS === 'local' ? repositorioLocal : repositorioApi;

export * from './tipos';
export type { Repositorio } from './repositorio';
