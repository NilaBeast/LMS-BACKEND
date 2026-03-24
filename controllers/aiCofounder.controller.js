const axios = require("axios");
const FormData = require("form-data");

const AIAd = require("../models/AIAd.model.js");
const AIChat = require("../models/AIChat.model.js");
const AILandingPage = require("../models/AILandingPage.model");
const Business = require("../models/Business.model");
const cloudinary = require("../config/cloudinary");


/* --------------------------------
   IMAGE GENERATOR
-------------------------------- */

async function generateFluxImage(prompt) {

  try {

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("aspect_ratio", "1:1");
    formData.append("output_format", "png");

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
          ...formData.getHeaders()
        }
      }
    );

    const base64 = response.data.image;

    const upload = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64}`,
      {
        folder: "ai-ads",
        resource_type: "image",
        public_id: `ai_ad_${Date.now()}`
      }
    );

    return upload.secure_url;

  } catch (err) {

    console.log(
      "IMAGE GENERATION FAILED:",
      err.response?.data || err.message
    );

    return null;

  }

}


/* --------------------------------
   AD EXPLANATION
-------------------------------- */

function generateAdExplanation(ad) {

  const intro =
    ad.mediaType === "video"
      ? `Here’s your updated ad — designed to capture attention through motion and storytelling.`
      : `Here’s your updated ad — crafted to stand out in social feeds with a clear visual message.`;

  return `
${intro}

💡 Headline: ${ad.headline}

✨ Copy explains the benefit clearly.

🎯 CTA "${ad.cta}" encourages the next step.
`;
}


/* --------------------------------
   AI COFOUNDER CHAT
-------------------------------- */

exports.aiCofounderChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    /* --------------------------------
       GET USER BUSINESS
    -------------------------------- */
    const business = await Business.findOne({
      where: { userId }
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    let usage = business.planUsage || {
      members: 0,
      storageUsed: 0,
      aiMessagesToday: 0,
      aiLastReset: null
    };

    const today = new Date().toDateString();

    /* RESET DAILY COUNT */
    /* RESET DAILY COUNT */
if (usage.aiLastReset !== today) {
  usage = {
    ...usage,
    aiMessagesToday: 0,
    aiLastReset: today
  };
}

/* CHECK LIMIT */
if ((usage.aiMessagesToday || 0) >= 5) {
  return res.status(403).json({
    message: "Max daily AI limit reached"
  });
}

/* INCREMENT USAGE */
const newUsage = {
  ...usage,
  aiMessagesToday: (usage.aiMessagesToday || 0) + 1
};

await business.update({
  planUsage: newUsage
});

console.log("AI usage updated:", newUsage.aiMessagesToday);

    /* --------------------------------
       CONTINUE AI GENERATION
    -------------------------------- */

    const previousAd = await AIAd.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]]
    });

    const previousVideoScript = await AIChat.findOne({
      where: { userId, type: "video-script" },
      order: [["createdAt", "DESC"]]
    });

    const lowerMessage = message.toLowerCase();

    const isVideoRequest =
      lowerMessage.includes("video") ||
      lowerMessage.includes("script") ||
      lowerMessage.includes("storyline");

    const prompt = `
You are an expert Meta Ads strategist and marketing copywriter.

If user asks for VIDEO SCRIPT return only dialogue.
If IMAGE AD return JSON.

Previous Ad:
${previousAd ? JSON.stringify(previousAd) : "None"}

Previous Script:
${previousVideoScript ? previousVideoScript.response : "None"}

