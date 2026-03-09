/**
 * API client for the Rock Insurance RAG backend.
 *
 * All requests are proxied through Next.js rewrites
 * (see next.config.js) so we use relative "/api/..." paths.
 */

const API_BASE = "/api";

interface SignupPayload {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  username: string;
  full_name: string | null;
}

interface ChatResponseData {
  answer: string;
  sources: string[];
  session_id: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  /**
   * Register a new user.
   */
  async signup(payload: SignupPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<TokenResponse>(res);
  },

  /**
   * Authenticate with username & password.
   */
  async login(username: string, password: string): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<TokenResponse>(res);
  },

  /**
   * Send a question to the RAG pipeline.
   */
  async chat(
    question: string,
    token: string,
    sessionId?: string | null
  ): Promise<ChatResponseData> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        session_id: sessionId || undefined,
      }),
    });
    return handleResponse<ChatResponseData>(res);
  },

  /**
   * Retrieve chat history for the current user.
   */
  async getChatHistory(token: string, sessionId?: string) {
    const params = new URLSearchParams();
    if (sessionId) params.set("session_id", sessionId);

    const res = await fetch(`${API_BASE}/chat/history?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<any[]>(res);
  },

  /**
   * Trigger document ingestion.
   */
  async ingest(token: string) {
    const res = await fetch(`${API_BASE}/ingest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ message: string; chunks_created: number }>(res);
  },

  /**
   * Fetch the company portal markdown content (no auth required).
   */
  async portal(): Promise<string> {
    const res = await fetch(`${API_BASE}/portal`);
    if (!res.ok) {
      throw new Error(`Failed to load portal content (${res.status})`);
    }
    return res.text();
  },

  /**
   * Health check.
   */
  async health() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; service: string }>(res);
  },
};
