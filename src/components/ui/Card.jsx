/**
 * Reusable Card Container Component
 */
export function Card({
  children,
  className = '',
  padding = 'p-5',
  ...props
}) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-xl shadow-xs transition-shadow ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
