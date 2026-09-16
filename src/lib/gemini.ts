import { WeatherData, GeoLocation, ChatApiResponse, WeatherSummaryCardData } from './types';
import { getVoiceConfigForLanguage } from './voice/config';

// Extract potential city/location query from user message or history
export function extractLocationQuery(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): string | null {
  const text = message.trim();

  // Pattern 1: "What about Mumbai?"
  const aboutMatch = text.match(
    /\b(?:what|how)\s+about\s+([A-Za-z][A-Za-z\s]{1,40}?)(?:\?|$)/i
  );

  if (aboutMatch?.[1]) {
    const location = aboutMatch[1].trim();

    const banned = [
      'tomorrow',
      'today',
      'tonight',
      'the rain',
      'the wind',
      'this',
      'it',
    ];

    if (
      location.length >= 2 &&
      !banned.some((word) => location.toLowerCase().includes(word))
    ) {
      return location;
    }
  }

  // Pattern 2: "weather in Mumbai"
  const inMatch = text.match(
    /\b(?:weather|forecast|temperature|rain)\s+(?:in|at|near|around|for)\s+([A-Za-z][A-Za-z\s,]{1,50}?)(?:\?|$)/i
  );

  if (inMatch?.[1]) {
    return inMatch[1].trim();
  }

  // Pattern 3: "in Mumbai" / "near Mumbai"
  const locationMatch = text.match(
    /\b(?:in|at|near|around|for)\s+([A-Za-z][A-Za-z\s,]{1,40}?)(?:\?|$|\s+(?:today|tomorrow|tonight|now)\b)/i
  );

  if (locationMatch?.[1]) {
    const location = locationMatch[1].trim();

    const banned = [
      'the next',
      'my city',
      'here',
      'there',
      'outdoor activities',
      'an umbrella',
      'a run',
      'a walk',
      'work',
    ];

    if (
      location.length >= 2 &&
      !banned.some((word) => location.toLowerCase().includes(word))
    ) {
      return location;
    }
  }

  // Pattern 4: "Mumbai weather" / "Mumbai forecast"
  const suffixMatch = text.match(
    /^([A-Za-z][A-Za-z\s]{1,40}?)\s+(?:weather|forecast)\b/i
  );

  if (suffixMatch?.[1]) {
    return suffixMatch[1].trim();
  }

  // No location found
  return null;
}

// Format the next 24 hours data into a concise summary table/text for Gemini
function formatHourlyDataForPrompt(weather: WeatherData): string {
  const current = weather.current;
  const analysis = weather.analysis24h;
  const hourly = weather.hourly24h;

  const hourlyLines = hourly
    .slice(0, 16)
    .map(
      (h) =>
        `- ${h.hourLabel}: ${h.temperature}°C, ${h.conditionText}, Rain Prob: ${h.precipitationProbability}%, Rain: ${h.rain}mm, Wind: ${h.windSpeed}km/h`
    )
    .join('\n');

  return `
CURRENT OBSERVATIONS (${weather.location.name}, ${weather.location.country}):
- Temperature: ${current.temperature}°C (Feels like: ${current.feelsLike}°C)
- Condition: ${current.conditionText} (${current.conditionIcon})
- Humidity: ${current.humidity}%
- Wind Speed: ${current.windSpeed} km/h (Gusts: ${current.windGusts} km/h, Direction: ${current.windDirection}°)
- Precipitation: ${current.precipitation} mm, Rain: ${current.rain} mm
- Pressure: ${current.pressure} hPa
- Visibility: ${current.visibility} km

NEXT 24 HOURS METRICS:
- Rain Expected: ${analysis.willRain ? 'YES' : 'NO'}
- Peak Rain Chance: ${analysis.peakRainProbability}% (Timing: ${analysis.peakRainWindow})
- Total Expected Rain: ${analysis.totalExpectedRainMm} mm
- Temperature Range: ${analysis.tempMin24h}°C to ${analysis.tempMax24h}°C
- Coldest Period: ${analysis.coldestHour} (${analysis.tempMin24h}°C)
- Hottest Period: ${analysis.hottestHour} (${analysis.tempMax24h}°C)
- Max Wind Speed: ${analysis.maxWindSpeedKmH} km/h

HOURLY TIMELINE (Next 24 Hours):
${hourlyLines}
`;
}

