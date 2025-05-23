import { useEffect, useState, useRef } from 'react';
import ROSLIB from 'roslib';

// Define the expected structure for sensor_msgs/BatteryState
interface RosBatteryStateMessage {
  header: {
    stamp: {
      secs: number;
      nsecs: number;
    };
    frame_id: string;
  };
  voltage: number;
  temperature: number; // Temperature in Degrees Celsius
  current: number; // Negative when discharging (A)
  charge: number; // Current charge in Ah
  capacity: number; // Capacity in Ah (last full capacity)
  design_capacity: number; // Capacity in Ah (design capacity)
  percentage: number; // Charge percentage on 0 to 1 range
  power_supply_status: number; // The charging status
  power_supply_health: number; // The battery health metric
  power_supply_technology: number; // The battery chemistry
  present: boolean; // True if the battery is present
  cell_voltage: number[];
  cell_temperature: number[];
  location: string;
  serial_number: string;
}

interface TopicInfo {
  name: string;
  messageType: string;
}

// const humanoidRobot: string = '192.168.123.4';
const createRobot: string = '10.0.0.195';

function Dashboard() {
  const [rosStatus, setRosStatus] = useState<string>('Disconnected');
  const [robotMessage, setRobotMessage] = useState<
    RosBatteryStateMessage | string
  >('No message yet'); // For /battery_state
  const rosBridgeUrl = `ws://${createRobot}:9090`;

  const [availableTopics, setAvailableTopics] = useState<TopicInfo[]>([]);
  const [selectedTopicName, setSelectedTopicName] = useState<string>('');
  const [selectedTopicMessage, setSelectedTopicMessage] = useState<any | string>(
    'Select a topic to see messages'
  );

  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const batteryStatusListenerRef = useRef<ROSLIB.Topic | null>(null);
  const dynamicTopicListenerRef = useRef<ROSLIB.Topic | null>(null);

  // Effect for ROS Connection, /battery_state listener, and fetching all topics
  useEffect(() => {
    rosRef.current = new ROSLIB.Ros({
      url: rosBridgeUrl,
    });

    const ros = rosRef.current;

    ros.on('connection', () => {
      console.log('Connected to websocket server.');
      setRosStatus('Connected');

      // Fetch all topics
      ros.getTopics(
        (topicsAndTypes: { topics: string[]; types: string[] }) => {
          console.log('Available topics:', topicsAndTypes);
          const fetchedTopics: TopicInfo[] = topicsAndTypes.topics.map(
            (name, index) => ({
              name,
              messageType: topicsAndTypes.types[index],
            })
          );
          setAvailableTopics(fetchedTopics);
        },
        (error: any) => {
          console.error('Error getting topics:', error);
          setAvailableTopics([]);
        }
      );

      // Setup /battery_state listener
      if (batteryStatusListenerRef.current) {
        batteryStatusListenerRef.current.unsubscribe();
      }
      batteryStatusListenerRef.current = new ROSLIB.Topic({
        ros: ros,
        name: '/battery_state',
        messageType: 'sensor_msgs/msg/BatteryState',
      });

      batteryStatusListenerRef.current.subscribe((message: unknown) => {
        console.log(
          'Received message on ' + batteryStatusListenerRef.current?.name + ': ',
          message
        );
        const batMsg = message as RosBatteryStateMessage;
        if (
          batMsg &&
          typeof batMsg.voltage === 'number' &&
          typeof batMsg.percentage === 'number'
        ) {
          setRobotMessage(batMsg);
        } else {
          console.warn(
            'Received /battery_state message with unexpected structure: ',
            message
          );
          setRobotMessage(
            'Received /battery_state message with unexpected structure'
          );
        }
      });
    });

    ros.on('error', (error: Error) => {
      console.error('Error connecting to websocket server: ', error);
      setRosStatus(`Error: ${error.message}`);
      setAvailableTopics([]);
    });

    ros.on('close', () => {
      console.log('Connection to websocket server closed.');
      setRosStatus('Disconnected');
      setAvailableTopics([]);
    });

    return () => {
      console.log('Cleaning up main ROS effect');
      if (batteryStatusListenerRef.current) {
        console.log(
          'Unsubscribing from ' + batteryStatusListenerRef.current.name
        );
        batteryStatusListenerRef.current.unsubscribe();
        batteryStatusListenerRef.current = null;
      }
      if (dynamicTopicListenerRef.current) {
        console.log(
          'Unsubscribing from dynamic topic in main cleanup: ' +
            dynamicTopicListenerRef.current.name
        );
        dynamicTopicListenerRef.current.unsubscribe();
        dynamicTopicListenerRef.current = null;
      }
      if (rosRef.current) {
        console.log('Closing ROS connection.');
        rosRef.current.close();
        rosRef.current = null;
      }
      setRosStatus('Disconnected');
    };
  }, [rosBridgeUrl]); // Re-run if rosBridgeUrl changes

  // Effect for subscribing to the dynamically selected topic
  useEffect(() => {
    if (rosStatus !== 'Connected' || !selectedTopicName || !rosRef.current) {
      if (dynamicTopicListenerRef.current) {
        console.log(
          'Unsubscribing from old dynamic topic: ' +
            dynamicTopicListenerRef.current.name
        );
        dynamicTopicListenerRef.current.unsubscribe();
        dynamicTopicListenerRef.current = null;
      }
      if (selectedTopicName) { // Only reset message if a topic was selected
         setSelectedTopicMessage(`Connect to ROS and select a topic to see messages. Current status: ${rosStatus}`);
      } else {
         setSelectedTopicMessage('Select a topic to see messages');
      }
      return;
    }

    const topicInfo = availableTopics.find(
      (t) => t.name === selectedTopicName
    );

    if (!topicInfo) {
      setSelectedTopicMessage(
        `Topic info for ${selectedTopicName} not found.`
      );
      if (dynamicTopicListenerRef.current) {
        dynamicTopicListenerRef.current.unsubscribe();
        dynamicTopicListenerRef.current = null;
      }
      return;
    }

    // Unsubscribe from previous dynamic listener if any
    if (dynamicTopicListenerRef.current) {
      console.log(
        'Unsubscribing from old dynamic topic: ' +
          dynamicTopicListenerRef.current.name
      );
      dynamicTopicListenerRef.current.unsubscribe();
    }

    console.log(
      `Subscribing to dynamic topic: ${topicInfo.name} (${topicInfo.messageType})`
    );
    dynamicTopicListenerRef.current = new ROSLIB.Topic({
      ros: rosRef.current,
      name: topicInfo.name,
      messageType: topicInfo.messageType,
    });

    dynamicTopicListenerRef.current.subscribe((message: unknown) => {
      console.log(`Received message on ${topicInfo.name}: `, message);
      setSelectedTopicMessage(message);
    });

    setSelectedTopicMessage(
      `Subscribed to ${topicInfo.name}. Waiting for messages...`
    );

    return () => {
      if (dynamicTopicListenerRef.current) {
        console.log(
          'Unsubscribing from dynamic topic: ' +
            dynamicTopicListenerRef.current.name
        );
        dynamicTopicListenerRef.current.unsubscribe();
        dynamicTopicListenerRef.current = null;
      }
    };
  }, [selectedTopicName, availableTopics, rosStatus]);

  const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopicName(event.target.value);
  };

  return (
    <div className='rounded-lg bg-white p-6 shadow-md'>
      <h1 className='mb-4 text-3xl font-bold text-gray-800'>Robot Dashboard</h1>

      <div className='mb-6 rounded-md border border-gray-200 bg-gray-50 p-4'>
        <h2 className='mb-2 text-xl font-semibold text-gray-700'>
          ROS Connection Status
        </h2>
        <p
          className={`text-lg ${
            rosStatus === 'Connected' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {rosStatus}
        </p>
        {rosStatus !== 'Connected' && rosStatus !== 'Disconnected' && (
          <p className='mt-1 text-sm text-gray-500'>
            Attempting to connect to: {rosBridgeUrl}
          </p>
        )}
      </div>

      <div className='mb-6 rounded-md border border-gray-200 bg-gray-50 p-4'>
        <h2 className='mb-2 text-xl font-semibold text-gray-700'>
          Battery Status (/battery_state)
        </h2>
        {typeof robotMessage === 'string' ? (
          <p className='text-lg text-gray-600 italic'>{robotMessage}</p>
        ) : (
          <div>
            <p className='text-lg text-gray-700'>
              Voltage:{' '}
              <span className='font-semibold'>
                {robotMessage.voltage.toFixed(2)} V
              </span>
            </p>
            <p className='text-lg text-gray-700'>
              Percentage:{' '}
              <span className='font-semibold'>
                {(robotMessage.percentage * 100).toFixed(1)}%
              </span>
            </p>
            <p className='text-lg text-gray-700'>
              Temperature:{' '}
              <span className='font-semibold'>
                {robotMessage.temperature?.toFixed(1)} °C 
              </span> {/* Added optional chaining for temperature */}
            </p>
          </div>
        )}
      </div>

      <div className='rounded-md border border-gray-200 bg-gray-50 p-4'>
        <h2 className='mb-2 text-xl font-semibold text-gray-700'>
          Topic Explorer
        </h2>
        <div className='mb-4'>
          <label
            htmlFor='topic-select'
            className='block text-sm font-medium text-gray-700'
          >
            Select a Topic:
          </label>
          <select
            id='topic-select'
            value={selectedTopicName}
            onChange={handleTopicChange}
            className='mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            disabled={rosStatus !== 'Connected' || availableTopics.length === 0}
          >
            <option value=''>
              {rosStatus !== 'Connected' ? 'Connect to ROS to see topics' : 
               availableTopics.length === 0 && rosStatus === 'Connected' ? 'No topics found' : '-- Select a Topic --'}
            </option>
            {availableTopics.map((topic) => (
              <option key={topic.name} value={topic.name}>
                {topic.name} ({topic.messageType})
              </option>
            ))}
          </select>
        </div>
        <div>
          <h3 className='text-lg font-medium text-gray-700'>
            Messages from {selectedTopicName || 'selected topic'}:
          </h3>
          <pre className='mt-2 h-60 overflow-auto rounded-md bg-gray-100 p-3 text-sm'>
            {typeof selectedTopicMessage === 'string'
              ? selectedTopicMessage
              : JSON.stringify(selectedTopicMessage, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
