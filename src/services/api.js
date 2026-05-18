const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_PROXY = import.meta.env.PROD || !API_BASE_URL;

function getApiUrl(path) {
  if (USE_PROXY) {
    return `/api${path}`;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

async function request(path, options = {}) {
  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      'Não foi possível concluir a solicitação. Tente novamente.';
    throw new Error(message);
  }

  return data;
}

export function login({ matricula, senha }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ matricula, senha }),
  });
}

export function saveWhatsappSession({ accessToken, phone }) {
  return request('/whatsapp/session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ phone }),
  });
}
