import React, { useState, useEffect } from "react";
import api from "../../services/api";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.categories);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="category-list">
      <h2>Categories</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {categories.map((category) => (
          <li key={category.CategoryID}>
            <b>
              {category.CategoryID} - {category.CategoryName}
            </b>{" "}
            - {category.Description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryList;
