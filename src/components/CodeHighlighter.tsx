"use client";

import { useEffect } from "react";

/**
 * 客户端组件：使用 highlight.js 对页面中的代码块进行语法高亮
 * 通过 CDN 加载 highlight.js 完整包（含常用语言），避免增加打包体积
 */
export default function CodeHighlighter() {
  useEffect(() => {
    const highlightAll = () => {
      const blocks = document.querySelectorAll("pre code[class*='language-']");
      blocks.forEach((block) => {
        if (block.getAttribute("data-highlighted") === "yes") return;
        const hljs = (window as unknown as { hljs?: { highlightElement: (el: Element) => void } }).hljs;
        if (hljs) {
          try {
            hljs.highlightElement(block);
            block.setAttribute("data-highlighted", "yes");
          } catch {
            // 忽略无法识别的语言
          }
        }
      });
    };

    const w = window as unknown as { hljs?: unknown };
    if (w.hljs) {
      highlightAll();
      return;
    }

    // 加载 highlight.js CSS（github-dark 主题，与代码块深色背景搭配）
    if (!document.querySelector('link[data-hljs-css]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
      link.setAttribute("data-hljs-css", "true");
      document.head.appendChild(link);
    }

    // 加载 highlight.js 完整脚本（cdnjs 版本含 190+ 常用语言）
    if (!document.querySelector('script[data-hljs]')) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
      script.async = true;
      script.setAttribute("data-hljs", "true");
      script.onload = () => {
        highlightAll();
      };
      document.head.appendChild(script);
    }
  }, []);

  return null;
}
