import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract a route parameter as a number from a Request object.
 * Works with both dynamic route parameters and URL search parameters.
 */
export function getNumericRouteParam(req: Request, name: string): number | null {
  // Try URL pattern first (for dynamic routes)
  const url = new URL(req.url);
  const matches = url.pathname.match(new RegExp(`/${name}/([^/]+)`));
  if (matches && matches[1]) {
    const value = parseInt(matches[1], 10);
    return isNaN(value) ? null : value;
  }

  // Try search params as fallback
  const param = url.searchParams.get(name);
  if (param) {
    const value = parseInt(param, 10);
    return isNaN(value) ? null : value;
  }

  return null;
}

/**
 * Extract a route parameter as a string from a Request object.
 * Works with both dynamic route parameters and URL search parameters.
 */
export function getStringRouteParam(req: Request, name: string): string | null {
  // Try URL pattern first (for dynamic routes)
  const url = new URL(req.url);
  const matches = url.pathname.match(new RegExp(`/${name}/([^/]+)`));
  if (matches && matches[1]) {
    return decodeURIComponent(matches[1]);
  }

  // Try search params as fallback
  return url.searchParams.get(name);
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}
