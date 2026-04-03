import type { Book } from "../types/Book";

/** Base API URL without trailing slash. Set VITE_API_URL in .env.production for Azure. */
function getApiRoot(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const base = (raw?.trim() || "http://localhost:5029").replace(/\/+$/, "");
  return `${base}/api`;
}

export async function fetchBooks(): Promise<Book[]> {
  const response = await fetch(`${getApiRoot()}/books`);

  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.status}`);
  }

  return response.json();
}

export async function fetchBook(id: number): Promise<Book> {
  const response = await fetch(`${getApiRoot()}/books/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch book: ${response.status}`);
  }

  return response.json();
}

export async function createBook(book: Omit<Book, "bookID">): Promise<Book> {
  const payload: Book = { ...book, bookID: 0 };
  const response = await fetch(`${getApiRoot()}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to create book: ${response.status}`);
  }

  return response.json();
}

export async function updateBook(book: Book): Promise<void> {
  const response = await fetch(`${getApiRoot()}/books/${book.bookID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to update book: ${response.status}`);
  }
}

export async function deleteBook(id: number): Promise<void> {
  const response = await fetch(`${getApiRoot()}/books/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete book: ${response.status}`);
  }
}
