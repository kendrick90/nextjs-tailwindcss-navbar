import React from 'react';
import '../styles/globals.css';
import { SocketProvider } from '../context/socketContext';

function MyApp({ Component, pageProps }) {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  );
}

export default MyApp;
