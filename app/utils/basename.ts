// Normalize BASE_URL across all environments (dev, preview, production)
// Handles: "/" (root), "./" (vite preview), "/repo-name/" (github pages)
export const BASENAME = (() => {
	const base = import.meta.env.BASE_URL || "/";
	if (base === "/" || base === "./") {
		return "";
	}
	return base.replace(/\/$/, "");
})();
