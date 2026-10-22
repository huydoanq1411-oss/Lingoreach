# Lingoreach · DesignPro

Nền tảng tự học tiếng Anh với bài học song ngữ, bài tập và công cụ luyện tập trên trình duyệt. Dự án kết hợp thư viện HTML độc lập của Lingoreach với trang giới thiệu DesignPro viết bằng React và TypeScript.

## Tính năng chính

- **Thư viện học tập:** tìm kiếm, lọc tài liệu, đánh dấu hoàn thành và lưu tiến độ trên trình duyệt.
- **Nội dung tiếng Anh:** phát âm IPA, ngữ pháp, từ vựng, giao tiếp, tiếng Anh công việc, TOEIC và IELTS.
- **Luyện tập:** quiz chấm điểm, flashcard ôn cách quãng, Writing Lab, Listening Lab và mô phỏng hội thoại.
- **Tra cứu:** từ điển Anh–Việt nội bộ, tra cứu trực tuyến và bộ từ vựng cá nhân ở các công cụ có hỗ trợ.
- **Âm thanh:** đọc văn bản, nhận diện giọng nói và trực quan hóa microphone tùy khả năng trình duyệt.
- **Giao diện:** nền tối, tiêu đề serif, điểm nhấn gold/teal, bố cục responsive và hỗ trợ giảm chuyển động.
- **DesignPro:** hero video, chữ quét sáng, menu mobile và hộp thông tin chương trình.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Trang giới thiệu | HTML, CSS, JavaScript; Vite 7 ?? ph?t tri?n/build |
| Giao diện React | M? React/TypeScript tham chi?u trong `designpro/` |
| Thư viện học tập | HTML, CSS và JavaScript thuần |
| Font | Fraunces, Inter, JetBrains Mono qua Google Fonts |
| Lưu trạng thái | `localStorage` |
| Âm thanh | Web Speech API, Web Audio API, MediaDevices |
| Kiểm tra giao diện | Script Node.js sử dụng Playwright Core và Microsoft Edge |

Dự án hiện không có backend hoặc cơ sở dữ liệu máy chủ. Tailwind chỉ được tích hợp cho phần React; các trang bài học dùng CSS riêng và CSS dùng chung.

## Cài đặt và chạy

### Yêu cầu

- Node.js 22.12 trở lên và npm.
- Trình duyệt hiện đại; khả năng nhận diện giọng nói phụ thuộc trình duyệt và thiết bị.

### Phát triển

Chạy trong thư mục gốc của dự án:

```bash
npm ci
npm run dev
```

Mở địa chỉ do Vite hiển thị, sau đó truy cập:

- `/`: trang giới thiệu DesignPro.
- `/index_hub.html`: mục lục học tiếng Anh.
- `/quiz.html`: quiz tổng hợp.
- `/tu_vung.html`: từ vựng tổng hợp.
- `/tra_tu_vung.html`: từ điển.
- `/parts/<ten-file>.html`: từng bài học.

Các trang học HTML có thể mở trực tiếp bằng trình duyệt. Nên dùng địa chỉ localhost cố định để có môi trường nhất quán cho lưu trạng thái và các API trình duyệt. Trang React cần Vite hoặc bản build; không chạy bằng cách mở trực tiếp `index.html`.

### Build và xem bản production

```bash
npm run build
npm run preview
```

Lệnh build kiểm tra TypeScript và tạo `dist/`, bao gồm ứng dụng React, các trang học, thư mục `parts/` và tài nguyên dùng chung. Có thể phục vụ toàn bộ `dist/` bằng static hosting; cần giữ nguyên cấu trúc đường dẫn HTML.

## Cấu trúc thư mục

```text
Lingoreach/
├── index.html                       # Điểm vào ứng dụng React
├── index_hub.html                   # Mục lục học tiếng Anh
├── quiz.html                        # Quiz tổng hợp
├── tu_vung.html                     # Từ vựng tổng hợp
├── tra_tu_vung.html                 # Từ điển Anh–Việt
├── designpro/
│   ├── main.tsx                     # Khởi tạo React
│   ├── DesignProHero.tsx            # Hero, menu và hộp thông tin
│   ├── ShinyText.tsx                # Hiệu ứng chữ quét sáng
│   ├── useMotionPreference.ts       # Theo dõi reduced motion
│   └── styles.css                   # Tailwind và CSS của React
├── parts/                           # 38 file bài học, gồm một file trống
├── assets/
│   ├── lingoreach.css               # CSS nền tảng và legacy
│   ├── premium-dark.css             # Theme giáo dục nền tối
│   └── lingoreach.js                # Tương tác và hiệu ứng dùng chung
├── scripts/                         # Migration và kiểm tra
├── PREMIUM-DESIGN-SYSTEM.md          # Quy ước giao diện
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── dist/                            # Kết quả build, không đưa vào Git
```

## Kiểm tra

```bash
npm run build
node scripts/verify-premium-preservation.cjs
```

Script preservation đối chiếu nội dung với baseline trước đợt restyle; các thay đổi nội dung có chủ đích cần được xem xét cùng baseline.

Các kiểm tra trình duyệt hiện yêu cầu Microsoft Edge và module `playwright-core`. Dependency này chưa được khai báo trong `package.json`; cần cài riêng và đặt biến môi trường `PLAYWRIGHT_CORE_PATH` tới thư mục module nếu đường dẫn mặc định trong script không phù hợp máy của bạn.

```bash
node scripts/verify-ui.cjs
node scripts/verify-premium-ui.cjs
```

Để kiểm tra hero, chạy preview ở một terminal khác rồi thực hiện:

```bash
npm run preview -- --port 5173
```

```bash
node scripts/verify-home.cjs
```

Có thể đặt `PREVIEW_URL` nếu dùng địa chỉ khác. Ảnh kiểm tra mới được lưu trong `.preview/`; một số script cũ lưu ảnh vào thư mục tạm của hệ điều hành. Các kiểm tra hiện có không thay thế kiểm toán accessibility đầy đủ.

## Phạm vi và lưu ý

- Có 41 trang HTML học tập có nội dung, ngoài trang React. `parts/part10_toeic_ielts.html` hiện trống; mục tương ứng trên hub được đánh dấu đang cập nhật.
- Tiến độ và dữ liệu cá nhân được lưu cục bộ, không đồng bộ tài khoản. Đổi origin, cổng, trình duyệt hoặc xóa dữ liệu trang có thể khiến dữ liệu đã lưu không còn xuất hiện.
- Video, Google Fonts và tra từ trực tuyến cần Internet. Microphone cần quyền truy cập và môi trường được trình duyệt cho phép, thường là HTTPS hoặc localhost.
- Chatbot AI thật gọi dịch vụ bên ngoài và phụ thuộc môi trường tích hợp; dự án chưa có backend xác thực để chạy tính năng này độc lập.
- DesignPro hiện là trang giới thiệu: các mục điều hướng mở hộp thông tin, nút đăng ký chưa gửi đơn hoặc dữ liệu tới máy chủ.
