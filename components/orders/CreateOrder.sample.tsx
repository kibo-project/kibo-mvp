import { useCreateOrder } from '../../hooks/orders/useCreateOrder';
import { useState } from 'react';

const CreateOrder = () => {
  const createOrder = useCreateOrder();
  const [quoteId, setQuoteId] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createOrder.mutateAsync({
        fiatAmount: 100,
        cryptoAmount: 6.06,
        recipient: "Recipient name",
        description: "Payment description",
      });
      alert('Order created successfully!');
      setQuoteId('');
      setQrImageUrl('');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Order</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Quote ID:
            <input
              type="text"
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            QR Image URL:
            <input
              type="text"
              value={qrImageUrl}
              onChange={(e) => setQrImageUrl(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default CreateOrder;