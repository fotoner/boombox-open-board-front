import { TwitterTweetEmbed } from "react-twitter-embed";
import styled from "@emotion/styled";

const TweetSection = styled.div`
  width: 100%;
  max-width: 550px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TweetContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function TweetEmbedSection() {
  return (
    <TweetSection>
      <TweetContainer>
        <TwitterTweetEmbed
          tweetId="1913559222790558092"
          options={{ width: 550 }}
        />
      </TweetContainer>
    </TweetSection>
  );
}
