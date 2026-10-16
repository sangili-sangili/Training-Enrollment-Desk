/**
 * Reusable Status & Tag Badge Component
 * Matches the approved UI reference pill designs
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  const variantStyles = {
    Confirmed: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    Waitlisted: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    Offered: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
    Cancelled: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
    'In Progress': 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
    Upcoming: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
    teal: 'bg-teal-50 text-[#009688] border border-teal-200',
    default: 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
