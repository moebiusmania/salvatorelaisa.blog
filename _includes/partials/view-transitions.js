// Cross-document View Transitions (replaces the old Nuxt router plugin).
// The browser animates every same-origin navigation thanks to
// `@view-transition { navigation: auto; }`; this only picks the direction of
// the slide for paginated lists (`/post/page/N`), exposed to
// view-transitions.css as <html data-vt-direction="forward | back | fade">.
// Inlined as a classic script in <head>, hence the ES5 style.
// deno-lint-ignore-file no-var no-window no-window-prefix
(function () {
	var pageNumber = function (url) {
		if (!url) return null;
		var match = new URL(url, location.href).pathname.match(/^\/post\/page\/(\d+)/);
		return match ? Number(match[1]) : null;
	};
	var direction = function (from, to) {
		var a = pageNumber(from);
		var b = pageNumber(to);
		return a !== null && b !== null && a !== b ? (b > a ? "forward" : "back") : "fade";
	};
	var reduced = function () {
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	};

	// Outgoing page: runs right before the old snapshot is captured.
	window.addEventListener("pageswap", function (event) {
		if (!event.viewTransition) return;
		if (reduced()) return event.viewTransition.skipTransition();
		var entry = event.activation && event.activation.entry;
		document.documentElement.dataset.vtDirection = direction(location.href, entry && entry.url);
	});

	// Incoming page: runs before the first frame is rendered.
	window.addEventListener("pagereveal", function (event) {
		if (!event.viewTransition) return;
		if (reduced()) return event.viewTransition.skipTransition();
		var activation = window.navigation && navigation.activation;
		var from = activation && activation.from && activation.from.url;
		document.documentElement.dataset.vtDirection = direction(from, location.href);
	});
})();
