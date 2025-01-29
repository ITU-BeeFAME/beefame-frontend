import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

import type { Settings } from 'src/types/settings';

import type { State } from './settings-context';
import { SettingsContext, initialState, defaultSettings } from './settings-context';

const STORAGE_KEY = 'app.settings';

const restoreSettings = (): Settings | null => {
  let value = null;

  try {
    const restored: string | null = window.localStorage.getItem(STORAGE_KEY);

    if (restored) {
      value = JSON.parse(restored);
    }
  } catch (err) {
    console.error(err);
    // If stored data is not a strigified JSON this will fail,
    // that's why we catch the error
  }

  return value;
};

const deleteSettings = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error(err);
  }
};

const storeSettings = (value: Record<string, any>): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (err) {
    console.error(err);
  }
};

interface SettingsProviderProps {
  children?: ReactNode;
}

export const SettingsProvider: FC<SettingsProviderProps> = (props) => {
  const { children } = props;
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    const restored = restoreSettings();

    if (restored) {
      setState((prevState) => ({
        ...prevState,
        ...restored,
        isInitialized: true,
      }));
    }
  }, []);

  const handleReset = useCallback((): void => {
    deleteSettings();
    setState((prevState) => ({
      ...prevState,
      ...defaultSettings,
    }));
  }, []);

  const handleUpdate = useCallback((settings: Settings): void => {
    setState((prevState) => {
      storeSettings({
        colorPreset: prevState.colorPreset,
        contrast: prevState.contrast,
        direction: prevState.direction,
        layout: prevState.layout,
        navColor: prevState.navColor,
        paletteMode: prevState.paletteMode,
        responsiveFontSizes: prevState.responsiveFontSizes,
        stretch: prevState.stretch,
        ...settings,
      });

      return {
        ...prevState,
        ...settings,
      };
    });
  }, []);

  const handleDrawerOpen = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      openDrawer: true,
    }));
  }, []);

  const handleDrawerClose = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      openDrawer: false,
    }));
  }, []);

  const isCustom = useMemo(() => {
    return !isEqual(defaultSettings, {
      colorPreset: state.colorPreset,
      contrast: state.contrast,
      direction: state.direction,
      layout: state.layout,
      navColor: state.navColor,
      paletteMode: state.paletteMode,
      responsiveFontSizes: state.responsiveFontSizes,
      stretch: state.stretch,
    });
  }, [state]);

  return (
    <SettingsContext.Provider
      value={{
        ...state,
        handleDrawerClose,
        handleDrawerOpen,
        handleReset,
        handleUpdate,
        isCustom,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
