import asyncio
import json
import random
import math
import time
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# CORS settings for dev access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define joint configuration from the table
JOINTS = [
    # Right Arm
    {"name": "right_shoulder_pitch", "min": -1.57, "max": 3.14},
    {"name": "right_shoulder_roll", "min": -3.4, "max": 0.38},
    {"name": "right_shoulder_yaw", "min": -2.66, "max": 3.01},
    {"name": "right_elbow_pitch", "min": -1.6, "max": 2.53},
    {"name": "right_elbow_roll", "min": -2.967, "max": 2.967},
    {"name": "right_wrist_pitch", "min": -0.471, "max": 0.349},
    {"name": "right_wrist_yaw", "min": -1.012, "max": 1.012},

    # Left Arm
    {"name": "left_shoulder_pitch", "min": -3.14, "max": 1.57},
    {"name": "left_shoulder_roll", "min": -0.38, "max": 3.4},
    {"name": "left_shoulder_yaw", "min": -3.01, "max": 2.66},
    {"name": "left_elbow_pitch", "min": -2.53, "max": 1.6},
    {"name": "left_elbow_roll", "min": -2.967, "max": 2.967},
    {"name": "left_wrist_pitch", "min": -0.471, "max": 0.349},
    {"name": "left_wrist_yaw", "min": -1.012, "max": 1.012},

    # Right Hand
    {"name": "right_thumb", "min": 0.01, "max": 1},
    {"name": "right_thumb_rotation", "min": 0.01, "max": 1},
    {"name": "right_index", "min": 0.01, "max": 1},
    {"name": "right_middle", "min": 0.01, "max": 1},
    {"name": "right_ring", "min": 0.01, "max": 1},
    {"name": "right_pinky", "min": 0.01, "max": 1},

    # Left Hand
    {"name": "left_thumb", "min": 0.01, "max": 1},
    {"name": "left_thumb_rotation", "min": 0.01, "max": 1},
    {"name": "left_index", "min": 0.01, "max": 1},
    {"name": "left_middle", "min": 0.01, "max": 1},
    {"name": "left_ring", "min": 0.01, "max": 1},
    {"name": "left_pinky", "min": 0.01, "max": 1},
]

