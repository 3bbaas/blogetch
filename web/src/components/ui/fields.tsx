type Common = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  errorId?: string;
  defaultValue?: string;
};

export function Input({
  id,
  name,
  label,
  type = 'text',
  required = false,
  errorId,
  defaultValue = '',
  maxLength,
}: Common & { type?: string; maxLength?: number }) {
  return (
    <div>
      <label htmlFor={id} className="font-accent text-sm tracking-widest uppercase">
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-describedby={errorId}
        aria-invalid={errorId !== undefined}
        className="ruled-input"
      />
    </div>
  );
}

export function Textarea({
  id,
  name,
  label,
  required = false,
  errorId,
  defaultValue = '',
  rows = 8,
}: Common & { rows?: number }) {
  return (
    <div>
      <label htmlFor={id} className="font-accent text-sm tracking-widest uppercase">
        {label}
        {required ? ' *' : ''}
      </label>
      <textarea
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        rows={rows}
        aria-describedby={errorId}
        aria-invalid={errorId !== undefined}
        className="ruled-input min-h-[44px] resize-y"
      />
    </div>
  );
}

export function Select({
  id,
  name,
  label,
  required = false,
  errorId,
  defaultValue = '',
  options,
}: Common & { options: ReadonlyArray<{ value: string; label: string }> }) {
  return (
    <div>
      <label htmlFor={id} className="font-accent text-sm tracking-widest uppercase">
        {label}
        {required ? ' *' : ''}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        aria-describedby={errorId}
        aria-invalid={errorId !== undefined}
        className="ruled-input min-h-[44px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
