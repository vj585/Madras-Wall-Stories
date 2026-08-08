"use client";
import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function StarRatingForm({ productId }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRate = async (selectedRating) => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    setRating(selectedRating);
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating: selectedRating })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || 'Failed to submit rating');
        setRating(0);
      } else {
        setIsError(false);
        setMessage('Thank you for rating!');
        router.refresh(); // Refresh page data to show new average rating
      }
    } catch (err) {
      setIsError(true);
      setMessage('An error occurred.');
      setRating(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-3xl p-8 border">
      <h3 className="font-heading font-bold text-xl mb-2">Rate this Poster</h3>
      <p className="text-gray-500 text-sm mb-4">Click a star to leave your rating</p>
      
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={isSubmitting || (!isError && message === 'Thank you for rating!')}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => handleRate(star)}
            className="transition-transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed focus:outline-none"
          >
            <Star 
              className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${
                (hoveredStar || rating) >= star 
                  ? 'fill-accent-yellow text-accent-yellow' 
                  : 'text-gray-300'
              }`} 
            />
          </button>
        ))}
      </div>
      
      {isSubmitting && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</div>}
      
      {message && (
        <p className={`text-sm font-medium ${isError ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

