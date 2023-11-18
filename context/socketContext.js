//socketContext.js

import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

const socket = io('http://studio-15.local:3001');

export const SocketProvider = ({ children }) => {
  // Initialize elementStates with empty arrays
  const [elementStates, setElementStates] = useState({
    modes: Array(4).fill({ name: '', enabled: false, intensity: 1 }),
    effects: Array(4).fill({ name: '', enabled: false, intensity: 0.0 }),
    settings: Array(4).fill({ name: '', value: 0 }),
  });

  useEffect(() => {
    // Function to request full state from the server
    const requestFullState = () => {
      socket.emit('request_full_state');
      console.log('Requested full state from the server');
    };

    // Listen for 'connect' event to trigger full state request on reconnection
    socket.on('connect', () => {
      requestFullState();
    });

    // Listen for full state from the server
    socket.on('full_state', (jsonElementStates) => {
      const states = JSON.parse(jsonElementStates);
      createAndUpdateElementStates(states);
      console.log('Received and updated full state from the server');
    });

    // Listen for element updates from the server
    socket.on('element_updated', (updatedElement) => {
      const { category, id, value } = updatedElement;
      setElementStates((prevStates) => {
        const updatedStates = { ...prevStates };
        if (category in updatedStates && id > 0 && id <= updatedStates[category].length) {
          updatedStates[category][id - 1] = value;
          return updatedStates;
        }
        return prevStates;
      });
      console.log(`Updated element: category=${category}, id=${id}, value=${value}`);
    });

    // Clean up listeners
    return () => {
      socket.off('connect');
      socket.off('full_state');
      socket.off('element_updated');
    };
  }, []);

  // Helper function to create and update element states
  const createAndUpdateElementStates = (states) => {
    console.log(`Creating and updating element states: ${JSON.stringify(states)}`);
    setElementStates((prevStates) => ({
      ...prevStates,
      modes: states.modes,
      effects: states.effects,
      settings: states.settings,
    }));
    console.log('Created and updated element states');
    console.log(`New element States: ${JSON.stringify(elementStates)}`);
  };

  // Helper function to update element states
  const updateElement = (category, index, value) => {
    setElementStates((prevStates) => {
      const updatedStates = { ...prevStates };

      if (category === 'modes' || category === 'effects') {
        updatedStates[category][index] = {
          ...updatedStates[category][index],
          enabled: value !== undefined ? value : !updatedStates[category][index].enabled,
        };
      } else if (category === 'settings') {
        updatedStates[category][index] = {
          ...updatedStates[category][index],
          value: value !== undefined ? value : updatedStates[category][index].value,
        };
      }

      return updatedStates;
    });
    socket.emit('update_element', { id: index + 1, category, value: value !== undefined ? value : !elementStates[category][index].enabled });
    console.log(`Updated element: category=${category}, index=${index}, value=${value}`);
  };

  const resetModes = () => {
    socket.emit('reset_modes');
    console.log('Reset modes');
  };

  const resetEffects = () => {
    socket.emit('reset_effects');
    console.log('Reset effects');
  };

  return (
    <SocketContext.Provider value={{ elementStates, updateElement, resetModes, resetEffects, socket }}>
      {children}
    </SocketContext.Provider>
  );
};
