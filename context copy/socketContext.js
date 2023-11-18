//socketContext.js

import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

const socket = io('http://studio-15.local:3001');

export const SocketProvider = ({ children }) => {
  // Initialize elementStates with empty arrays
  // This is done to avoid errors when rendering the page
  const [elementStates, setElementStates] = useState({
    modes: Array(4).fill({ name: '', enabled: false, intensity: 0.0 }),
    effects: Array(4).fill({ name: '', enabled: false, intensity: 0.0 }),
    settings: Array(4).fill({ name: '', value: 0 }),
  });

  const mergeElements = (newElements) => {
    // Update the elementStates locally
    console.log('Merging new elements with the current state');
    // Spread the previous states to keep the other properties
    setElementStates((prevStates) => ({
      ...prevStates,
      ...newElements,
    }));
    console.log('Updated local elementStates');
    console.log(`New elementStates: ${JSON.stringify(elementStates)}`);

    // Emit the updated full state to the server
    socket.emit('merge_elements', elementStates);
  };

  // useEffect(() => {
  //   //empty array as second argument ensures that this effect only runs once
  //   //when the component mounts
  //   socket.emit('request_full_state');
  //   console.log('Requested full state from the server on client refresh');
  // }, []);

  useEffect(() => {
    // Request full state on connection and reconnection
    const handleConnect = () => {
      socket.emit('request_full_state');
      console.log('Requested full state from the server on server reconnection');
    };

    // Update local state when full state is received
    const handleFullState = (jsonElementStates) => {
      const states = JSON.parse(jsonElementStates);
      setElementStates(states);
      console.log('Received and updated full state from the server');
    };

    socket.on('connect', handleConnect);
    socket.on('full_state', handleFullState);

    // Clean up listeners on component unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('full_state', handleFullState);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ elementStates, socket, mergeElements }}>
      {children}
    </SocketContext.Provider>
  );
};
