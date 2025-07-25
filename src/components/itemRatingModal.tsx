import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import Button from './Button';

interface ItemRatingModalProps {
  isOpen: boolean;
  itemName: string;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  initialRating?: number;
  initialReview?: string;
}

const ItemRatingModal: React.FC<ItemRatingModalProps> = ({ isOpen, itemName, onClose, onSubmit, initialRating = 0, initialReview = '' }) => {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState(initialReview);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setReview(initialReview);
  }, [isOpen, initialRating, initialReview]);

  const handleStarClick = (star: number) => setRating(star);
  const handleStarHover = (star: number) => setHovered(star);
  const handleStarLeave = () => setHovered(0);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await onSubmit(rating, review);
    setSubmitting(false);
    setRating(0);
    setReview('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rate your {itemName}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="focus:outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={32}
                    className={
                      (hovered || rating) >= star
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow'
                        : 'text-gray-300'
                    }
                    fill={(hovered || rating) >= star ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded-lg p-2 mb-4 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Write your review (optional)"
              value={review}
              onChange={e => setReview(e.target.value)}
              maxLength={300}
            />
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="w-full mt-2"
              variant="primary"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemRatingModal; 