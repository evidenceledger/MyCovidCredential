export default {
  // config options
  root: "src",
  base: "./",
  build: {
      minify: "esbuild",
      outDir: "../docs",
      emptyOutDir: true,
      assetsInlineLimit: 7000
  }
}