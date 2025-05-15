@echo off
echo 🔍 Starting secret cleanup using git-filter-repo...

:: اجرای git-filter-repo برای حذف فایل‌های حاوی کلید از تاریخچه گیت
git-filter-repo.exe --path testOpenAI.js --path testHuggingFace.js --path testGemini.js --invert-paths

echo ✅ Cleanup complete.
echo 🚀 Now you can push with: git push origin dev --force
pause
