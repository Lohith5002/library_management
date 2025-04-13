import React, { useState } from 'react';
import api from '../../services/api';

function CategoryForm({ onCategoryAdded }) {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', formData);
      setFormData({ categoryName: '', description: '' });
      onCategoryAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  return (
    <div className="category-form">
      <h3>Add New Category</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={formData.categoryName}
          onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
          placeholder="Category Name"
          required
        />
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description"
        />
        <button type="submit">Add Category</button>
      </form>
    </div>
  );
}

export default CategoryForm;