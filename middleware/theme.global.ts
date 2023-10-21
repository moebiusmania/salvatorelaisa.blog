export default defineNuxtRouteMiddleware((to, from) => {
  const conditions = [
    Object.keys(from.query).length,
    !Object.keys(to.query).length,
    from.path !== to.path,
  ];
  if (conditions.every((condition) => condition)) {
    return navigateTo({
      path: to.path,
      hash: to.hash,
      params: to.params,
      query: from.query,
    });
  }
});
