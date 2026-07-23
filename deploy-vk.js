// deploy-vk.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const DIST_DIR = "dist";
const VK_BRANCH = "vk-pages";

console.log("📦 Building for VK Mini App...");
execSync("npm run build", { stdio: "inherit" });

console.log("🚀 Deploying to VK branch...");

// Сохраняем текущую ветку
const currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
  .toString()
  .trim();

try {
  // Переключаемся на ветку VK
  try {
    execSync(`git checkout ${VK_BRANCH}`, { stdio: "ignore" });
  } catch {
    execSync(`git checkout --orphan ${VK_BRANCH}`, { stdio: "ignore" });
    execSync("git rm -rf .", { stdio: "ignore" });
  }

  // Удаляем все файлы
  const files = fs.readdirSync(".");
  for (const file of files) {
    if (file !== ".git" && file !== DIST_DIR) {
      if (fs.statSync(file).isDirectory()) {
        fs.rmSync(file, { recursive: true, force: true });
      } else {
        fs.unlinkSync(file);
      }
    }
  }

  // Копируем собранные файлы
  const distFiles = fs.readdirSync(DIST_DIR);
  for (const file of distFiles) {
    const src = path.join(DIST_DIR, file);
    const dest = path.join(".", file);
    fs.cpSync(src, dest, { recursive: true });
  }

  // Добавляем .nojekyll
  fs.writeFileSync(".nojekyll", "");

  // Добавляем файлы в git
  execSync("git add .", { stdio: "ignore" });

  try {
    execSync("git diff --cached --quiet", { stdio: "ignore" });
    console.log("ℹ️ No changes to commit");
  } catch {
    const commitMessage = `VK Deploy - ${new Date().toISOString()}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: "ignore" });
    console.log("✅ Committed changes");
  }

  execSync(`git push origin ${VK_BRANCH} --force`, { stdio: "ignore" });
  console.log(`✅ Deployed to ${VK_BRANCH} branch`);
} catch (error) {
  console.error("❌ Deployment failed:", error.message);
} finally {
  execSync(`git checkout ${currentBranch}`, { stdio: "ignore" });
}
