/**
 * Reusable Form Input Component
 */
export function Input({
  label,
  error,
  hint,
  id,
  type = 'text',
  className = '',
  disabled = false,
  required = false,
  value,
  onChange,
  placeholder,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
          <span>
            {label} {required && <span className="text-[#EF4444]">*</span>}
          </span>
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 ${
          error ? 'border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#CBD5E1] hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {hint && !error && (
        <span className="text-[11px] text-[#64748B]">{hint}</span>
      )}
      {error && (
        <span className="text-[11px] font-medium text-[#EF4444]">{error}</span>
      )}
    </div>
  );
}

export default Input;
