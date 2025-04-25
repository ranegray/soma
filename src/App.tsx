import { NavLink } from "react-router";
import { useWebSocketContext } from "./context/useWebSocketContext";

function App() {
  const { robotState, isConnected, sendMessage } = useWebSocketContext();

  console.log(robotState)

  // Function to determine color based on joint position
  const getPositionColor = (position: number, min: number, max: number) => {
    // Calculate how close we are to either limit (as a percentage of total range)
    const range = max - min;
    const normalizedPos = (position - min) / range; // 0 to 1

    // Define thresholds: <0.1 or >0.9 is close to limit, <0.2 or >0.8 is approaching
    if (normalizedPos < 0.1 || normalizedPos > 0.9) {
      return "text-red-500"; // Close to limit - red
    } else if (normalizedPos < 0.2 || normalizedPos > 0.8) {
      return "text-yellow-500"; // Approaching limit - yellow
    } else {
      return ""; // Good range - no styling
    }
  };

  const getTempColor = (temp: number) => {
    if (temp > 55) return "bg-red-100";
    if (temp > 45) return "bg-yellow-100";
    return "";
  };

  // Helper to separate arm joints from hand joints
  const isArmJoint = (name: string) => {
    const armJoints = ["shoulder", "elbow", "wrist"];
    return armJoints.some(joint => name.includes(joint));
  };

  // Helper to check if a joint is a hand/finger joint
  const isHandJoint = (name: string) => {
    const handJoints = ["thumb", "index", "middle", "ring", "pinky"];
    return handJoints.some(joint => name.includes(joint));
  };

  return (
    <>
      <div className="flex">
        <nav className="flex flex-col w-1/6 p-2 bg-slate-800 text-white">
          <h1 className="text-2xl">h1.soma</h1>
          <div>Status: {isConnected ? "Connected" : "Disconnected"}</div>
          {/* Display battery and CPU */}
          {robotState && (
            <div className="flex gap-2 w-full">
              <p>Battery: {robotState.battery}%</p>
              <p>CPU: {robotState.cpu}%</p>
              <p>Tick: {robotState.tick}</p>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2">
            <NavLink
              to="/"
              className="w-full p-2 flex justify-center rounded-md hover:bg-slate-200 hover:text-black transition-normal duration-125"
            >
              Live
            </NavLink>
            <NavLink
              to="/logging"
              className="w-full p-2 flex justify-center rounded-md hover:bg-slate-200 hover:text-black transition-normal duration-125"
            >
              Logging
            </NavLink>
            <NavLink
              to="/data-labeling"
              className="w-full p-2 flex justify-center rounded-md hover:bg-slate-200 hover:text-black transition-normal duration-125"
            >

            Labeling
            </NavLink>
            <NavLink
              to="/simulation"
              className="w-full p-2 flex justify-center rounded-md hover:bg-slate-200 hover:text-black transition-normal duration-125"
            >
              Simulation
            </NavLink>
          </div>
        </nav>


        <div className="flex gap-4">
          {/* Left Arm */}
          <div className="p-4">
            <h2 className="font-bold">Left Arm Joints</h2>
            {robotState?.joints
              .filter((joint) => joint.name.startsWith("left") && isArmJoint(joint.name))
              .map((joint) => (
                <div
                  key={joint.name}
                  className={`mt-2 p-2 ${getTempColor(joint.temperature)}`}
                >
                  <p className="font-semibold">
                    {joint.name.replace("left_", "")}
                  </p>
                  <p>
                    Position:{" "}
                    <span
                      className={getPositionColor(
                        joint.q,
                        joint.min,
                        joint.max
                      )}
                    >
                      {joint.q.toFixed(2)} rad
                    </span>{" "}
                    <span className="text-xs text-gray-500">
                      ({joint.min.toFixed(1)} to {joint.max.toFixed(1)})
                    </span>
                  </p>
                  <p>Velocity: {joint.dq.toFixed(2)} rad/s</p>
                  <p>Torque: {joint.tau_est.toFixed(2)} NM</p>
                </div>
              ))}
          </div>

          {/* Right Arm */}
          <div className="p-4">
            <h2 className="font-bold">Right Arm Joints</h2>
            {robotState?.joints
              .filter((joint) => joint.name.startsWith("right") && isArmJoint(joint.name))
              .map((joint) => (
                <div
                  key={joint.name}
                  className={`mt-2 p-2 ${getTempColor(joint.temperature)}`}
                >
                  <p className="font-semibold">
                    {joint.name.replace("right_", "")}
                  </p>
                  <p>
                    Position:{" "}
                    <span
                      className={getPositionColor(
                        joint.q,
                        joint.min,
                        joint.max
                      )}
                    >
                      {joint.q.toFixed(2)} rad
                    </span>{" "}
                    <span className="text-xs text-gray-500">
                      ({joint.min.toFixed(1)} to {joint.max.toFixed(1)})
                    </span>
                  </p>
                  <p>Velocity: {joint.dq.toFixed(2)} rad/s</p>
                  <p>Torque: {joint.tau_est.toFixed(2)} NM</p>
                </div>
              ))}
          </div>

          <div className="flex gap-4">
            {/* Left Hand */}
            <div className="p-4">
              <h2 className="font-bold">Left Hand</h2>
              <div className="flex flex-col gap-1">
                {robotState?.joints
                  .filter((joint) => joint.name.startsWith("left") && isHandJoint(joint.name))
                  .map((joint) => (
                    <div
                      key={joint.name}
                      className={`mt-2 p-2 ${getTempColor(joint.temperature)}`}
                    >
                      <p className="font-semibold">
                        {joint.name.replace("left_", "")}
                      </p>
                      <p>
                        Position: {joint.q.toFixed(2)}
                        <span className="text-xs text-gray-500">
                          ({joint.min.toFixed(1)} to {joint.max.toFixed(1)})
                        </span>
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right Hand */}
            <div className="p-4">
              <h2 className="font-bold">Right Hand</h2>
              <div className="flex flex-col gap-1">
                {robotState?.joints
                  .filter((joint) => joint.name.startsWith("right") && isHandJoint(joint.name))
                  .map((joint) => (
                    <div
                      key={joint.name}
                      className={`mt-2 p-2 ${getTempColor(joint.temperature)}`}
                    >
                      <p className="font-semibold">
                        {joint.name.replace("right_", "")}
                      </p>
                      <p>
                        Position: {joint.q.toFixed(2)}
                        <span className="text-xs text-gray-500">
                          ({joint.min.toFixed(1)} to {joint.max.toFixed(1)})
                        </span>
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
