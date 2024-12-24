import { onRequestOptions as __metadata_js_onRequestOptions } from "/Users/zaur/Desktop/Bookmarks/bookmark-manager/functions/metadata.js"
import { onRequestPost as __metadata_js_onRequestPost } from "/Users/zaur/Desktop/Bookmarks/bookmark-manager/functions/metadata.js"

export const routes = [
    {
      routePath: "/metadata",
      mountPath: "/",
      method: "OPTIONS",
      middlewares: [],
      modules: [__metadata_js_onRequestOptions],
    },
  {
      routePath: "/metadata",
      mountPath: "/",
      method: "POST",
      middlewares: [],
      modules: [__metadata_js_onRequestPost],
    },
  ]