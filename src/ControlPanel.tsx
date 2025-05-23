import { useState, useEffect, useRef } from 'react';
import ROSLIB from 'roslib';

function ControlPanel() {
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const ros = useRef<ROSLIB.Ros | null>(null);
  const neckCommandTopic = useRef<ROSLIB.Topic | null>(null);

  useEffect(() => {
    ros.current = new ROSLIB.Ros({
      url: 'ws://localhost:9090', // Default rosbridge server URL
    });

    ros.current.on('connection', () => {
      console.log('Connected to websocket server.');
      setIsConnected(true);
      // Setup the publisher for the neck command
      neckCommandTopic.current = new ROSLIB.Topic({
        ros: ros.current!,
        name: '/neck_controller/command',
        messageType: 'std_msgs/Float64MultiArray',
      });
    });

    ros.current.on('error', (error) => {
      console.error('Error connecting to websocket server: ', error);
      setIsConnected(false);
    });

    ros.current.on('close', () => {
      console.log('Connection to websocket server closed.');
      setIsConnected(false);
    });

    // Cleanup on component unmount
    return () => {
      if (ros.current && ros.current.isConnected) {
        // You might want to unadvertise the topic or just close the connection
        // if (neckCommandTopic.current) {
        //   neckCommandTopic.current.unadvertise();
        // }
        ros.current.close();
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const handlePublish = () => {
    if (!isConnected || !neckCommandTopic.current) {
      console.error('Not connected to ROS or topic not initialized.');
      return;
    }

    const command = new ROSLIB.Message({
      data: [pitch, yaw],
    });

    console.log(`Publishing neck joint command: Pitch=${pitch}, Yaw=${yaw}`);
    neckCommandTopic.current.publish(command);
  };

  return (
    <div>
      <h1>Control Panel</h1>
      <p>ROS Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <h2>Neck Joint Control</h2>
      <div>
        <label htmlFor="pitch">Pitch: </label>
        <input
          type="number"
          id="pitch"
          value={pitch}
          onChange={(e) => setPitch(parseFloat(e.target.value))}
          step="0.1"
        />
      </div>
      <div>
        <label htmlFor="yaw">Yaw: </label>
        <input
          type="number"
          id="yaw"
          value={yaw}
          onChange={(e) => setYaw(parseFloat(e.target.value))}
          step="0.1"
        />
      </div>
      <button onClick={handlePublish} disabled={!isConnected}>
        Publish Command
      </button>
      {/* Add your content here */}
    </div>
  );
}

export default ControlPanel;
