import axios from 'axios';

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const { message } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Make a request to the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003', // You can choose a different model here if needed
        prompt: message,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Extract the response from OpenAI
    const botMessage = response.data.choices[0].text.trim();

    // Return the bot's message in the response
    return new Response(
      JSON.stringify({ message: botMessage }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error communicating with OpenAI:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch response from ChatGPT" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
