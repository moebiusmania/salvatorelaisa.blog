export default defineNuxtRouteMiddleware((to, from) => {
  if (Object.keys(from.query).length && !Object.keys(to.query).length) {
    return navigateTo({
      path: to.path,
      hash: to.hash,
      params: to.params,
      query: from.query,
    });
  }
});
