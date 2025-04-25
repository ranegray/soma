# H1.Soma

**H1.Soma** is a real-time dashboard and visualization interface for the Unitree H1-2 humanoid robot. It provides insight into the robot's motor states, IMU readings, control status, and overall physical performance during live experiments or development sessions.

This tool is designed to help researchers, developers, and engineers in the Correll Lab observe, debug, and better understand the behavior and state of the H1 platform.

## Why the Name?

> **“Soma”** comes from the Greek word for *body*. In robotics and neuroscience, it often refers to the embodied physical system — the hardware that moves, senses, and interacts with the world.

In the context of the H1 robot, **H1.Soma** represents a live window into the *body* of the machine — showing how it moves, how it reacts, and what it experiences in real time.

## What It Does

- Connects to a WebSocket server streaming robot state data (`rt/lowstate`)
- Displays real-time telemetry from the H1-2 robot:
  - Motor angles, speeds, and torques
  - IMU orientation (quaternion and RPY)
  - Accelerometer and gyroscope readings
  - CPU and battery status
- Provides a live feed of raw state data for debugging
- Clean, responsive web UI built with React + Tailwind

## Future Additions

- Live control input preview via `rt/lowcmd`
- Per-joint plots or gait overlays
- 3D visualization of robot pose (via Three.js or Unity WebView)

## Tech Stack

- React (Vite)
- Tailwind CSS
- WebSocket API (Browser-native)
- FastAPI WebSocket backend (Python simulator)

---

*Made for the Correll Lab — CU Boulder Robotics.*
