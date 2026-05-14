import { RatingStars } from "../common/RatingStars.jsx";

export const ReviewList = ({ reviews = [] }) => {
  if (!reviews.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
        No reviews yet. Be the first to share how it fits into your routine.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review._id} className="rounded-[24px] border border-slate-200 bg-white px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-ink-950">{review.user?.name || "Verified buyer"}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            <RatingStars rating={review.rating || 0} compact />
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Helpful votes: {review.helpful || 0}
          </p>
        </article>
      ))}
    </div>
  );
};
