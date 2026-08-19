/**
 * Nexus Risk Intelligence — API Client
 * Interfaces with FastAPI backend at /rankings and /person/{id}
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Fetch all subject rankings sorted by risk_score descending.
 * @returns {Promise<Array>} List of subject dossier records with assigned ranks.
 */
export async function fetchRankings() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}/rankings`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Request to Nexus API timed out after 8 seconds");
    }
    throw err;
  }
}

/**
 * Fetch individual person dossier by ID.
 * @param {string} personId - Subject ID (e.g. "p_001")
 * @returns {Promise<Object>} Single subject dossier record with top factors and evidence.
 */
export async function fetchPerson(personId) {
  if (!personId) {
    throw new Error("Person ID is required");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}/person/${encodeURIComponent(personId)}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (response.status === 404) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Subject '${personId}' not found`);
    }

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Request to Nexus API timed out after 8 seconds");
    }
    throw err;
  }
}

/**
 * Health check to verify API connectivity.
 * @returns {Promise<boolean>} True if reachable, false otherwise.
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/rankings`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}