User Request:
${message}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "x-ai/grok-4.1-fast",
        messages: [
          { role: "system", content: "You are a marketing AI expert." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiText = response.data?.choices?.[0]?.message?.content || "";

    /* VIDEO SCRIPT */
    if (isVideoRequest) {
      const script = aiText.replace(/```/g, "").trim();

      await AIChat.create({
        userId,
        prompt: message,
        response: script,
        type: "video-script"
      });

      return res.json({
        chat: script,
        ad: null,
        remaining: 5 - usage.aiMessagesToday
      });
    }

    const cleaned = aiText.replace(/```json|```/g, "").trim();

    let ad;

    try {
      ad = JSON.parse(cleaned);
    } catch {
      ad = {};
    }

    ad = {
      brand: ad.brand || "Techzuno",
      headline: ad.headline || "Protect What Matters Most",
      subheadline: ad.subheadline || "",
      primaryText: ad.primaryText || "High converting ad copy",
      description: ad.description || "Marketing description",
      cta: ad.cta || "Learn More",
      mediaType: ad.mediaType || "image",
      imagePrompt: ad.imagePrompt || "modern product marketing photo"
    };

    let imageUrl = null;

    if (ad.mediaType === "image") {
      imageUrl = await generateFluxImage(ad.imagePrompt);
    }

    const explanation = generateAdExplanation(ad);

    const savedAd = await AIAd.create({
      userId,
      prompt: message,
      ...ad,
      imageUrl
    });

    await AIChat.create({
      userId,
      prompt: message,
      response: explanation,
      type: "ad"
    });

    res.json({
      chat: explanation,
      ad: savedAd,
      remaining: 5 - usage.aiMessagesToday
    });

  } catch (err) {
    console.error("AI COFOUNDER ERROR:", err);

    res.status(500).json({
      message: "AI generation failed"
    });
  }
};



/* --------------------------------
   GET HISTORY
-------------------------------- */

exports.getAIHistory = async (req, res) => {

  try {

    const userId = req.user.id;

    const chats = await AIChat.findAll({
      where: { userId },
      order: [["createdAt", "ASC"]]
    });

    const ads = await AIAd.findAll({
      where: { userId },
      order: [["createdAt", "ASC"]]
    });

    const cofounderChats = [];
    const landingChats = [];

    chats.forEach(chat => {

      /* ---------------- LANDING PAGE ---------------- */

      if (chat.type === "landing") {

        let options = {};

        try {
          options = JSON.parse(chat.response);
        } catch {
          options = {};
        }

        landingChats.push({
          role: "assistant",
          type: "landing-options",
          options
        });

        return;
      }

      /* ---------------- VIDEO SCRIPT ---------------- */

      if (chat.type === "video-script") {

        cofounderChats.push({
          role: "user",
          content: chat.prompt
        });

        cofounderChats.push({
          role: "assistant",
          content: chat.response
        });

        return;
      }

      /* ---------------- AD GENERATION ---------------- */

      if (chat.type === "ad") {

        cofounderChats.push({
          role: "user",
          content: chat.prompt
        });

        const relatedAd = ads.find(a => a.prompt === chat.prompt);

        cofounderChats.push({
          role: "assistant",
          content: chat.response,
          ad: relatedAd || null
        });

      }

    });

    const lastAd = ads.length ? ads[ads.length - 1] : null;

    res.json({
      cofounderChats,
      landingChats,
      lastAd
    });

  } catch (err) {

    console.error("AI HISTORY ERROR:", err);

    res.status(500).json({
      message: "Failed to load history"
    });

  }

};



/* --------------------------------
   LANDING PAGE GENERATOR
-------------------------------- */

exports.generateLandingPage = async (req, res) => {

  try {

    const userId = req.user.id;

    const {
      topic,
      audience,
      painPoints,
      promise,
      dateTime,
      duration,
      section
    } = req.body;


    const previousLanding = await AIChat.findOne({
      where: { userId, type: "landing" },
      order: [["createdAt", "DESC"]]
    });


    let sectionInstruction = "";

    if (section) {

      sectionInstruction = `
Regenerate ONLY "${section}" section.

Return ONLY this JSON structure:

{
"${section}": ["option1","option2","option3"]
}

Do not include any other fields.
`;

    }

    const prompt = `
You are a webinar funnel copywriting expert.

Previous Landing Context:
${previousLanding ? previousLanding.response : "None"}

Generate webinar landing page copy.

Return ONLY JSON.

{
"headlineOptions":[],
"subheadlineOptions":[],
"topicsCovered":[],
"moralReason":[],
"whatYouTeach":[],
"whoFor":[],
"whoNotFor":[],
"unique":[],
"testimonials":[],
"faqs":[],
"cta":[],
"bonuses":[]
}

Topic: ${topic}
Audience: ${audience}
Pain Points: ${painPoints}
Promise: ${promise}
Date: ${dateTime}
Duration: ${duration}

${sectionInstruction}
`;


    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "x-ai/grok-4.1-fast",
        messages: [
          { role: "system", content: "You are a funnel copywriting expert." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiText = response.data?.choices?.[0]?.message?.content || "";

    const cleaned = aiText.replace(/```json|```/g, "").trim();

    let data = {};

    try {
      data = JSON.parse(cleaned);
    } catch {
      data = {};
    }

    const landingData = {
      headlineOptions: data.headlineOptions || [],
      subheadlineOptions: data.subheadlineOptions || [],
      topicsCovered: data.topicsCovered || [],
      moralReason: data.moralReason || [],
      whatYouTeach: data.whatYouTeach || [],
      whoFor: data.whoFor || [],
      whoNotFor: data.whoNotFor || [],
      unique: data.unique || [],
      testimonials: data.testimonials || [],
      faqs: data.faqs || [],
      cta: data.cta || [],
      bonuses: data.bonuses || []
    };

    const savedLandingPage = await AILandingPage.create({
      userId,
      topic,
      audience,
      painPoints,
      promise,
      dateTime,
      duration,
      ...landingData
    });

    await AIChat.create({
      userId,
      prompt: `Generate landing page for ${topic}`,
      response: JSON.stringify(landingData),
      type: "landing"
    });

    res.json({
      landingPage: savedLandingPage,
      options: landingData
    });

  } catch (err) {

    console.error("LANDING PAGE ERROR:", err);

    res.status(500).json({
      message: "Landing page generation failed"
    });

  }

};