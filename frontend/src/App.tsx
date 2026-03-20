import { useEffect, useMemo, useState } from "react";
import type { Book } from "./types/Book";
import { fetchBooks } from "./services/bookService";

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchBooks();
        setBooks(data);
      } catch {
        setError("Failed to load books from API.");
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const sortedBooks = useMemo(() => {
    const copy = [...books];
    copy.sort((a, b) => {
      const result = a.title.localeCompare(b.title);
      return sortOrder === "asc" ? result : -result;
    });
    return copy;
  }, [books, sortOrder]);

  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const pagedBooks = sortedBooks.slice(startIndex, startIndex + booksPerPage);

  const handleBooksPerPageChange = (value: number) => {
    setBooksPerPage(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  return (
    <div className="container my-4">
      <h1 className="mb-3">Online Bookstore</h1>

      {loading && <div className="alert alert-info">Loading books...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          <p className="text-muted">Total books loaded: {books.length}</p>

          <div className="row g-3 mb-3">
            <div className="col-auto">
              <label className="form-label me-2">Books per page:</label>
              <select
                className="form-select"
                value={booksPerPage}
                onChange={(e) => handleBooksPerPageChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            <div className="col-auto">
              <label className="form-label me-2">Sort by title:</label>
              <select
                className="form-select"
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value as "asc" | "desc")}
              >
                <option value="asc">A to Z</option>
                <option value="desc">Z to A</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Publisher</th>
                  <th>ISBN</th>
                  <th>Classification</th>
                  <th>Category</th>
                  <th>Pages</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {pagedBooks.map((b) => (
                  <tr key={b.bookID}>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.publisher}</td>
                    <td>{b.isbn}</td>
                    <td>{b.classification}</td>
                    <td>{b.category}</td>
                    <td>{b.pageCount}</td>
                    <td>${b.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="fw-semibold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;