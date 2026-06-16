const API_URL = 'http://localhost:3000';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('@Newsletter:token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      // Se der não autorizado, limpamos o token
      localStorage.removeItem('@Newsletter:token');
      localStorage.removeItem('@Newsletter:user');
    }
    throw new Error(data?.message || 'Erro na requisição');
  }

  return data;
};
