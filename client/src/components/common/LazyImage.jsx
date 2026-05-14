import { useIntersectionObserver } from "../../hooks/useIntersectionObserver.js";

export const LazyImage = ({
  src,
  alt,
  className = "",
  wrapperClassName = "",
}) => {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <div ref={ref} className={wrapperClassName}>
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={className}
        />
      ) : (
        <div className={`animate-pulse rounded-[24px] bg-sand-100 ${className}`} />
      )}
    </div>
  );
};
