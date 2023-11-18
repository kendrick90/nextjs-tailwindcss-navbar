//page.js
"use client"

import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";

const categories = ["mode", "effect", "setting"];
const elementMap = {
  mode: {
    slider: "modeSliders",
    button: "modeButtons"
  },
  effect: {
    slider: "effectSliders",
    button: "effectButtons"
  },
  setting: {
    slider: "settingSliders",
    button: "settingButtons"
  },
};


function Slider({ category, id, value, handleSliderChange }) {
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={value}
      onChange={(e) => handleSliderChange(category, id, e.target.value)}
    />
  );
}

function Button({ category, id, state, handleButtonClick }) {
  return (
    <button onClick={() => handleButtonClick(category, id)}>
      {state ? "ON" : "OFF"}
    </button>
  );
}

function ColorPicker({ id, value, handleColorChange }) {
  return (
    <input
      type="color"
      id={id}
      value={value}
      onChange={(e) => handleColorChange(id, e.target.value)}
    />
  );
}


function App() {
  const [socket, setSocket] = useState(null);
  const [elementStates, setElementStates] = useState({
    modeSliders: {
      modeSlider1: 0,
      modeSlider2: 0,
    },
    modeButtons: {
      modeButton0: false,
      modeButton1: false,
      modeButton2: false,
    },
    effectSliders: {
      effectSlider1: 0,
      effectSlider2: 0,
    },
    effectButtons: {
      effectButton1: false,
      effectButton2: false,
    },
    settingSliders: {
      settingSlider1: 0,
      settingSlider2: 0,
    },
    settingButtons: {
      settingButton1: false,
      settingButton2: false,
    },
    xyPad: { x: 0.5, y: 0.5 },
    colors: {
      color1: '#ffffff',
      color2: '#ffffff',
      color3: '#ffffff',
      color4: '#ffffff'
    },
  });

  const xyPadRef = useRef(null);
  const [text, setText] = useState("");
  const [textReceived, setTextReceived] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const updateXYPadPosition = (e) => {
    const rect = xyPadRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    console.log("X:", x, "Y:", y);

    setElementStates(prevState => ({
      ...prevState,
      xyPad: { x, y }
    }));
    socket.emit("update_element", { type: "xyPad", id: "xyPad", value: { x, y } });
  };

  const handleXYPadMove = (e) => {
    if (!isMouseDown) return;
    e.stopPropagation();
    updateXYPadPosition(e);
  };

  const handleXYPadDown = (e) => {
    setIsMouseDown(true);
    e.stopPropagation();
    document.addEventListener("mousemove", handleXYPadMove);
    document.addEventListener("mouseup", handleXYPadUpGlobal);
    updateXYPadPosition(e);
  };

  const handleXYPadUp = () => {
    setIsMouseDown(false);
  };

  const handleXYPadUpGlobal = () => {
    setIsMouseDown(false);
    document.removeEventListener("mousemove", handleXYPadMove);
    document.removeEventListener("mouseup", handleXYPadUpGlobal);
  };



  const renderControls = (category) => {
    const sliders = elementStates[`${category}Sliders`]
      ? Object.keys(elementStates[`${category}Sliders`]).map((id) => (
        <Slider
          key={id}
          category={category}
          id={id.replace(`${category}Slider`, '')}
          value={elementStates[`${category}Sliders`][id]}
          handleSliderChange={handleSliderChange}
        />
      ))
      : []

    const buttons = elementStates[`${category}Buttons`]
      ? Object.keys(elementStates[`${category}Buttons`]).map((id) => (
        <Button
          key={id}
          category={category}
          id={id.replace(`${category}Button`, '')}
          state={elementStates[`${category}Buttons`][id]}
          handleButtonClick={handleButtonClick}
        />
      ))
      : []

    return (
      <div key={category}>
        <h1>{category.charAt(0).toUpperCase() + category.slice(1)}</h1>
        {sliders}
        {buttons}
      </div>
    );
  };



  useEffect(() => {
    const newSocket = io.connect("http://localhost:3001");
    setSocket(newSocket);

    // When the socket connects
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    // When the socket disconnects
    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("initial_state", (data) => {
      setElementStates(data);
    });

    socket.on("element_updated", (data) => {
      if (data.id === 'xyPad') {
        setElementStates(prevState => ({ ...prevState, xyPad: data.value }));
      } else {
        const category = categories.find(cat => data.id.includes(cat));
        const elementType = data.type === "slider" ? "slider" : "button"; // Note: You may need more conditions here for other types
        const stateKey = elementMap[category][elementType];

        setElementStates(prevState => ({
          ...prevState,
          [stateKey]: {
            ...prevState[stateKey],
            [data.id]: data.value
          }
        }));
      }
    });




    socket.on("receive_text", (data) => {
      setTextReceived(data.text);
    });

    return () => {
      socket.off("initial_state");
      socket.off("element_updated");
      socket.off("receive_text");
    };
  }, [socket]);

  const handleSliderChange = (category, id, value) => {
    const data = {
      type: "slider",
      id: `${category}Slider${id}`,
      value: value,
    };
    setElementStates(prev => ({
      ...prev,
      [`${category}Sliders`]: {
        ...prev[`${category}Sliders`],
        [`${category}Slider${id}`]: value,
      },
    }));
    socket.emit("update_element", data);
  };

  const handleButtonClick = (category, id) => {
    const newValue = !elementStates[`${category}Buttons`][`${category}Button${id}`];
    const data = {
      type: "button",
      id: `${category}Button${id}`,
      value: newValue,
    };
    setElementStates(prev => ({
      ...prev,
      [`${category}Buttons`]: {
        ...prev[`${category}Buttons`],
        [`${category}Button${id}`]: newValue,
      },
    }));
    socket.emit("update_element", data);
  };

  const handleColorChange = (id, value) => {
    const data = {
      type: "color",
      id: id,
      value: value,
    };
    setElementStates(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [id]: value,
      },
    }));
    socket.emit("update_element", data);
  };

  const sendText = () => {
    socket.emit("send_text", { text });
  };



  return (
    <div className="App">
      <h1>XY Pad</h1>

      <div
        ref={xyPadRef}
        className="xy-pad"
        onMouseDown={handleXYPadDown}
        onMouseUp={handleXYPadUp}
        onMouseLeave={handleXYPadUp}
        onMouseMove={handleXYPadMove}
      >
        <div
          className="xy-pad-point"
          style={{
            left: `${elementStates.xyPad.x * 100}%`,
            top: `${elementStates.xyPad.y * 100}%`
          }}
        ></div>
      </div>

      {categories.map((category) => renderControls(category))}

      <div className="color-section">
        <h1>Color Pickers</h1>
        <ColorPicker id="color1" value={elementStates.colors.color1} handleColorChange={handleColorChange} />
        <ColorPicker id="color2" value={elementStates.colors.color2} handleColorChange={handleColorChange} />
        <ColorPicker id="color3" value={elementStates.colors.color3} handleColorChange={handleColorChange} />
        <ColorPicker id="color4" value={elementStates.colors.color4} handleColorChange={handleColorChange} />
      </div>


      <h1>Send Text</h1>
      <input
        placeholder="Text..."
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
      <button onClick={sendText}> Send Text</button>
      <h1>Received Text</h1>
      {textReceived}
      <div className="connection-status" style={{ backgroundColor: isConnected ? 'green' : 'gray' }}></div>
    </div>
  );
}

export default App;
