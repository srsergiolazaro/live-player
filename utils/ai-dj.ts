import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Song } from "../types";

const VOICE_OPTIONS = `
achernar, achird, algenib, algieba, alnilam, aoede, autonoe, callirrhoe, 
charon, despina, enceladus, erinome, fenrir, gacrux, iapetus, kore, 
laomedeia, leda, orus, puck, pulcherrima, rasalgethi, sadachbia, 
sadaltager, schedar, sulafat, umbriel, vindemiatrix, zephyr, zubenelgenubi
`;

// Helper: Audio Decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Clean Voice Name
function cleanVoiceName(name: string): string {
  if (!name) return 'fenrir';
  return name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
}

// Interface for the LLM Analysis Result
interface DjAnalysis {
  mood: string;
  speaker1: {
    name: string; 
    voiceName: string; 
    roleDescription: string;
  };
  speaker2: {
    name: string;
    voiceName: string;
    roleDescription: string;
  };
  stylePrompt: string; 
  dialogueLines: string[]; 
}

// 1. Analyze Songs & Generate Script Config
async function analyzeAndGenerateScript(prevSong: Song, nextSong: Song): Promise<DjAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    You are the Host/Streamer of "Radio Blom LIVE", a popular music stream on Twitch/YouTube.
    
    Current transition:
    1. Ending: "${prevSong.title}" by ${prevSong.artist}
    2. Starting: "${nextSong.title}" by ${nextSong.artist}

    AVAILABLE VOICE NAMES (Pick from this list ONLY):
    ${VOICE_OPTIONS}

    YOUR TASKS:
    1. ANALYZE the mood transition.
    2. SELECT 2 distinct voice names from the list above.
    3. CREATE names (e.g., "StreamerMax", "ModChat", "DJ Blom").
    4. WRITE a "Style Prompt".
    5. WRITE a short, natural dialogue (max 4 lines) in Latin American Spanish.
    6. CRITICAL: Act like you are LIVE. 
       - Reference "the chat", "viewers", "subs", "hype train" or "emotes".
       - Example: "¡El chat está reventando con ese tema!", "Gracias por el sub, @usuario!", "¡Pongan esos emotes de fuego!".
    
    OUTPUT JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            speaker1: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                voiceName: { type: Type.STRING },
                roleDescription: { type: Type.STRING }
              }
            },
            speaker2: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                voiceName: { type: Type.STRING },
                roleDescription: { type: Type.STRING }
              }
            },
            stylePrompt: { type: Type.STRING },
            dialogueLines: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as DjAnalysis;

  } catch (error) {
    console.error("Error analyzing DJ script:", error);
    // Fallback defaults
    return {
      mood: "Generic",
      speaker1: { name: "Blom", voiceName: "fenrir", roleDescription: "Host" },
      speaker2: { name: "ChatBot", voiceName: "kore", roleDescription: "AI Mod" },
      stylePrompt: "Make Blom sound excited and ChatBot sound robotic but friendly:",
      dialogueLines: [
        "Blom: ¡Wow, el chat dice que aman esta canción!",
        `ChatBot: Confirmado. La siguiente pista, ${nextSong.title}, tiene un 99% de aprobación.`
      ]
    };
  }
}

// 2. Generate the Audio
export async function generateDJInterlude(prevSong: Song, nextSong: Song): Promise<Song | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // A. Get the analysis and script
    const analysis = await analyzeAndGenerateScript(prevSong, nextSong);
    console.log("DJ Analysis:", analysis);

    // B. Construct the final Text Prompt for the TTS model
    const fullTextPrompt = `
TTS the following conversation between ${analysis.speaker1.name} and ${analysis.speaker2.name}:
${analysis.stylePrompt}
${analysis.dialogueLines.join('\n')}
    `.trim();

    // Clean voice names
    const voice1 = cleanVoiceName(analysis.speaker1.voiceName);
    const voice2 = cleanVoiceName(analysis.speaker2.voiceName);

    // C. Call TTS with Dynamic Multi-Speaker Config
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: fullTextPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                    {
                        speaker: analysis.speaker1.name,
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: voice1 }
                        }
                    },
                    {
                        speaker: analysis.speaker2.name,
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: voice2 }
                        }
                    }
              ]
            }
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) throw new Error("No audio data received");

    // Convert Base64 to Blob URL
    const audioBytes = decode(base64Audio);
    const wavBytes = addWavHeader(audioBytes, 24000, 1);
    const wavBlob = new Blob([wavBytes], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(wavBlob);

    return {
      id: `dj-${Date.now()}`,
      title: `LIVE: ${analysis.mood}`,
      artist: `${analysis.speaker1.name} ft. Chat`,
      duration: '00:20',
      url: audioUrl,
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
      type: 'voice',
      color: 'bg-red-900'
    };

  } catch (error) {
    console.error("DJ Generation failed:", error);
    return null;
  }
}

// WAV Header Helper
function addWavHeader(samples: Uint8Array, sampleRate: number, numChannels: number) {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length, true);

  const dataView = new Uint8Array(buffer, 44);
  dataView.set(samples);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}