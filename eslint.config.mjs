import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // قوانین مورد نظر را اینجا اضافه کنید یا تغییر دهید
      "no-unused-vars": "off", // غیرفعال کردن هشدار متغیرهای استفاده‌نشده
      "react/no-unescaped-entities": "off", // غیرفعال کردن هشدار کاراکترهای غیرمجاز در JSX
    },
  },
];

export default eslintConfig;