// Rule-based truthful synthesizer when GEMINI_API_KEY is not configured
function synthesizeGroundedWeatherResponse(
  userMessage: string,
  weather: WeatherData,
  language: string = 'en'
): { reply: string; followUps: string[] } {
  const q = userMessage.toLowerCase();
  const name = weather.location.name;
  const current = weather.current;
  const analysis = weather.analysis24h;

  if (language === 'hi') {
    if (q.includes('rain') || q.includes('बारिश') || q.includes('छाता') || q.includes('वर्षा')) {
      return {
        reply: analysis.willRain
          ? `🌧️ हाँ, अगले 24 घंटों में **${name}** में बारिश की संभावना है।\n\nबारिश की सर्वाधिक संभावना **${analysis.peakRainWindow}** के आसपास लगभग **${analysis.peakRainProbability}%** है (अपेक्षित वर्षा: ~${analysis.totalExpectedRainMm} मिमी)।\n\n💡 **सुझाव**: यदि आप उस समय बाहर निकल रहे हैं तो छाता साथ रखना अच्छा रहेगा।`
          : `🌤️ अगले 24 घंटों में **${name}** में किसी खास बारिश की संभावना नहीं है।\n\nबारिश की अधिकतम संभावना केवल **${analysis.peakRainProbability}%** है।\n\n💡 **सुझाव**: आपको आज छाते की आवश्यकता नहीं होगी!`,
        followUps: ['आज रात का तापमान कितना रहेगा?', 'आज हवा कितनी तेज चलेगी?', 'कल का मौसम कैसा रहेगा?'],
      };
    } else if (q.includes('temp') || q.includes('तापमान') || q.includes('गर्मी') || q.includes('ठंड')) {
      return {
        reply: `🌡️ **${name}** में वर्तमान तापमान **${current.temperature}°C** (आभासी: ${current.feelsLike}°C) है।\n\n**अगले 24 घंटों का तापमान रुझान:**\n• **न्यूनतम**: ${analysis.tempMin24h}°C (${analysis.coldestHour} के आसपास)\n• **अधिकतम**: ${analysis.tempMax24h}°C (${analysis.hottestHour} के आसपास)\n\n💡 **सुझाव**: ${
          current.temperature > 32
            ? 'दोपहर के समय पर्याप्त पानी पिएं और धूप से बचें।'
            : current.temperature < 18
            ? 'शाम और सुबह के समय हल्की गर्म चादर या स्वेटर उपयोगी रहेगा।'
            : 'मौसम अनुकूल और सुखद बना रहेगा।'
        }`,
        followUps: [`क्या अगले 24 घंटों में ${name} में बारिश होगी?`, 'क्या मुझे छाता रखना चाहिए?', 'हवा की गति कितनी है?'],
      };
    } else if (q.includes('wind') || q.includes('हवा')) {
      return {
        reply: `💨 **${name}** में हवा की गति वर्तमान में **${current.windSpeed} किमी/घंटा** है और झोंके **${current.windGusts} किमी/घंटा** तक हैं।\n\nअगले 24 घंटों में अधिकतम गति **${analysis.maxWindSpeedKmH} किमी/घंटा** तक जा सकती है।`,
        followUps: ['क्या आज बारिश होगी?', 'आज का तापमान कितना है?', 'कल का मौसम कैसा रहेगा?'],
      };
    } else if (q.includes('tomorrow') || q.includes('कल')) {
      const tomorrow = weather.daily[1] || weather.daily[0];
      return {
        reply: `☀️ कल **${name}** में:\n\n• **स्थिति**: ${tomorrow?.conditionIcon} ${tomorrow?.conditionText}\n• **तापमान**: ${tomorrow?.tempMin}°C से ${tomorrow?.tempMax}°C\n• **बारिश की संभावना**: अधिकतम ${tomorrow?.precipitationProbabilityMax}%`,
        followUps: ['क्या आज रात बारिश होगी?', 'आज का तापमान क्या है?', 'क्या मुझे छाता रखना चाहिए?'],
      };
    } else {
      return {
        reply: `📍 **${name}, ${weather.location.country}** में वर्तमान मौसम:\n\n• **तापमान**: ${current.temperature}°C (आभासी: ${current.feelsLike}°C)\n• **स्थिति**: ${current.conditionIcon} ${current.conditionText}\n• **आर्द्रता**: ${current.humidity}%\n• **वायु गति**: ${current.windSpeed} किमी/घंटा\n• **24 घंटे में बारिश की संभावना**: अधिकतम ${analysis.peakRainProbability}% (${analysis.peakRainWindow})`,
        followUps: [`क्या ${name} में बारिश होगी?`, 'कल का मौसम कैसा रहेगा?', 'क्या मुझे छाता रखना चाहिए?'],
      };
    }
  }

  if (language === 'mr') {
    if (q.includes('rain') || q.includes('पाऊस') || q.includes('छत्री')) {
      return {
        reply: analysis.willRain
          ? `🌧️ होय, पुढील २४ तासांत **${name}** येथे पावसाची शक्यता आहे.\n\nसर्वाधिक शक्यता **${analysis.peakRainWindow}** च्या सुमारास **${analysis.peakRainProbability}%** पर्यंत पोहोचेल (अपेक्षित पाऊस: ~${analysis.totalExpectedRainMm} मिमी).\n\n💡 **सल्ला**: या वेळेत बाहेर पडताना छत्री सोबत ठेवणे सोयीचे ठरेल.`
          : `🌤️ पुढील २४ तासांत **${name}** येथे पावसाची विशेष शक्यता नाही.\n\nपावसाची सर्वाधिक शक्यता फक्त **${analysis.peakRainProbability}%** आहे.\n\n💡 **सल्ला**: आज छत्रीची आवश्यकता भासणार नाही!`,
        followUps: ['आज रात्री तापमान किती असेल?', 'आज वाऱ्याचा वेग किती असेल?', 'उद्याचे हवामान कसे असेल?'],
      };
    } else if (q.includes('temp') || q.includes('तापमान') || q.includes('उष्णता') || q.includes('थंडी')) {
      return {
        reply: `🌡️ **${name}** येथे सध्याचे तापमान **${current.temperature}°C** (जाणवणारे: ${current.feelsLike}°C) आहे.\n\n**पुढील २४ तासांतील तापमानाचा कल:**\n• **किमान**: ${analysis.tempMin24h}°C (${analysis.coldestHour} च्या सुमारास)\n• **कमाल**: ${analysis.tempMax24h}°C (${analysis.hottestHour} च्या सुमारास)\n\n💡 **सल्ला**: ${
          current.temperature > 32
            ? 'दुपारच्या वेळी भरपूर पाणी प्या आणि थेट उन्हापासून बचाव करा.'
            : current.temperature < 18
            ? 'सकाळी आणि रात्री हलके उबदार कपडे वापरावेत.'
            : 'हवामान बहुतांश मैदानी कामांसाठी अनुकूल आहे.'
        }`,
        followUps: [`पुढील २४ तासांत ${name} येथे पाऊस पडेल का?`, 'मी छत्री सोबत ठेवायला हवी का?', 'वाऱ्याचा वेग किती आहे?'],
      };
    } else if (q.includes('wind') || q.includes('वारा')) {
      return {
        reply: `💨 **${name}** येथे सध्या वाऱ्याचा वेग **${current.windSpeed} किमी/तास** असून झोके **${current.windGusts} किमी/तास** पर्यंत आहेत.\n\nपुढील २४ तासांत कमाल वेग **${analysis.maxWindSpeedKmH} किमी/तास** राहील.`,
        followUps: ['आज पाऊस पडेल का?', 'आज तापमान किती आहे?', 'उद्याचे हवामान कसे असेल?'],
      };
    } else if (q.includes('tomorrow') || q.includes('उद्या')) {
      const tomorrow = weather.daily[1] || weather.daily[0];
      return {
        reply: `☀️ उद्या **${name}** येथे:\n\n• **स्थिती**: ${tomorrow?.conditionIcon} ${tomorrow?.conditionText}\n• **तापमान**: ${tomorrow?.tempMin}°C ते ${tomorrow?.tempMax}°C\n• **पावसाची शक्यता**: कमाल ${tomorrow?.precipitationProbabilityMax}%`,
        followUps: ['आज रात्री पाऊस पडेल का?', 'आज तापमान किती आहे?', 'मी छत्री सोबत ठेवायला हवी का?'],
      };
    } else {
      return {
        reply: `📍 **${name}, ${weather.location.country}** येथील सद्य हवामान:\n\n• **तापमान**: ${current.temperature}°C (जाणवणारे: ${current.feelsLike}°C)\n• **स्थिती**: ${current.conditionIcon} ${current.conditionText}\n• **आर्द्रता**: ${current.humidity}%\n• **वाऱ्याचा वेग**: ${current.windSpeed} किमी/तास\n• **पुढील २४ तासांत पावसाची शक्यता**: कमाल ${analysis.peakRainProbability}% (${analysis.peakRainWindow})`,
        followUps: [`${name} येथे पाऊस पडेल का?`, 'उद्याचे हवामान कसे असेल?', 'मी छत्री सोबत ठेवायला हवी का?'],
      };
    }
  }

  // Default English
  let reply = '';
  let followUps: string[] = [
    `Will it rain in ${name}?`,
    `What's the temperature tonight in ${name}?`,
    `Should I carry an umbrella?`,
  ];

  if (q.includes('rain') || q.includes('precipitation') || q.includes('umbrella')) {
    if (analysis.willRain) {
      reply = `🌧️ Yes, there is a chance of rain in **${name}** over the next 24 hours.\n\nThe rain probability is highest around **${analysis.peakRainWindow}**, reaching approximately **${analysis.peakRainProbability}%** (expected precipitation: ~${analysis.totalExpectedRainMm} mm).\n\n💡 **Suggestion**: Carrying an umbrella would be a good idea if you are stepping outside during that period.`;
    } else {
      reply = `🌤️ No significant rain is expected in **${name}** over the next 24 hours.\n\nThe peak rain probability is only **${analysis.peakRainProbability}%**, and conditions will remain predominantly ${current.conditionText.toLowerCase()}.\n\n💡 **Suggestion**: You likely won't need an umbrella today!`;
    }
    followUps = [
      `What's the temperature tonight?`,
      `How strong will the wind be today?`,
      `What's the weather tomorrow?`,
    ];
  } else if (q.includes('temp') || q.includes('hot') || q.includes('cold') || q.includes('degrees')) {
    reply = `🌡️ In **${name}**, the current temperature is **${current.temperature}°C** (feels like ${current.feelsLike}°C) with ${current.conditionText.toLowerCase()} skies.\n\n**Next 24 Hours Temperature Trend:**\n• **Coldest**: ${analysis.tempMin24h}°C around ${analysis.coldestHour}\n• **Hottest**: ${analysis.tempMax24h}°C around ${analysis.hottestHour}\n\n💡 **Suggestion**: ${
      current.temperature > 32
        ? 'It will be quite warm today — stay hydrated and seek shade during peak afternoon hours.'
        : current.temperature < 18
        ? 'A light jacket or sweater is recommended for the cooler evening and early morning hours.'
        : 'Pleasant temperatures for most outdoor activities.'
    }`;
    followUps = [
      `Will it rain in ${name} in the next 24 hours?`,
      `Should I carry an umbrella?`,
      `How strong is the wind?`,
    ];
  } else if (q.includes('wind') || q.includes('breeze') || q.includes('gust')) {
    reply = `💨 Wind speeds in **${name}** are currently **${current.windSpeed} km/h** with gusts up to **${current.windGusts} km/h** (direction: ${current.windDirection}°).\n\nOver the next 24 hours, maximum wind speed is expected to reach **${analysis.maxWindSpeedKmH} km/h**.\n\n💡 **Suggestion**: Wind conditions are ${
      current.windSpeed > 25 ? 'breezy to gusty; secure loose outdoor objects.' : 'moderate and comfortable.'
    }`;
    followUps = [
      `Will it rain today?`,
      `What's the temperature today?`,
      `Should I carry an umbrella?`,
    ];
  } else if (q.includes('tomorrow')) {
    const tomorrow = weather.daily[1] || weather.daily[0];
    reply = `☀️ Tomorrow in **${name}** (${tomorrow?.formattedDate || 'Tomorrow'}):\n\n• **Condition**: ${tomorrow?.conditionIcon} ${tomorrow?.conditionText}\n• **Temperature**: ${tomorrow?.tempMin}°C to ${tomorrow?.tempMax}°C\n• **Rain Probability**: up to ${tomorrow?.precipitationProbabilityMax}%\n\n💡 **Suggestion**: ${
      tomorrow?.precipitationProbabilityMax > 40
        ? 'Rain is possible tomorrow, keep rainwear handy.'
        : 'Good conditions expected for outdoor plans.'
    }`;
    followUps = [
      `Will it rain tonight?`,
      `What's the temperature today?`,
      `Should I carry an umbrella?`,
    ];
  } else if (q.includes('tonight') || q.includes('evening') || q.includes('night')) {
    reply = `🌙 Tonight in **${name}**:\n\n• **Expected Temperature**: Dropping towards **${analysis.tempMin24h}°C**\n• **Sky Conditions**: ${current.conditionText}\n• **Humidity**: Around ${current.humidity}%\n• **Rain Probability**: Peak ${analysis.peakRainProbability}%\n\n💡 **Suggestion**: ${
      analysis.tempMin24h < 20 ? 'It may feel cool later tonight; bring a light outer layer if out late.' : 'Comfortable overnight temperatures.'
    }`;
    followUps = [
      `What's the weather tomorrow?`,
      `Will it rain tomorrow?`,
      `What's the temperature today?`,
    ];
  } else {
    reply = `📍 Current weather in **${name}, ${weather.location.country}**:\n\n• **Temperature**: ${current.temperature}°C (Feels like ${current.feelsLike}°C)\n• **Condition**: ${current.conditionIcon} ${current.conditionText}\n• **Humidity**: ${current.humidity}%\n• **Wind**: ${current.windSpeed} km/h\n• **Next 24h Rain Chance**: Peak ${analysis.peakRainProbability}% (${analysis.peakRainWindow})\n\n${analysis.summary}`;
  }

  return { reply, followUps };
}

