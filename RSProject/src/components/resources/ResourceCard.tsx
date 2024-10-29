import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { ReviewForm } from '../reviews/ReviewForm';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Resource, Review } from '../../types';
import { toast } from 'react-hot-toast';

interface ResourceCardProps {
  resource: Resource;
  showActions?: boolean;
}

export function ResourceCard({ resource, showActions = true }: ResourceCardProps) {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  React.useEffect(() => {
    fetchReviews();
  }, [resource.id]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('resource_id', resource.id);

    if (error) {
      toast.error('Failed to load reviews');
      return;
    }

    setReviews(data);
    if (data.length > 0) {
      const avg = data.reduce((acc, review) => acc + review.rating, 0) / data.length;
      setAverageRating(Math.round(avg * 10) / 10);
    }
  };

  const handleReviewSubmit = async (data: { rating: number; comment: string }) => {
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    const { error } = await supabase
      .from('reviews')
      .insert([{
        resource_id: resource.id,
        user_id: user.id,
        rating: data.rating,
        comment: data.comment
      }]);

    if (error) {
      toast.error('Failed to submit review');
      return;
    }

    toast.success('Review submitted successfully');
    setShowReviewForm(false);
    fetchReviews();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{resource.category}</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-600">
              {averageRating || 'No ratings'}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            resource.status === 'approved' ? 'bg-green-100 text-green-800' :
            resource.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {resource.status}
          </span>
        </div>
      </div>
      
      <p className="mt-4 text-gray-600">{resource.description}</p>
      
      <a 
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
      >
        Visit Resource →
      </a>

      {showActions && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center text-gray-500 hover:text-indigo-500"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Add Review
            </button>
          </div>

          {showReviewForm && (
            <div className="mt-4">
              <ReviewForm onSubmit={handleReviewSubmit} />
            </div>
          )}

          {reviews.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-gray-900">Reviews</h4>
              {reviews.map((review) => (
                <div key={review.id} className="border-t pt-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}