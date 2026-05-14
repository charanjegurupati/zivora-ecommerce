import { Star } from "lucide-react";

export const RatingStars = ({ rating = 0, count = 0, compact = false }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-1 text-honey-500">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = rating >= index + 1 || rating > index + 0.4;
        return (
          <Star
            key={index}
            size={compact ? 14 : 16}
            className={filled ? "fill-current" : ""}
          />
        );
      })}
    </div>
    <span className="text-xs font-medium text-slate-500">
      {rating.toFixed(1)}{count ? ` (${count})` : ""}
    </span>
  </div>
);
