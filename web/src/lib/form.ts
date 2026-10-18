export function field(formData: FormData, name: string): string {
  const value: unknown = formData.get(name);
  return typeof value === 'string' ? value : '';
}
