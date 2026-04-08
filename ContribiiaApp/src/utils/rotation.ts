export function getNextPayoutMember(
  members: string[],
  currentIndex: number
) {
  if (members.length === 0) return null;

  const nextIndex = (currentIndex + 1) % members.length;
  return members[nextIndex];
}