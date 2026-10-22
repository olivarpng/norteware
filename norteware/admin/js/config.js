export const CONFIG = {
  owner: "olivarpng",
  repo: "norteware",
  branch: "main",
  siteRoot: "norteware",
  dataFile: "data/products.json",
  imageDir: "assets/products",
};

export const repoPath = (path) => [CONFIG.siteRoot, path].filter(Boolean).join("/");
