// SocketContext.js
import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

const socket = io('http://studio-15.local:3001');

export const SocketProvider = ({ children }) => {
  const [elementStates, setElementStates] = useState({});

  useEffect(() => {
    socket.emit('request_full_state');

    socket.on('full_state', (jsonElementStates) => {
      const states = JSON.parse(jsonElementStates);
      setElementStates(states);
    });

    socket.on('element_updated', (updatedElement) => {
      const { category, id, value } = updatedElement;
      setElementStates(prevStates => {
        const updatedStates = { ...prevStates };
        if (category in updatedStates && id > 0 && id <= updatedStates[category].length) {
          updatedStates[category][id - 1] = value;
          return updatedStates;
        }
        return prevStates;
      });
    });

    return () => {
      socket.off('full_state');
      socket.off('element_updated');
    };
  }, []);

  const updateElement = (category, index, value) => {
    const newValue = value !== undefined ? value : !elementStates[category][index];
    setElementStates(prevStates => {
      const updatedStates = { ...prevStates };
      updatedStates[category][index] = newValue;
      return updatedStates;
    });

    socket.emit('update_element', { id: index + 1, category, value: newValue });
  };

  const resetModes = () => {
    socket.emit('reset_modes');
  };

  const resetEffects = () => {
    socket.emit('reset_effects');
  };

  return (
    <SocketContext.Provider value={{ elementStates, updateElement, resetModes, resetEffects }}>
      {children}
    </SocketContext.Provider>
  );
};
