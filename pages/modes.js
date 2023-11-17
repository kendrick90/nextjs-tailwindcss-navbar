import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import NavBar from '../components/NavBar';

const socket = io('http://localhost:3001'); // Adjust URL if necessary

export default function Modes() {
  const numberOfElements = 16;
  const elements = Array.from({ length: numberOfElements }, (_, i) => i + 1);

  const [modes, setModes] = useState(Array(numberOfElements).fill(0)); // Initialize with 0's or appropriate default values
  const [modeSliders, setModeSliders] = useState(Array(numberOfElements).fill(0)); // Initialize with 0.5 or appropriate default values
  const [exclusiveToggle, setExclusiveToggle] = useState(false); // Exclusive toggle state


  useEffect(() => {
    socket.emit('request_initial_state');

    socket.on('initial_state', (jsonElementStates) => {
      const elementStates = JSON.parse(jsonElementStates); // Parse JSON string
      setModes(elementStates.modes);
      setModeSliders(elementStates.modeSliders);
      console.log('Initial State:', elementStates);
    });

    socket.on('element_updated', (jsonUpdatedStates) => {
      const updatedStates = JSON.parse(jsonUpdatedStates); // Parse JSON string
      setModes(updatedStates.modes);
      setModeSliders(updatedStates.modeSliders);
      console.log('Updated State:', updatedStates);
    });

    return () => {
      socket.off('initial_state');
      socket.off('element_updated');
    };
  }, []);

  const handleButtonClick = (index) => {
    // Toggle the value for the clicked element (switch between 0 and 1)
    const newValue = modes[index] === 0 ? 1 : 0;

    // Update the state locally
    const updatedModes = [...modes];
    updatedModes[index] = newValue;

    // Apply exclusive toggle logic
    if (exclusiveToggle) {
      // If exclusive toggle is on, turn off all other buttons except the current one
      for (let i = 0; i < updatedModes.length; i++) {
        if (i !== index) {
          updatedModes[i] = 0;
        }
      }
    }

    setModes(updatedModes);

    // Send update to server
    socket.emit('update_element', { id: index + 1, category: 'modes', value: newValue });
    console.log(`Sent update for mode ${index + 1} with value ${newValue}`);
  };

  const handleSliderChange = (index, value) => {
    const updatedSliders = [...modeSliders];
    updatedSliders[index] = value;
    setModeSliders(updatedSliders);

    // Send update to server
    socket.emit('update_element', { id: index + 1, category: 'modeSliders', value });
    console.log(`Sent update for slider ${index + 1} with value ${value}`);
  };

  // Toggle exclusive mode behavior
  const handleExclusiveToggle = () => {
    setExclusiveToggle(!exclusiveToggle);
  };

  const handleResetButtonClick = () => {
    // Reset all mode buttons to 0
    const resetModes = Array(numberOfElements).fill(0);

    // Reset all sliders to 0.5 (or your desired default value)
    const resetSliders = Array(numberOfElements).fill(0.5);

    // Update state to reset values
    setModes(resetModes);
    setModeSliders(resetSliders);

    // Send updates to server to reset all elements
    for (let i = 0; i < numberOfElements; i++) {
      socket.emit('update_element', { id: i + 1, category: 'modes', value: 0 });
      socket.emit('update_element', { id: i + 1, category: 'modeSliders', value: 0.5 });
    }

    console.log('Reset all modes and sliders to default values');
  };


  return (
    <div>
      <NavBar />
      {/* Page bg */}
      <div className="text-white h-screen bg-gray-500">
        <section className="p-10 pt-20 md:pt-32 lg:pt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {elements.map((num, index) => (
              <div key={num} id={`mode-${num}`} className="rounded-lg p-6 bg-gray-700 shadow-lg hover:bg-gray-600 cursor-pointer max-w-xs">
                <div
                  className={`mb-4 ${modes[index] ? "bg-cyan-600" : ""}`}
                  onClick={() => handleButtonClick(index)}
                >
                  <h2 className="text-xl font-bold text-white text-center">Mode {num}</h2>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={modeSliders[index]}
                  onChange={(e) => handleSliderChange(index, parseFloat(e.target.value))}
                  className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[24px] [&::-webkit-slider-thumb]:w-[24px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300"
                  style={{
                    background: `linear-gradient(90deg, #9333ea ${(modeSliders[index]) * 100}%, transparent ${(modeSliders[index]) * 100}%)`,
                    borderRadius: '9999px', // Apply a large border radius to create a rounded effect
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* New section for Exclusive toggle and Reset button */}
        <section className="p-10 pt-4 flex justify-center">
          <button
            className={`bg-${exclusiveToggle ? 'green' : 'gray'}-500 hover:bg-${exclusiveToggle ? 'green' : 'gray'}-700 text-white font-bold py-2 px-4 rounded-full mr-4`}
            onClick={handleExclusiveToggle}
          >
            Exclusive
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={handleResetButtonClick}
          >
            Reset
          </button>
        </section>
      </div>
    </div>
  );

}