import axios from "axios";
import { SentimentModel, SentimentSurvey } from "sentiment-survey";
import surveyJson from "./surveyJson.json";
import surveyTheme from "./surveyTheme.json";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";

const SENTIMENT_STREAM_ID = "CYBERLETE_SENTIMENT_05_2024_LEET_COIN";

export default function SurveyComponent() {
  const survey = new SentimentModel(surveyJson);
  survey.applyTheme(surveyTheme);

  survey.onComplete.add(async (sender) => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];

        const message = `Confirm submission of survey data: ${JSON.stringify(
          sender.data
        )}`;

        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, account],
        });

        const url = `https://sentiment-stream.vercel.app/api/surveys/${SENTIMENT_STREAM_ID}`;
        console.log("Sending data with signature...");
        const response = await axios.post(
          url,
          {
            sentimentStreamId: SENTIMENT_STREAM_ID,
            data: sender.data,
            sender: sender,
            signature: signature,
            walletAddress: account,
          },
          {
            headers: {
              "x-api-key": "SENTIMENT_STREAM_API_CYBERLETE",
            },
          }
        );
        console.log("Successful response: ", response);
        window.location.href =
          "https://sentiment-gamma.vercel.app/dashboard/profile";
      } catch (error) {
        console.error("Error signing or sending data: ", error);
      }
    } else {
      console.log("MetaMask is not installed!");
    }
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SentimentSurvey
        model={survey}
        style={{ width: "100%", height: "100%" }}
      />
      <div className="fixed top-0 text-white w-full flex justify-center items-center py-4">
        <a
          href="https://sentiment-gamma.vercel.app/dashboard/profile"
          className="text-xs opacity-50 hover:opacity-100 cursor-pointer"
        >
          Powered by Sentiment
        </a>
      </div>
    </div>
  );
}
