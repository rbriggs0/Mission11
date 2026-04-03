import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Book } from "./types/Book";
import {
  createBook,
  deleteBook,
  fetchBooks,
  updateBook,
} from "./services/bookService";

const emptyForm = (): Book => ({
  bookID: 0,
  title: "",
  author: "",
  publisher: "",
  isbn: "",
  classification: "",
  category: "",
  pageCount: 1,
  price: 0,
});

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Book>(emptyForm());
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError("");
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch {
      setError("Failed to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startAdd = () => {
    setForm(emptyForm());
    setIsNew(true);
  };

  const startEdit = (book: Book) => {
    setForm({ ...book });
    setIsNew(false);
  };

  const handleChange = (field: keyof Book, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        await createBook({
          title: form.title,
          author: form.author,
          publisher: form.publisher,
          isbn: form.isbn,
          classification: form.classification,
          category: form.category,
          pageCount: form.pageCount,
          price: form.price,
        });
      } else {
        await updateBook(form);
      }
      await load();
      startAdd();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) {
      return;
    }
    setError("");
    try {
      await deleteBook(id);
      await load();
      if (!isNew && form.bookID === id) {
        startAdd();
      }
    } catch {
      setError("Delete failed.");
    }
  };

  return (
    <div className="container-fluid my-4">
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="mb-0">Admin — Books</h1>
          <Link className="btn btn-outline-primary btn-sm" to="/">
            Back to store
          </Link>
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card">
              <div className="card-header">
                {isNew ? "Add book" : `Edit book #${form.bookID}`}
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-2">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Author</label>
                    <input
                      className="form-control"
                      value={form.author}
                      onChange={(e) => handleChange("author", e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Publisher</label>
                    <input
                      className="form-control"
                      value={form.publisher}
                      onChange={(e) => handleChange("publisher", e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">ISBN</label>
                    <input
                      className="form-control"
                      value={form.isbn}
                      onChange={(e) => handleChange("isbn", e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Classification</label>
                    <input
                      className="form-control"
                      value={form.classification}
                      onChange={(e) =>
                        handleChange("classification", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Category</label>
                    <input
                      className="form-control"
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <label className="form-label">Pages</label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        value={form.pageCount}
                        onChange={(e) =>
                          handleChange("pageCount", Number(e.target.value))
                        }
                        required
                      />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="form-control"
                        value={form.price}
                        onChange={(e) =>
                          handleChange("price", Number(e.target.value))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Saving…" : isNew ? "Create" : "Update"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={startAdd}
                    >
                      Clear / New
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="table-responsive">
              <table className="table table-striped table-bordered align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.bookID}>
                      <td>{b.bookID}</td>
                      <td>{b.title}</td>
                      <td>{b.category}</td>
                      <td>${b.price.toFixed(2)}</td>
                      <td className="text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => startEdit(b)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(b.bookID, b.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
