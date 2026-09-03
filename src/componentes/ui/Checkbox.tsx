import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: React.ReactNode;
  descricao?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  label,
  descricao,
  className,
}: CheckboxProps) {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'inline-flex items-start gap-3 select-none cursor-pointer group',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-5 h-5 rounded-p border transition-all duration-120 flex items-center justify-center',
            checked
              ? 'bg-acento border-acento text-white shadow-1'
              : 'bg-superficie-2 border-borda group-hover:border-texto-3',
            'group-focus-within:ring-2 group-focus-within:ring-acento group-focus-within:ring-offset-2 group-focus-within:ring-offset-fundo'
          )}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-50 duration-120" />}
        </div>
      </div>
      {(label || descricao) && (
        <div className="space-y-0.5">
          {label && <span className="text-sm font-medium text-texto block">{label}</span>}
          {descricao && <span className="text-xs text-texto-2 block">{descricao}</span>}
        </div>
      )}
    </label>
  );
}
