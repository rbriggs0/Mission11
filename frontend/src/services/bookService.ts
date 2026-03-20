import type { Book } from "../types/Book";

const API_BASE = "http://localhost:5029/api";

export async function fetchBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE}/books`);

  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.status}`);
  }

  return response.json();
}
