// Helios Mark 2 — /api/chat.js (Vercel Serverless Function)
// Kimi K2.5 primary via NVIDIA NIM | Groq llama fallback | Vision support

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const systemPrompt = {
    role: 'system',
    content: `You are Helios — a razor-sharp AI assistant with the helpfulness of a brilliant engineer and the wit of J.A.R.V.I.S. You give genuinely useful, accurate answers while occasionally dropping a dry, clever remark when the moment calls for it. You never ramble. You never hedge unnecessarily. You're direct, confident, and occasionally sardonic — but always in service of the user. When asked something you don't know, admit it cleanly. When the user needs help, you deliver. Think: Tony Stark's AI — capable, a little snarky, completely reliable.`
  };

  const fullMessages = [systemPrompt, ...messages];

  // ─── Try Kimi K2.5 via NVIDIA NIM ───────────────────────────────────────────
  try {
    const kimiFetch = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2.5',
        messages: fullMessages,
        max_tokens: 4096,
        temperature: 0.8,
        top_p: 1.0,
        stream: false,
        chat_template_kwargs: { thinking: false }
      })
    });

    if (kimiFetch.ok) {
      const data = await kimiFetch.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) {
        return res.status(200).json({ reply, model: 'kimi-k2.5' });
      }
    }

    console.warn('Kimi K2.5 failed, status:', kimiFetch.status, '— falling back to Groq');
  } catch (err) {
    console.warn('Kimi K2.5 error:', err.message, '— falling back to Groq');
  }

  // ─── Fallback: Groq llama-3.3-70b ───────────────────────────────────────────
  try {
    // Strip vision content for Groq (it doesn't support images)
    const groqMessages = fullMessages.map(m => {
      if (Array.isArray(m.content)) {
        const textOnly = m.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
        return { ...m, content: textOnly };
      }
      return m;
    });

    const groqFetch = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 2048,
        temperature: 0.7
      })
    });

    if (!groqFetch.ok) {
      const err = await groqFetch.json();
      return res.status(groqFetch.status).json({ error: err });
    }

    const data = await groqFetch.json();
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply, model: 'groq-fallback' });

  } catch (error) {
    console.error('Both providers failed:', error);
    return res.status(500).json({ error: 'Both Kimi and Groq are unreachable. Try again.' });
  }
}
