import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // George

const audioCache = new Map<string, Buffer>();

export async function POST(request: Request) {
  const { text, voiceId } = (await request.json()) as {
    text?: string;
    voiceId?: string;
  };

  if (!text || typeof text !== "string") {
    return Response.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ELEVENLABS_API_KEY not configured" },
      { status: 500 },
    );
  }

  const resolvedVoice =
    voiceId ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
  const cacheKey = `${resolvedVoice}::${text}`;

  const cached = audioCache.get(cacheKey);
  if (cached) {
    return new Response(new Uint8Array(cached), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const client = new ElevenLabsClient({ apiKey });

    const audioStream = await client.textToSpeech.stream(resolvedVoice, {
      text,
      modelId: "eleven_flash_v2_5",
      outputFormat: "mp3_44100_128",
    });

    const chunks: Uint8Array[] = [];
    const reader = (audioStream as unknown as ReadableStream<Uint8Array>).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);
    audioCache.set(cacheKey, buffer);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Cache": "MISS",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown ElevenLabs error";
    const body =
      err && typeof err === "object" && "body" in err
        ? (err as { body: unknown }).body
        : undefined;
    console.error("ElevenLabs error:", err);
    return Response.json(
      { error: message, body },
      { status: 502 },
    );
  }
}
