"use client";

import { memo, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { PongGame } from "./PongGame";
import { TARGET_FRAME_MS } from "./const";
import { Button } from "@/components/ui/button";

type setFunction = (value: number) => void;

interface PongBoardProps {
  id: string;
  setFps: setFunction;
  setSpeed: setFunction;
  setPlayer1Position: setFunction;
  setPlayer2Position: setFunction;
}
function PongBoard({
  id: id,
  setFps: setFps,
  setSpeed: setSpeed,
  setPlayer1Position: setPlayer1Position,
  setPlayer2Position: setPlayer2Position,
}: PongBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<Socket>(undefined!);
  // todo: useRef vs useState
  const game = useRef<PongGame>(
    new PongGame(setFps, setSpeed, setPlayer1Position, setPlayer2Position),
  );
  useEffect(() => {
    // > If the contextType doesn't match a possible drawing context, or differs from the first contextType requested, null is returned."
    // from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      console.warn("2d canvas is not supported or there is a bug");
      return;
    }
    const socket = io(process.env.NEXT_PUBLIC_WEB_URL! + "/pong");
    setSocket(socket);

    game.current.setup_canvas(ctx, socket);
    game.current.draw_canvas();
    const intervalId = setInterval(game.current.update, TARGET_FRAME_MS);

    const handleKeyUp = (event: KeyboardEvent) => {
      game.current.keypress[event.key] = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      game.current.keypress[event.key] = true;
    };

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("keyup", handleKeyUp);

    socket.on("connect", () => {
      console.log(`Connected: ${socket.id}`);

      socket.emit("join", id);
    });

    socket.on("start", (data) => {
      console.log(`Start: ${JSON.stringify(data)}`);
      game.current.start(data);
    });

    socket.on("right", () => {
      game.current.player2.clear(game.current.ctx);
      game.current.player2.move_left();
      game.current.player2.draw(game.current.ctx);
    });

    socket.on("left", () => {
      game.current.player2.clear(game.current.ctx);
      game.current.player2.move_right();
      game.current.player2.draw(game.current.ctx);
    });

    socket.on("bounce", () => {
      game.current.ball.bounce_off_paddle(game.current.player2);
    });

    socket.on("collide", () => {
      game.current.ball.reset();
      game.current.score.player1++;
    });

    return () => {
      socket.disconnect();
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      clearInterval(intervalId);
    };
  }, [id]);

  const start = () => {
    game.current.start();
    socket.emit("start", {
      vx: -game.current.ball.vx,
      vy: -game.current.ball.vy,
    });
  };

  return (
    <>
      <div>
        <Button onClick={start}>Start</Button>
        <Button onClick={game.current.switch_battle_mode}>Battle</Button>
        <Button onClick={game.current.switch_practice_mode}>Practice</Button>
      </div>
      <canvas
        ref={canvasRef}
        width="256"
        height="512"
        className="border w-[256px] h-[512px]"
      ></canvas>
    </>
  );
}

const memoizedPongBoard = memo(PongBoard);
export default memoizedPongBoard;
// export default PongBoard;