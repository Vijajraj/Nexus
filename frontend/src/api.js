const API = "http://localhost:8000";

export async function fetchRankings() {
  const res = await fetch(`${API}/rankings`);
  if (!res.ok) throw new Error(`Failed to fetch rankings: ${res.status}`);
  return res.json();
}

export async function fetchPerson(personId) {
  const res = await fetch(`${API}/person/${personId}`);
  if (!res.ok) throw new Error(`Person not found: ${res.status}`);
  return res.json();
}
