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
        <label htmlFor={inputId} className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 flex items-center justify-between">
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
        className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1A2949] border rounded-lg text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 ${
          error ? 'border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#CBD5E1] dark:border-[#22385F] hover:border-slate-400 dark:hover:border-slate-500'
        } ${className}`}
        {...props}
      />
      {hint && !error && (
        <span className="text-[11px] text-[#64748B] dark:text-slate-400">{hint}</span>
      )}
      {error && (
        <span className="text-[11px] font-medium text-[#EF4444]">{error}</span>
      )}
    </div>
  );
}

export default Input;
