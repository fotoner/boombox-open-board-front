export function getTwitterShareUrl(
  theme: { id: string; content: string },
  eventTitle?: string
) {
  const shareUrl = `${window.location.origin}/share/${theme.id}`;
  const eventName = eventTitle || "붐박스";
  const tags = `#오타쿠붐박스 #붐박스 #테마 #신청 ${
    eventTitle ? `#${eventTitle}` : ""
  }`;
  const tweetText = `이번 ${eventName}에서 "${theme.content}" 테마를 신청했어요!!! \n같이 이 테마를 신청해주세요!! 🙏\n${tags}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}&url=${encodeURIComponent(shareUrl)}`;
}
