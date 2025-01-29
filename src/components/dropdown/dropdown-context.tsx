import type { MouseEvent } from 'react';
import { createContext } from 'react';

const noop = (...args: any[]): any => {};

interface ContextValue {
  anchorEl: HTMLElement | null;
  onMenuEnter: (event: MouseEvent<HTMLElement>) => void;
  onMenuLeave: (event: MouseEvent<HTMLElement>) => void;
  onTriggerEnter: (event: MouseEvent<HTMLElement>) => void;
  onTriggerLeave: (event: MouseEvent<HTMLElement>) => void;
  open: boolean;
}

export const DropdownContext = createContext<ContextValue>({
  anchorEl: null,
  onMenuEnter: noop,
  onMenuLeave: noop,
  onTriggerEnter: noop,
  onTriggerLeave: noop,
  open: false,
});
