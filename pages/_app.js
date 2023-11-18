// _app.js
import React from 'react';
import { SocketProvider } from '../context/socketContext'; // Adjust the path as necessary
import '../styles/globals.css';
import NavBar from '../components/NavBar';

function MyApp({ Component, pageProps }) {
  return (
    <SocketProvider>
      <div>
        <NavBar />
        <Component {...pageProps} />
      </div>
    </SocketProvider>
  );
}

export default MyApp;
