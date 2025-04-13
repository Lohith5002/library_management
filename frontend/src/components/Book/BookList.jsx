import React, { useState, useEffect } from "react";
import api from "../../services/api";

function BookList() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    available: false,
    categoryId: "",
  });

  // Fetch books whenever filters change
  useEffect(() => {
    fetchBooks();
  }, [filters]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Make sure we're passing the categoryId correctly
      const params = {
        ...filters,
        // Some APIs might expect category_id instead of categoryId
        // or use different field name for category filtering
        categoryId: filters.categoryId || undefined,
      };

      console.log("Fetching books with params:", params);

      const response = await api.get("/books", { params });
      setBooks(response.data.books);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (e) => {
    const categoryId = e.target.value;
    console.log("Selected category ID:", categoryId);
    setFilters({ ...filters, categoryId });
  };

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      title: "",
      author: "",
      available: false,
      categoryId: "",
    });
  };

  return (
    <div className="book-list">
      <h2>Books</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Title"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Author"
          value={filters.author}
          onChange={(e) => setFilters({ ...filters, author: e.target.value })}
        />

        <div className="filter-container">
          <label htmlFor="category-select">Category: </label>
          <select
            id="category-select"
            value={filters.categoryId}
            onChange={handleCategorySelect}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.CategoryID} value={category.CategoryID}>
                {category.CategoryName}
              </option>
            ))}
          </select>
        </div>

        <label>
          <input
            type="checkbox"
            checked={filters.available}
            onChange={(e) =>
              setFilters({ ...filters, available: e.target.checked })
            }
          />
          Available Only
        </label>

        <button type="button" onClick={resetFilters} className="reset-button">
          Reset Filters
        </button>
      </div>

      {loading ? (
        <p>Loading books...</p>
      ) : (
        <>
          <p>{books.length} books found</p>
          <ul>
            {books.map((book) => (
              <li key={book.BookID}>
                <b>
                  ID: {book.BookID} - {book.Title}
                </b>{" "}
                by {book.Author} - {book.AvailableCopies} available
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default BookList;
