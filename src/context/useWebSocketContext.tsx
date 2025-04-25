import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types based on the data structure from your Python server
interface JointData {
  name: string;
  q: number;        // Position/angle
  dq: number;       // Velocity
  tau_est: number;  // Estimated torque
  temperature: number;
  min: number;      // Min angle
  max: number;      // Max angle
}

interface RobotState {
  joints: JointData[];
  tick: number;
  battery: number;
  cpu: number;
}

interface WebSocketContextType {
  robotState: RobotState | null;
  isConnected: boolean;
  sendMessage: (msg: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  url: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  url 
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [robotState, setRobotState] = useState<RobotState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("WebSocket Provider initializing with URL:", url);
    
    // Initialize WebSocket connection
    const newSocket = new WebSocket(url);

    // Set up event handlers
    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
    };

    newSocket.onmessage = (event) => {
      try {
        // Parse the JSON data
        const parsedData: RobotState = JSON.parse(event.data);
        
        // Update robot state with the parsed object
        setRobotState(parsedData);
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    // Save socket to state
    setSocket(newSocket);

    // Clean up the connection when component unmounts
    return () => {
      console.log("WebSocket Provider cleaning up");
      newSocket.close();
    };
  }, [url]); // Dependency on url so if it changes, the websocket reconnects

  // Function to send a message through the WebSocket
  const sendMessage = (msg: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
    } else {
      console.warn("Cannot send message, WebSocket is not connected");
    }
  };

  const value = {
    robotState,
    isConnected,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
