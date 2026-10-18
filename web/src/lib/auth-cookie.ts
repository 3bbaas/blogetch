// Cookie name shared between middleware (edge) and server code.
// Kept free of server-only imports so middleware can import it.
export const TOKEN_COOKIE = 'blogetch_token';
