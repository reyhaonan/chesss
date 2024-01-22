export const ssr = false;



export const prerender = true;

export const trailingSlash = 'always';

import type {LayoutLoad} from "./$types"

export const load: LayoutLoad = ({ url }) => {
  return {
    url: url.pathname,
  }
}
