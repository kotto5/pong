"use client";
import type { EnterRoomEvent, RoomEntity } from "@/app/lib/dtos";
import { Stack } from "@/components/layout/stack";
import Link from "next/link";
import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import CreateRoomDialog from "./create-room-dialog";
import { useAuthContext } from "@/app/lib/client-auth";
import { chatSocket as socket } from "@/socket";

function RoomButton({
  room,
  selected,
}: {
  room: RoomEntity;
  selected: boolean;
}) {
  const router = useRouter();
  const onClick = () => {
    router.push(`${room.id}`);
    router.refresh();
  };
  return (
    <button
      key={room.id}
      onClick={onClick}
      className={`p-2 rounded text-start hover:bg-secondary ${
        selected ? "bg-secondary" : ""
      }`}
    >
      {room.name}
    </button>
  );
}

function ExploreButton() {
  return (
    <div
      className={`p-2 rounded text-start font-bold text-primary hover:bg-primary hover:text-primary-foreground`}
    >
      <Link href={`/explore-rooms`}>Explore Rooms</Link>
    </div>
  );
}

export default function RoomsSidebar({ rooms }: { rooms: RoomEntity[] }) {
  const pathname = usePathname();
  const { currentUser } = useAuthContext();
  const router = useRouter();
  let selectedRoomId: number | undefined;
  if (pathname.startsWith("/room/")) {
    selectedRoomId = parseInt(pathname.split("/")[2], 10);
  }

  const handleEnterRoomEvent = useCallback(
    (data: EnterRoomEvent) => {
      if (currentUser?.id === data.userId) {
        router.refresh();
      }
    },
    [currentUser, router],
  );
  useEffect(() => {
    socket.on("enter-room", handleEnterRoomEvent);
    return () => {
      socket.off("enter-room", handleEnterRoomEvent);
    };
  }, [handleEnterRoomEvent]);

  return (
    <div className="overflow-y-auto shrink-0 basis-48 pb-4">
      <div className="flex justify-between">
        <div className={`font-bold`}>Chats</div>
        <CreateRoomDialog />
      </div>
      <Stack space="space-y-0">
        {rooms.map((room) => (
          <RoomButton
            room={room}
            selected={room.id === selectedRoomId}
            key={room.id}
          />
        ))}
        <ExploreButton />
      </Stack>
    </div>
  );
}