export async function generateWeatherChatResponse({
  userMessage,
  history = [],
  weatherData,
  language = 'en',
}: {
  userMessage: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  weatherData: WeatherData;
  language?: string;
}): Promise<ChatApiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  const cardData: WeatherSummaryCardData = {
    locationName: weatherData.location.name,
    country: weatherData.location.country,
    temperature: weatherData.current.temperature,
    feelsLike: weatherData.current.feelsLike,
    conditionText: weatherData.current.conditionText,
    conditionIcon: weatherData.current.conditionIcon,
    humidity: weatherData.current.humidity,
    windSpeed: weatherData.current.windSpeed,
    rainProbability: weatherData.analysis24h.peakRainProbability,
    pressure: weatherData.current.pressure,
    visibility: weatherData.current.visibility,
    updatedAt: weatherData.current.timestamp,
  };

  // If Gemini API Key is missing:
  // Provide developer configuration notice + truthful Open-Meteo synthesis
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_key_here') {
    const fallback = synthesizeGroundedWeatherResponse(userMessage, weatherData, language);
    return {
      reply: `⚠️ **Developer Note: Running in Configuration Mode**\n\`GEMINI_API_KEY\` is not set in \`.env.local\`. To enable full multi-turn Gemini reasoning, set \`GEMINI_API_KEY=your_key\` in \`.env.local\`.\n\n*Using live verified Open-Meteo observations & hourly data:*\n\n${fallback.reply}`,
      summaryCard: cardData,
      followUps: fallback.followUps,
      location: weatherData.location,
      isConfigError: true,
    };
  }

  const weatherContext = formatHourlyDataForPrompt(weatherData);

  const voiceCfg = getVoiceConfigForLanguage(language);
  const langInstruction =
    language !== 'en'
      ? `\nCRITICAL LANGUAGE DIRECTIVE: The user has selected ${voiceCfg.name.toUpperCase()} (${voiceCfg.nativeName}). You MUST formulate your "reply" strictly in fluent, natural, polite ${voiceCfg.name} using its authentic native script. Do not translate the response into English. Keep all meteorological metrics, numbers, and proper names accurate. All items in the "followUps" array MUST also be written strictly in ${voiceCfg.name} using its native script.`
      : `\nLanguage: English. Formulate your response in clear, concise English.`;

  const systemPrompt = `You are WeatherGPT, an intelligent, conversational weather assistant built for the WeatherGPT application.
Your role is to answer user questions about current weather, the next 24 hours forecast, rain probabilities, temperature trends, wind, humidity, clothing recommendations, and outdoor activity suitability.
${langInstruction}

CRITICAL TRUTHFULNESS & GROUNDING RULES:
1. The weather data provided below is the ABSOLUTE SOURCE OF TRUTH.
2. DO NOT INVENT or HALLUCINATE any temperatures, rainfall percentages, timings, wind speeds, or conditions.
3. Every numeric value you cite MUST match the retrieved data below.
4. When asked about the "next 24 hours", "today", "tonight", or "when will it rain":
   - Use the NEXT 24 HOURS METRICS and HOURLY TIMELINE.
   - Clearly state whether rain is expected, the highest rain probability, timing windows, and temperature changes.
5. Response Style:
   - Concise, friendly, and easy to scan.
   - Use bullet points for timelines or hourly transitions.
   - Use emojis tastefully (e.g. 🌧️, 🌡️, ☀️, ☔, 💨, 💡). Do NOT overuse emojis.
   - Provide thoughtful, sensible suggestions (e.g. umbrella, clothing, hydration, outdoor plans).
6. Format your output strictly as a JSON object with:
   - "reply": string (your markdown-formatted answer)
   - "followUps": array of 3 short, relevant follow-up questions the user might want to click next
   - "showSummaryCard": boolean (true if the user is asking about general weather or new location, false for quick single-fact follow-ups)

REAL RETRIEVED WEATHER DATA:
${weatherContext}
`;

  // Construct message contents for Gemini
  const contents: any[] = [];

  // Add recent history (up to last 6 turns)
  const recentHistory = history.slice(-6);
  for (const h of recentHistory) {
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    });
  }

  // Add current query
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const modelsToTry = ['gemini-3.6-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Gemini API error with model ${model}:`, res.status, errorText);
        lastError = new Error(`Gemini API returned ${res.status}: ${errorText}`);
        continue;
      }

      const json = await res.json();
      const rawResponse = json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawResponse) {
        throw new Error('Empty response received from Gemini API');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawResponse);
      } catch {
        const clean = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(clean);
      }

      return {
        reply: parsed.reply || rawResponse,
        followUps: Array.isArray(parsed.followUps) ? parsed.followUps.slice(0, 3) : undefined,
        summaryCard: parsed.showSummaryCard !== false ? cardData : undefined,
        location: weatherData.location,
      };
    } catch (err) {
      console.warn(`Attempt with ${model} failed:`, err);
      lastError = err;
    }
  }

  // Fallback to grounded synthesis if Gemini API call failed
  console.error('All Gemini attempts failed:', lastError);
  const fallback = synthesizeGroundedWeatherResponse(userMessage, weatherData, language);
  return {
    reply: `${fallback.reply}\n\n*(Note: Gemini connection error: ${lastError?.message || 'Check API key'}. Live Open-Meteo weather data was used).*`,
    summaryCard: cardData,
    followUps: fallback.followUps,
    location: weatherData.location,
    error: lastError?.message,
  };
}
