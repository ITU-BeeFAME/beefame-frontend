import type { FC, MouseEvent, ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { DropdownContext } from './dropdown-context';

interface DropdownProps {
  children: ReactNode[];
  delay?: number;
}

export const Dropdown: FC<DropdownProps> = (props) => {
  const { children, delay = 50 } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const cleanupRef = useRef<any>(null);

  const handleTriggerEnter = useCallback((event: MouseEvent<HTMLElement>) => {
    clearTimeout(cleanupRef.current);
    setAnchorEl(event.currentTarget);
  }, []);

  const handleTriggerLeave = useCallback(
    (_: MouseEvent<HTMLElement>) => {
      cleanupRef.current = setTimeout(() => {
        setAnchorEl(null);
      }, delay);
    },
    [delay]
  );

  const handleMenuEnter = useCallback((_: MouseEvent<HTMLElement>) => {
    clearTimeout(cleanupRef.current);
  }, []);

  const handleMenuLeave = useCallback(
    (_: MouseEvent<HTMLElement>) => {
      cleanupRef.current = setTimeout(() => {
        setAnchorEl(null);
      }, delay);
    },
    [delay]
  );

  const open = !!anchorEl;

  return (
    <DropdownContext.Provider
      value={{
        anchorEl,
        onMenuEnter: handleMenuEnter,
        onMenuLeave: handleMenuLeave,
        onTriggerEnter: handleTriggerEnter,
        onTriggerLeave: handleTriggerLeave,
        open,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

Dropdown.propTypes = {
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  delay: PropTypes.number,
};
