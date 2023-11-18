// socketContext.js
// socketContext.js 

import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

const socket = io('http://studio-15.local:3001');

export const SocketProvider = ({ children }) => {
  // Initialize elementStates with empty object
  const [elementStates, setElementStates] = useState({});

  const mergeElements = (newElements) => {
    // Update the elementStates locally immediately
    const updatedState = {
      ...elementStates,
      ...newElements,
    };
    setElementStates(updatedState);

    // Emit the updated states to the server
    socket.emit('merge_elements', JSON.stringify(newElements));
    console.log('Sent updated elements to the server');
    console.log(`newElements: ${JSON.stringify(updatedState)}`);
  };

  const updateElementState = (key, value, index) => {
    const updatedState = { ...elementStates };
    if (Array.isArray(updatedState[key])) {
      // If the element is an array (e.g., modes or effects)
      updatedState[key] = [...elementStates[key]];
      updatedState[key][index] = { ...updatedState[key][index], ...value };
    } else {
      // If it's not an array (e.g., settings)
      updatedState[key] = { ...updatedState[key], ...value };
    }

    // Merge the updated state into the context and emit to the server
    mergeElements(updatedState);
  };

  // Request full state on connection and reconnection
  const handleConnect = () => {
    socket.emit('request_full_state');
    console.log('Requested full state from the server on server reconnection');
  };

  // Update local state when full state is received
  const handleFullState = (jsonElementStates) => {
    const states = JSON.parse(jsonElementStates);
    console.log(`Received full state from the server: ${jsonElementStates}`);
    setElementStates(states);
  };

  // Log the updated elementStates whenever it changes
  useEffect(() => {
    console.log('elementStates updated');
    console.log(`New elementStates: ${JSON.stringify(elementStates)}`);
  }, [elementStates]);

  // Request full state on component mount
  useEffect(() => {
    // Empty array as the second argument ensures that this effect only runs once
    // when the component mounts
    socket.emit('request_full_state');
    console.log('Requested full state from the server on client refresh');
  }, []);

  // Add listeners for socket events
  useEffect(() => {
    socket.on('connect', handleConnect);
    socket.on('full_state', handleFullState);
    socket.on('merge_elements', handleFullState); // Handle merge_elements as full_state

    // Clean up listeners on component unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('full_state', handleFullState);
      socket.off('merge_elements', handleFullState);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ elementStates, socket, updateElementState }}>
      {children}
    </SocketContext.Provider>
  );
};
