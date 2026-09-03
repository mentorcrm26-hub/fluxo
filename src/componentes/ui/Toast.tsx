'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastItem {
  id: string;
  tipo: 'sucesso' | 'erro' | 'info' | 'alerta';
  mensagem: string;
  detalhe?: string;
}

interface ToastContextTipo {
  toast: (mensagem: string, tipo?: 'sucesso' | 'erro' | 'info' | 'alerta', detalhe?: string) => void;
  sucesso: (mensagem: string, detalhe?: string) => void;
  erro: (mensagem: string, detalhe?: string) => void;
}

const ToastContext = createContext<ToastContextTipo>({
  toast: () => {},
  sucesso: () => {},
  erro: () => {},
});

export function ProvedorToast({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removerToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (mensagem: string, tipo: 'sucesso' | 'erro' | 'info' | 'alerta' = 'info', detalhe?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setToasts((prev) => [...prev, { id, tipo, mensagem, detalhe }]);

      setTimeout(() => {
        removerToast(id);
      }, 4000);
    },
    [removerToast]
  );

  const sucesso = useCallback((msg: string, det?: string) => toast(msg, 'sucesso', det), [toast]);
  const erro = useCallback((msg: string, det?: string) => toast(msg, 'erro', det), [toast]);

  return (
    <ToastContext.Provider value={{ toast, sucesso, erro }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 md:px-0"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const icones = {
            sucesso: <CheckCircle2 className="w-5 h-5 text-sucesso flex-shrink-0" />,
            erro: <AlertCircle className="w-5 h-5 text-perigo flex-shrink-0" />,
            alerta: <AlertCircle className="w-5 h-5 text-alerta flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-info flex-shrink-0" />,
          };

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-m bg-superficie border shadow-2 transition-all duration-320',
                t.tipo === 'sucesso' && 'border-sucesso/30',
                t.tipo === 'erro' && 'border-perigo/30',
                t.tipo === 'alerta' && 'border-alerta/30',
                t.tipo === 'info' && 'border-borda',
                'animate-in slide-in-from-bottom-4'
              )}
            >
              {icones[t.tipo]}
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium text-texto">{t.mensagem}</p>
                {t.detalhe && <p className="text-xs text-texto-2">{t.detalhe}</p>}
              </div>
              <button
                type="button"
                onClick={() => removerToast(t.id)}
                className="text-texto-3 hover:text-texto transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
