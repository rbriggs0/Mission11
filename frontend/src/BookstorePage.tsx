import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Book } from "./types/Book";
import { fetchBooks } from "./services/bookService";

type CartItem = Book & {
  quantity: number;
};

type ViewMode = "list" | "cart";

export default function BookstorePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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

  useEffect(() => {
    const savedCart = sessionStorage.getItem("mission12_cart");
    const savedView = sessionStorage.getItem("mission12_view_mode") as ViewMode | null;
    const savedPage = sessionStorage.getItem("mission12_page");
    const savedPageSize = sessionStorage.getItem("mission12_page_size");
    const savedSort = sessionStorage.getItem("mission12_sort") as "asc" | "desc" | null;
    const savedCategory = sessionStorage.getItem("mission12_category");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedView === "list" || savedView === "cart") {
      setViewMode(savedView);
    }
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
    if (savedPageSize) {
      setBooksPerPage(Number(savedPageSize));
    }
    if (savedSort === "asc" || savedSort === "desc") {
      setSortOrder(savedSort);
    }
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("mission12_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    sessionStorage.setItem("mission12_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    sessionStorage.setItem("mission12_page", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    sessionStorage.setItem("mission12_page_size", booksPerPage.toString());
  }, [booksPerPage]);

  useEffect(() => {
    sessionStorage.setItem("mission12_sort", sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    sessionStorage.setItem("mission12_category", selectedCategory);
  }, [selectedCategory]);

  const categories = useMemo(() => {
    const values = new Set(books.map((b) => b.category));
    return ["All", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === "All") return books;
    return books.filter((b) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  const sortedBooks = useMemo(() => {
    const copy = [...filteredBooks];
    copy.sort((a, b) => {
      const result = a.title.localeCompare(b.title);
      return sortOrder === "asc" ? result : -result;
    });
    return copy;
  }, [filteredBooks, sortOrder]);

  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const pagedBooks = sortedBooks.slice(startIndex, startIndex + booksPerPage);
  const safePage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [safePage, currentPage]);

  const handleBooksPerPageChange = (value: number) => {
    setBooksPerPage(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const addToCart = (book: Book) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.bookID === book.bookID);
      if (existing) {
        return prev.map((item) =>
          item.bookID === book.bookID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });

    setViewMode("cart");
  };

  const updateQuantity = (bookID: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.bookID !== bookID));
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.bookID === bookID ? { ...item, quantity } : item
      )
    );
  };

  const goToCart = () => setViewMode("cart");
  const continueShopping = () => setViewMode("list");

  return (
    <div className="container-fluid my-4">
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="mb-0">Online Bookstore</h1>
          <div className="d-flex align-items-center gap-2">
            <Link className="btn btn-outline-secondary btn-sm" to="/adminbooks">
              Admin books
            </Link>
            <button
              type="button"
              className={`btn position-relative ${viewMode === "cart" ? "btn-secondary" : "btn-primary"}`}
              onClick={viewMode === "cart" ? continueShopping : goToCart}
            >
              {viewMode === "cart" ? "Back to Books" : "Cart"}
              <span className="badge rounded-pill text-bg-warning ms-2">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading books...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row g-4">
          <div className="col-lg-8">
            {viewMode === "list" ? (
              <>
                <p className="text-muted">
                  Showing {sortedBooks.length} book(s) in category:{" "}
                  <span className="badge text-bg-info">{selectedCategory}</span>
                </p>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6 col-lg-3">
                    <label className="form-label">Books per page:</label>
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

                  <div className="col-sm-6 col-lg-3">
                    <label className="form-label">Sort by title:</label>
                    <select
                      className="form-select"
                      value={sortOrder}
                      onChange={(e) => handleSortChange(e.target.value as "asc" | "desc")}
                    >
                      <option value="asc">A to Z</option>
                      <option value="desc">Z to A</option>
                    </select>
                  </div>

                  <div className="col-sm-12 col-lg-6">
                    <label className="form-label">Filter by category:</label>
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-striped table-bordered table-hover align-middle">
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
                        <th>Add</th>
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
                          <td>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => addToCart(b)}
                            >
                              Add to Cart
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={safePage === 1}
                  >
                    Previous
                  </button>

                  <span className="fw-semibold">
                    Page {safePage} of {Math.max(totalPages, 1)}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={safePage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-3">Shopping Cart</h3>
                {cart.length === 0 ? (
                  <div className="alert alert-secondary">Your cart is empty.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Title</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.bookID}>
                            <td>{item.title}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td style={{ maxWidth: "120px" }}>
                              <input
                                type="number"
                                className="form-control"
                                min={0}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(item.bookID, Number(e.target.value))
                                }
                              />
                            </td>
                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button type="button" className="btn btn-outline-secondary" onClick={continueShopping}>
                  Continue Shopping
                </button>
              </>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: "1rem" }}>
              <div className="card-header">Cart Summary</div>
              <div className="card-body">
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Items</span>
                    <strong>{cartItemCount}</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Total</span>
                    <strong>${cartTotal.toFixed(2)}</strong>
                  </li>
                </ul>

                <button type="button" className="btn btn-primary w-100" onClick={goToCart}>
                  View Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