class RobotSimulator:
    def __init__(self):
        # Initialize joint state
        self.joints_state = []
        for joint in JOINTS:
            # Start with a neutral position
            mid_position = (joint["min"] + joint["max"]) / 2
            self.joints_state.append({
                "name": joint["name"],
                "q": mid_position,  # Current position
                "dq": 0.0,  # Current velocity
                "target_q": mid_position,  # Target position
                "tau_est": 0.0,  # Torque
                "temperature": 35.0,  # Starting temperature
                "min": joint["min"],
                "max": joint["max"],
                "time_to_next_move": random.uniform(1.0, 5.0)  # Time until next movement
            })
        
        self.battery = 100.0
        self.cpu = 10.0
        self.tick = 0
        self.start_time = time.time()
        self.last_update = time.time()
        
    def update(self, dt):
        dt = max(0.001, min(dt, 0.1))  # Clamp dt to avoid extreme values

        # Update simulation time
        self.tick += 1
        current_time = time.time()
        self.last_update = current_time
        
        # Simulate battery drain (faster when CPU or joints are active)
        activity_factor = (self.cpu / 100.0) * 0.5  # CPU contribution
        joint_movement = sum(abs(j["dq"]) for j in self.joints_state) / len(self.joints_state)
        activity_factor += joint_movement * 0.5  # Joint movement contribution
        
        # Drain battery based on activity (0.001 to 0.005 per update)
        self.battery -= (0.001 + activity_factor * 0.004) * dt * 10
        self.battery = max(0.0, min(100.0, self.battery))
        
        # Simulate CPU load (base + activity-based)
        base_cpu = 8.0 + random.uniform(-2.0, 2.0)  # Base CPU load with slight fluctuation
        joint_cpu = joint_movement * 30.0  # Joint movement increases CPU
        self.cpu = base_cpu + joint_cpu + random.uniform(-5.0, 5.0)  # Add noise
        self.cpu = max(5.0, min(95.0, self.cpu))  # Clamp between 5% and 95%
        
        # Update each joint
        for i, joint in enumerate(self.joints_state):
            # Decrease time to next move
            joint["time_to_next_move"] -= dt
            
            # If it's time to select a new target
            if joint["time_to_next_move"] <= 0:
                # Set new target within realistic range
                # More likely to stay near middle of range than extremes
                position_bias = random.uniform(-0.3, 0.3)  # Bias toward middle positions
                normalized_target = (random.uniform(0, 1) + position_bias) / (1 + abs(position_bias))
                normalized_target = max(0.0, min(1.0, normalized_target))
                
                joint["target_q"] = joint["min"] + normalized_target * (joint["max"] - joint["min"])
                
                # Next move in 2-8 seconds
                joint["time_to_next_move"] = random.uniform(2.0, 8.0)
            
            # Move toward target position with realistic acceleration/deceleration
            # Calculate desired velocity based on distance to target
            dist_to_target = joint["target_q"] - joint["q"]
            max_velocity = 0.5  # rad/s
            max_acceleration = 0.2  # rad/s²
            
            # Simple motion profile
            if abs(dist_to_target) > 0.1:
                target_velocity = max_velocity * math.copysign(1, dist_to_target)
            else:
                # Slow down as we approach target
                target_velocity = max_velocity * dist_to_target / 0.1
            
            # Accelerate/decelerate toward target velocity
            velocity_diff = target_velocity - joint["dq"]
            if abs(velocity_diff) > max_acceleration * dt:
                dq_change = max_acceleration * dt * math.copysign(1, velocity_diff)
            else:
                dq_change = velocity_diff
            
            joint["dq"] += dq_change
            
            # Update position
            joint["q"] += joint["dq"] * dt
            
            # Enforce joint limits
            if joint["q"] < joint["min"]:
                joint["q"] = joint["min"]
                joint["dq"] = 0
            elif joint["q"] > joint["max"]:
                joint["q"] = joint["max"]
                joint["dq"] = 0
            
            # Calculate torque based on velocity and acceleration
            # Simple model: torque = inertia * acceleration + damping * velocity
            inertia = 0.1  # Simplified inertia
            damping = 0.05  # Simplified damping
            joint["tau_est"] = inertia * dq_change / dt + damping * joint["dq"]
            
            # Temperature model: rises with absolute torque, slowly cools down
            heat_rate = 0.2 * abs(joint["tau_est"])  # Heat generated by torque
            cooling_rate = 0.05 * (36 - joint["temperature"])  # Passive cooling to ambient
            joint["temperature"] += (heat_rate + cooling_rate) * dt
            joint["temperature"] = max(35.0, min(75.0, joint["temperature"]))  # Clamp temperature
    
    def get_state(self):
        # Prepare joint data for sending
        joints_data = []
        for joint in self.joints_state:
            joints_data.append({
                "name": joint["name"],
                "q": round(joint["q"], 3),
                "dq": round(joint["dq"], 3),
                "tau_est": round(joint["tau_est"], 3),
                "temperature": round(joint["temperature"], 1),
                "min": joint["min"],
                "max": joint["max"]
            })
        
        return {
            "joints": joints_data,
            "tick": self.tick,
            "battery": round(self.battery, 1),
            "cpu": round(self.cpu, 1),
        }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    simulator = RobotSimulator()
    
    last_time = time.time()
    
    try:
        while True:
            # Calculate elapsed time since last update
            current_time = time.time()
            dt = current_time - last_time
            last_time = current_time
            
            # Update simulation
            simulator.update(dt)
            
            # Get and send state
            state = simulator.get_state()
            await websocket.send_text(json.dumps(state))
            
            # Wait a bit to not overload the system
            await asyncio.sleep(0.1)
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
