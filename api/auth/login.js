function getBackendUrl(path) {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    throw new Error('API_BASE_URL nao foi configurada na Vercel.');
  }

  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body || '{}');
  }

  return {};
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Metodo nao permitido.' });
  }

  try {
    const body = await readBody(req);
    const response = await fetch(getBackendUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await readJsonResponse(response);
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      message: error?.message || 'Erro ao conectar com a API.',
    });
  }
}
