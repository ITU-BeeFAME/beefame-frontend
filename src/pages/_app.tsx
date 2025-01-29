// Remove if react-quill is not used
import 'react-quill/dist/quill.snow.css';
// Remove if react-draft-wysiwyg is not used
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// Remove if simplebar is not used
import 'simplebar-react/dist/simplebar.min.css';
// Remove if mapbox is not used
import 'mapbox-gl/dist/mapbox-gl.css';

import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import type { EmotionCache } from '@emotion/react';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import 'src/global.css';

import { SplashScreen } from 'src/components/splash-screen';
import { Toaster } from 'src/components/toaster';

import { useNprogress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { createEmotionCache } from 'src/utils/create-emotion-cache';
import { useEffect, useState } from 'react';

const clientSideEmotionCache = createEmotionCache();

export interface CustomAppProps extends AppProps {
  Component: NextPage;
  emotionCache?: EmotionCache;
}

const CustomApp = (props: CustomAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(true);
  const theme = createTheme({
    colorPreset: 'blue',
    contrast: 'normal',
    direction: 'ltr',
    paletteMode: 'light',
    responsiveFontSizes: true,
  });
  useNprogress();

  useEffect(() => {
    setShowSplashScreen(false);
  }, []);

  useNprogress();

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Bee Fair ITU</title>
        <meta
          name="viewport"
          content="initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showSplashScreen ? <SplashScreen /> : <>{getLayout(<Component {...pageProps} />)}</>}
        <Toaster />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default CustomApp;
