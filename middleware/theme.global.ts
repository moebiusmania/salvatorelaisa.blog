export default defineNuxtRouteMiddleware((to, from) => {
  console.log("----");
  console.log("from.path", from.path);
  console.log("from.query", from.query);
  console.log("to.path", to.path);
  console.log("to.query", to.query);

  if (Object.keys(from.query).length && !Object.keys(to.query).length) {
    return navigateTo({
      path: to.path,
      hash: to.hash,
      params: to.params,
      query: from.query,
    });
  }

  // if (from.query.theme === "dark" && from.path !== to.path) {
  //   //return to.path + "?theme=dark";
  //   return navigateTo(to.path + "?theme=dark");
  // } else {
  //   return true;
  // }
});
