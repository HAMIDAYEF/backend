import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Explain traffic signs briefly");
     
    console.log(result.response.text());

  } catch (err) {
    console.error(err);
  }
}

test();

/*import dotenv from "dotenv";
dotenv.config();
    console.log("TEST KEY:", process.env.GEMINI_API_KEY);*/

