import textToSpeech from '@google-cloud/text-to-speech';

export async function POST(req) {
  try {
    // 1. Verify Passcode Configuration
    const expectedPasscode = process.env.APP_ACCESS_PASSCODE;
    if (!expectedPasscode) {
      console.error('Error: APP_ACCESS_PASSCODE environment variable is not defined.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Passcode is not configured.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Authenticate Request
    const accessToken = req.headers.get('x-access-token');
    if (!accessToken || accessToken !== expectedPasscode) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid access passcode.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify Google Cloud Credentials Configuration
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      console.error('Error: Google Cloud credentials environment variables are missing.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Google Cloud credentials are not set.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Parse & Validate Payload
    const body = await req.json().catch(() => ({}));
    const { text, voiceCode } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Bad Request: Text content is required and must be a string.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (text.length > 4000) {
      return new Response(
        JSON.stringify({ error: 'Bad Request: Text is too long. Limit is 4000 characters.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!voiceCode || typeof voiceCode !== 'string' || !voiceCode.startsWith('vi-VN-')) {
      return new Response(
        JSON.stringify({ error: 'Bad Request: A valid Vietnamese voice code must be selected.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Initialize Google Cloud TTS Client
    // We parse the private key string to handle standard newline escapes in env variables
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    const client = new textToSpeech.TextToSpeechClient({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      projectId: projectId,
    });

    // 6. Synthesize Speech
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'vi-VN',
        name: voiceCode,
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    });

    if (!response.audioContent) {
      throw new Error('No audio content returned from Google Cloud TTS API.');
    }

    // 7. Stream Audio Binary back to Client
    return new Response(response.audioContent, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': response.audioContent.length.toString(),
      },
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to convert text to speech: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
