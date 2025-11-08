import type { RouterConfig } from "@nuxt/schema";
// https://router.vuejs.org/api/interfaces/routeroptions.html
export default (<RouterConfig>{
	scrollBehavior(_to, _from, savedPosition) {
		if (_to.hash.length > 0) {
			return {
				el: _to.hash,
				behavior: "smooth",
			};
		}

		if (savedPosition) {
			return savedPosition;
		} else {
			return {
				top: 0,
				behavior: "smooth",
			};
		}
	},
});
