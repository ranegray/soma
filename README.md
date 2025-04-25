# h1.soma

**h1.soma** is a dashboard that shows you what's happening with the unitree h1-2 robot in real-time. you can see motor states, sensor readings, and how the robot's performing while you're working with it.

we built this to help us see what's going on with the h1 during experiments in the correll lab.

## why "soma"?

"soma" is greek for "body." it's like a window into the robot's physical being - showing you how it moves and what it's experiencing as it happens.

## what it does

- subscribes to ros topics from a web server running directly on the h1-2 robot
- visualizes the robot's data through a custom web ui
- displays real-time info like:
  - motor angles, speeds, and torques
  - orientation data
  - sensor readings
  - battery and cpu status
- lets you monitor the robot remotely through any browser
- provides a simple interface for debugging and development

## tech we used

- react (vite)
- typescript
- tailwind
- react-router
- roslibjs
- rosbridge

---

_made for the correll lab_
