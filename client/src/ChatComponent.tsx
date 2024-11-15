import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Ball {
  id: string;
  color: string;
  position: { x: number; y: number };
}

const BallGame: React.FC = () => {
  let socket: Socket;
  const [ballColor, setBallColor] = useState<string>('');
  const [ballPosition, setBallPosition] = useState({ x: 200, y: 200 });
  const [balls, setBalls] = useState<Ball[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const SOCKET_URL = 'http://localhost:3001';
    socket = io(SOCKET_URL, { transports: ['websocket'] });

    //setSocket(newSocket);
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      setBallColor(randomColor);

      if (socket && socket.id) {
        const newBall: Ball = { id: socket.id, color: randomColor, position: ballPosition };
        socket.emit('joinGame', newBall);
      }

    });

    socket.on('updateBalls', (updatedBalls: Ball[]) => {
      console.log('Updating balls:', updatedBalls);
      setBalls(updatedBalls);
    });

    return () => {
      socket.disconnect();
      console.log('Disconnected from WebSocket server');
    };
  }, []);

  const moveBall = (dx: number, dy: number) => {

    setBallPosition((prevPos) => {
      const newX = prevPos.x + dx;
      const newY = prevPos.y + dy;
      const newPos = { x: newX, y: newY };
      console.log(socket);

      if (socket) {
        console.log("Emiting event");
        socket.emit('moveBall', { id: socket.id, position: newPos });
      }
      return newPos;
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        moveBall(0, -10);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        moveBall(0, 10);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        moveBall(-10, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        moveBall(10, 0);
        break;
      default:
        break;
    }
  };

  const drawBalls = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx);

        balls.forEach((ball) => {
          ctx.beginPath();
          ctx.arc(ball.position.x, ball.position.y, 20, 0, 2 * Math.PI);
          ctx.fillStyle = ball.color;
          ctx.fill();
          ctx.closePath();
        });
      }
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 50;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
    }
    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
    }
    ctx.stroke();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    drawBalls();
  }, [balls]);

  return (
    <div className="ball-game">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black', display: 'block', margin: '0 auto' }}
      ></canvas>
      <div>Move the ball with arrow keys or WSAD keys!</div>
    </div>
  );
};

export default BallGame;
