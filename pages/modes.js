// Modes.js
import React, { useContext } from 'react';
import { SocketContext } from '../context/socketContext';

export default function Modes() {
  const { elementStates, updateElement, resetModes } = useContext(SocketContext);

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
                  className={`mb-4 rounded-lg ${mode ? "bg-cyan-600" : ""}`}
                  onClick={() => updateElement('modes', index)}
                >
                  <h2 className="text-xl font-bold text-white text-center">Mode {index + 1}</h2>
                </div>
                {/* Add the sliders based on elementStates.modeSliders */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={elementStates.modeSliders ? elementStates.modeSliders[index] : 0}
                  onChange={(e) => updateElement('modeSliders', index, parseFloat(e.target.value))}
                  className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[24px] [&::-webkit-slider-thumb]:w-[24px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300"
                  style={{
                    background: `linear-gradient(90deg, #9333ea ${(elementStates.modeSliders[index]) * 100}%, transparent ${(elementStates.modeSliders[index]) * 100}%)`,
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
            className={`${elementStates.modesExclusive && elementStates.modesExclusive[0]
              ? 'bg-green-500 hover:bg-green-700'
              : 'bg-gray-500 hover:bg-gray-700'}
              text-white font-bold py-2 px-4 rounded-full mr-4`}

            onClick={() => updateElement('modesExclusive', 0)}
          >
            Exclusive
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={resetModes}
          >
            Reset
          </button>
        </section>
      </div>
    </div>
  );
}
