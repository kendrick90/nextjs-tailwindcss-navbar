
// Modes.js
// Modes.js

import React, { useContext } from 'react';
import { SocketContext } from '../context/socketContext';

export default function Modes() {
  const { elementStates, updateElementState, socket } = useContext(SocketContext);

  return (
    <div>
      {/* Page bg */}
      <div className="text-white min-h-screen bg-gray-500">
        {/* Render elements based on elementStates */}
        <section className="p-10 pt-20 md:pt-32 lg:pt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {elementStates.modes && elementStates.modes.map((mode, index) => (
              <div key={`mode-${index + 1}`} className="rounded-lg p-6 bg-gray-700 shadow-lg hover:bg-gray-600 cursor-pointer max-w-xs">
                <div
                  className={`mb-4 rounded-lg ${mode.enabled ? "bg-cyan-600" : ""}`}
                  onClick={() => {
                    console.log(`Mode ${index + 1} clicked`);
                    // Toggle the enabled state of the mode
                    updateElementState('modes', { enabled: !mode.enabled }, index);
                  }}
                >
                  <h2 className="text-xl font-bold text-white text-center">{mode.name}</h2>
                </div>
                {/* Add the sliders based on elementStates.mode intensity */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={mode.intensity || 0}
                  onChange={(e) => {
                    updateElementState('modes', { intensity: parseFloat(e.target.value) }, index);
                  }}
                  className="w-full appearance-none bg-transparent rounded-full h-4 overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg, #9333ea ${(mode.intensity || 0) * 100}%, transparent ${(mode.intensity || 0) * 100}%)`,
                  }}
                />

              </div>
            ))}
          </div>
        </section>

        {/* New section for Exclusive toggle and Reset button */}
        <section className="p-10 pt-4 flex justify-center">
          <button
            className={`${elementStates.settings &&
              elementStates.settings.find((setting) => setting.name === 'modesExclusive')?.value
              ? 'bg-green-500 hover:bg-green-700'
              : 'bg-gray-500 hover:bg-gray-700'
              } text-white font-bold py-2 px-4 rounded-full mr-4`}
            onClick={() => {
              // Toggle the modeExclusive setting
              const exclusive = elementStates.settings.find((setting) => setting.name === 'modesExclusive')?.value;
              console.log('Current modesExclusive value:', exclusive);
              const newExclusive = !exclusive;
              console.log('New modesExclusive value:', newExclusive);

              // Update the setting value
              updateElementState('settings', { value: newExclusive }, elementStates.settings.findIndex((setting) => setting.name === 'modesExclusive'));
            }}
          >
            Exclusive
          </button>


          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => {
              socket.emit("reset_modes");
              console.log("Resetting modes");
            }}
          >
            Reset
          </button>

        </section>
      </div>
    </div>
  );
}
