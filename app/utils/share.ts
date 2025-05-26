export function getTwitterShareUrl(theme: { id: string; content: string }) {
  const shareUrl = `${window.location.origin}/share/${theme.id}`;
  const tags = "#오타쿠 붐박스 #붐박스 #테마 #신청 #2주년";
  const tweetText = `이번 붐박스 2주년에서 "${theme.content}" 테마를 신청했어요!!! \n같이 이 테마를 신청해주세요!! 🙏\n${tags}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}&url=${encodeURIComponent(shareUrl)}`;
}
