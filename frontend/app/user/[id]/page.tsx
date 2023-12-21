import { getFriendRequests, getFriends, getUser } from "@/app/lib/actions";
import { getCurrentUserId } from "@/app/lib/session";
import AcceptFriendButton from "@/app/ui/user/accept-friend-request-button";
import AddFriendButton from "@/app/ui/user/add-friend-button";
import { Avatar } from "@/app/ui/user/avatar";
import CancelFriendRequestButton from "@/app/ui/user/cancel-friend-request-button";
import MatchRequestButton from "@/app/ui/user/match-request-button";
import RejectFriendButton from "@/app/ui/user/reject-friend-request-button";
import RemoveFriendButton from "@/app/ui/user/remove-friend-button";

export default async function FindUser({
  params: { id },
}: {
  params: { id: string };
}) {
  const userId = parseInt(id, 10);
  const user = await getUser(userId);
  const requests = await getFriendRequests();
  const friends = await getFriends();
  // check if any requesting contains userId
  const hasSentRequest = requests.requesting.some((r) => r.id === userId);
  const hasReceivedRequest = requests.requestedBy.some((r) => r.id === userId);
  const isFriend = friends.some((f) => f.id == userId);
  const currentUserId = await getCurrentUserId();
  const canAddFriend = !hasSentRequest && !hasReceivedRequest && !isFriend;
  // TODO: Must consider these situations
  // 1. Already friends
  // 2. Friend request sent
  // 3. Friend request received
  // 4. Not friends
  // 5. You
  // 6. Blocked
  // 7. Blocking
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Avatar avatarURL={user.avatarURL} size="large" />
      </div>
      <div className="text-xl font-bold">{user.name}</div>
      {user.id !== currentUserId && (
        <>
          <div className="flex gap-4">
            {hasSentRequest && <CancelFriendRequestButton id={userId} />}
            {hasReceivedRequest && <AcceptFriendButton id={userId} />}
            {hasReceivedRequest && <RejectFriendButton id={userId} />}
            {isFriend && <RemoveFriendButton id={userId} />}
            {canAddFriend && <AddFriendButton id={userId} />}
          </div>
          <MatchRequestButton id={userId} />
        </>
      )}
      <div className="bg-secondary">Match History</div>
      <div className="bg-secondary">Friends</div>
    </div>
  );
}
