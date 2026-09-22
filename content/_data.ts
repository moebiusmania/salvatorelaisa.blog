// Every markdown file directly under content/ is a blog post, served at
// /post/<filename>/ (the same URLs the Nuxt version generated).
export const type = "post";
export const layout = "layouts/post.vto";
export const url = (page: Lume.Page): string =>
	`/post/${page.src.path.split("/").pop()}/`;

