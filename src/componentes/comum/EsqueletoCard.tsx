import React from 'react';

export function EsqueletoCard() {
  return (
    <div className="relative overflow-hidden rounded-g bg-superficie border border-borda p-5 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-superficie-2 rounded-p w-3/4 animate-pulse" />
          <div className="h-3.5 bg-superficie-2 rounded-p w-1/2 animate-pulse" />
        </div>
        <div className="h-6 w-20 bg-superficie-2 rounded-p animate-pulse" />
      </div>

      <div className="h-7 bg-superficie-2 rounded-p w-2/5 animate-pulse" />

      <div className="space-y-2 pt-2">
        <div className="h-2 bg-superficie-2 rounded-full w-full animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 bg-superficie-2 rounded-p w-16 animate-pulse" />
          <div className="h-3 bg-superficie-2 rounded-p w-24 animate-pulse" />
        </div>
      </div>

      <div className="pt-2 border-t border-borda flex items-center justify-between">
        <div className="h-4 bg-superficie-2 rounded-p w-28 animate-pulse" />
        <div className="h-5 bg-superficie-2 rounded-full w-32 animate-pulse" />
      </div>
    </div>
  );
}

export function EsqueletoGrade({ quantidade = 6 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: quantidade }).map((_, i) => (
        <EsqueletoCard key={i} />
      ))}
    </div>
  );
}

export function EsqueletoTabela({ linhas = 5 }: { linhas?: number }) {
  return (
    <div className="rounded-g bg-superficie border border-borda p-4 space-y-3">
      <div className="h-10 bg-superficie-2 rounded-p w-full animate-pulse mb-4" />
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="h-12 bg-superficie-2/60 rounded-p w-full animate-pulse" />
      ))}
    </div>
  );
}
