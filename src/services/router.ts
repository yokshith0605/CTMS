import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export function parsePath(fullUrlOrPath: string): RouteState {
  // Normalize path
  let path = fullUrlOrPath;
  if (path.includes('#')) {
    path = path.split('#')[1] || '/';
  }
  const [pathname, queryString] = path.split('?');

  const query: Record<string, string> = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((val, key) => {
      query[key] = val;
    });
  }

  return {
    path: pathname || '/',
    params: {},
    query,
  };
}

class RouterStore {
  private currentRoute: RouteState;
  private listeners: Set<(r: RouteState) => void> = new Set();

  constructor() {
    const initial = window.location.hash
      ? window.location.hash.replace('#', '')
      : window.location.pathname;
    this.currentRoute = parsePath(initial || '/');

    window.addEventListener('popstate', () => {
      const p = window.location.hash
        ? window.location.hash.replace('#', '')
        : window.location.pathname;
      this.setRoute(p || '/', false);
    });

    window.addEventListener('hashchange', () => {
      const p = window.location.hash ? window.location.hash.replace('#', '') : '/';
      this.setRoute(p, false);
    });
  }

  public getRoute(): RouteState {
    return this.currentRoute;
  }

  public navigate(path: string) {
    this.setRoute(path, true);
  }

  private setRoute(path: string, pushHistory = true) {
    const parsed = parsePath(path);
    this.currentRoute = parsed;
    if (pushHistory) {
      window.location.hash = parsed.path + (Object.keys(parsed.query).length ? '?' + new URLSearchParams(parsed.query).toString() : '');
    }
    this.listeners.forEach((fn) => fn(this.currentRoute));
  }

  public subscribe(listener: (r: RouteState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const router = new RouterStore();

export function useRouter() {
  const [route, setRoute] = useState<RouteState>(() => router.getRoute());

  useEffect(() => {
    return router.subscribe((r) => setRoute(r));
  }, []);

  const navigate = (path: string) => {
    router.navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { route, navigate, path: route.path, params: route.params };
}
