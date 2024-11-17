import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Ball {
  id: string;
  imageUrl: string;
  position: { x: number; y: number };
}

const BallGame: React.FC = () => {
  let socket: Socket;
  const [imageUrl, setImageUrl] = useState<string>('');
  const [ballPosition, setBallPosition] = useState({ x: 200, y: 200 });
  const [balls, setBalls] = useState<Ball[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const SOCKET_URL = 'http://localhost:3001';
    socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');

      if (socket && socket.id) {
        const newBall: Ball = { id: socket.id, imageUrl, position: ballPosition };
        socket.emit('joinGame', newBall);
      }
    });

    socket.on('updateBalls', (updatedBalls: Ball[]) => {
      setBalls(updatedBalls);
    });

    return () => {
      socket.disconnect();
      console.log('Disconnected from WebSocket server');
    };
  }, [imageUrl]);

  const moveBall = (dx: number, dy: number) => {
    setBallPosition((prevPos) => {
      const newX = prevPos.x + dx;
      const newY = prevPos.y + dy;
      const newPos = { x: newX, y: newY };

      if (socket) {
        socket.emit('moveBall', { id: socket.id, position: newPos });
      }
      console.log("moving ball");
      return newPos;
    });
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    console.log("Event")
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
          const img = new Image();
          img.src = ball.imageUrl;
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(ball.position.x, ball.position.y, 20, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, ball.position.x - 20, ball.position.y - 20, 40, 40);
            ctx.closePath();
            ctx.restore();
          };
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
    <div className="ball-game" style={{ display: 'flex' }}>
      <div style={{ width: '200px', padding: '10px', backgroundColor: '#f4f4f4', borderRight: '1px solid #ccc' }}>
        <h3>Joined Users</h3>
        {balls.map((ball) => (
          <div key={ball.id} style={{ margin: '10px 0', display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundImage: `url(${ball.imageUrl})`,
                backgroundSize: 'cover',
                marginRight: '10px',
              }}
            ></div>
            <span>{ball.id.slice(0, 5)}</span>
          </div>
        ))}
        <input
          type="text"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ width: '100%', marginTop: '10px' }}
        />
      </div>

      <div style={{ flexGrow: 1, textAlign: 'center' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            border: '1px solid black',
            margin: '20px auto',
            display: 'block',
          }}
        ></canvas>
        <div>Move the ball with arrow keys or WSAD keys!</div>
      </div>
    </div>
  );
};

export default BallGame;
