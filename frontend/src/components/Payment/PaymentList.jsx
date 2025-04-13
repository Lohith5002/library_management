import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(`/payments/user/${user.id}`);
        setPayments(response.data.payments);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch payments');
      }
    };
    fetchPayments();
  }, [user]);

  return (
    <div className="payment-list">
      <h2>Your Payments</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {payments.map((payment) => (
          <li key={payment.PaymentID}>
            {payment.BookTitle || 'Fine Payment'} - Amount: ${payment.AmountPaid} - 
            Method: {payment.PaymentMethod} - Date: {new Date(payment.PaymentDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentList;