// src/utils/validators.js
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validatePassword = (password) => {
    // At least 8 characters, containing letters and numbers
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  };
  
  const validateISBN = (isbn) => {
    // Basic check for ISBN-10 or ISBN-13
    isbn = isbn.replace(/[-\s]/g, '');
    return /^(\d{10}|\d{13})$/.test(isbn);
  };
  
  // src/utils/dateUtils.js
  const getFormattedDate = (date) => {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  };
  
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  const daysDifference = (dateA, dateB) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = Math.abs(new Date(dateA) - new Date(dateB));
    return Math.round(diffMs / msPerDay);
  };
  
  module.exports = {
    validateEmail,
    validatePassword,
    validateISBN,
    getFormattedDate,
    addDays,
    daysDifference
  };