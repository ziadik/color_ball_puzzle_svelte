import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import compression from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    svelte(),
    compression({
      algorithm: "gzip", // или 'brotliCompress'
      ext: ".gz", // расширение для сжатых файлов
      filter: (filePath) => {
        // Укажите, какие файлы сжимать, а какие нет
        const ext = path.extname(filePath);
        return ext !== ".map" && ext !== ".json";
      },
      threshold: 10240, // сжимать файлы, размер которых больше этого порога
    }),
  ],
});
