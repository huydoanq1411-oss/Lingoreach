# Lingoreach UI

Mở `index_hub.html` trực tiếp bằng trình duyệt; không cần server, build hoặc thư viện.
Nút **Hiệu ứng** trong thanh trên cùng lưu tùy chọn; reduced motion của hệ điều hành luôn được ưu tiên.
Nút **Tập trung** thu gọn mục lục; **Ctrl/Cmd+K** đưa con trỏ vào ô tìm bài học.
Chỉnh màu, khoảng cách, easing trong `assets/lingoreach.css`; chỉnh DPR, render scale và số hạt trong `CONFIG` đầu `assets/lingoreach.js`.
Micro chỉ được xin quyền khi bấm **Bật sóng âm micro**; nút này tách biệt các công cụ nhận dạng giọng nói hiện có.

## Files

- `assets/lingoreach.css`: common legacy rules in a low-priority cascade layer, tokens, layout, components and motion.
- `assets/lingoreach.js`: optional enhancements, shader, canvas, motion preferences, search, progress feedback and microphone analysis.
- `scripts/upgrade-ui.cjs`: repeatable migration for all root lesson / library HTML files; exact repeated CSS rules are extracted without touching lesson markup or inline JavaScript.
- `assets/ui-migration-report.txt`: per-page extraction report. All 41 nonempty pages use the shared assets. `part10_toeic_ielts.html` remains empty and is skipped. No page requires a manual migration step.
- `scripts/verify-ui.cjs`: browser acceptance checks with installed Playwright Core and Edge; override `PLAYWRIGHT_CORE_PATH` for a different installation.
- `scripts/verify-preservation.cjs`: compares the learning content and original scripts to the pre-upgrade Git revision; optional first argument selects that revision.

## Validation and limits

Run `node scripts/upgrade-ui.cjs`, `node scripts/verify-preservation.cjs`, and `node scripts/verify-ui.cjs`.
Browser checks cover local file loading, search/filter/empty states, persisted completion, theme switching, focus mode, flashcard flipping, quiz answers/progress, responsive widths and reduced motion. Results are saved in `assets/ui-verification.txt`.

Shader animation pauses offscreen and in hidden tabs, caps DPR, and adjusts resolution after sustained frame pressure. Unsupported WebGL and low-power devices retain a static CSS background. Live microphone access depends on browser permission and hardware; denied permission is handled inline. Existing speech and chatbot service availability remains unchanged.

The shared CSS/JS is under the requested 60 KB uncompressed budget. A measured 60 FPS on physical devices, WCAG AA across every legacy component and Lighthouse ≥90 are **not certified** by these browser checks; Lighthouse does not audit `file://` URLs. Full cross-document View Transitions depend on browser and origin support, with ordinary local navigation and lightweight page entry as fallback.
