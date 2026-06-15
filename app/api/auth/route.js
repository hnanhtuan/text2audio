export async function POST(req) {
  try {
    const expectedPasscode = process.env.APP_ACCESS_PASSCODE;
    if (!expectedPasscode) {
      console.error('Error: APP_ACCESS_PASSCODE environment variable is not defined.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Passcode is not configured.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { passcode } = body;

    if (!passcode) {
      return new Response(
        JSON.stringify({ error: 'Passcode is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (passcode === expectedPasscode) {
      return new Response(
        JSON.stringify({ success: true, message: 'Authenticated successfully.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Incorrect passcode.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication check failed: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
