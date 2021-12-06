import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
    // command can be 'dev', 'serve' or 'build'
    // We can use conditionals to return different configs if needed
    console.log("Command: ", command)
    console.log("Mode: ", mode)
    return {
        // config options
        root: "src",
        base: "./",
        build: {
            minify: "esbuild",
            outDir: "../docs",
            emptyOutDir: true,
            assetsInlineLimit: 20000,
            manifest: true
        }

    }
})