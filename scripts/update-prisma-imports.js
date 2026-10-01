const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const apiDir = path.join(__dirname, "..", "app", "api");

walkDir(apiDir, (filePath) => {
  if (!filePath.endsWith(".ts")) return;
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes("new PrismaClient()")) {
    content = content.replace(
      /import\s*\{\s*PrismaClient\s*\}\s*from\s*["']@prisma\/client["'];?/,
      'import { prisma } from "@/lib/prisma";'
    );
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\);?/, "");
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Updated:", path.basename(filePath));
  }
});
