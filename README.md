# Lingoreach

Website tự học tiếng Anh với bài học song ngữ, quiz và công cụ luyện tập trên trình duyệt. Trang chủ duy nhất là `index.html`: giữ nguyên nội dung và chức năng của hub cũ, sử dụng thiết kế hero video từ DesignPro.

## Tính năng

- Tìm kiếm, lọc 41 mục học và lưu tiến độ bằng `localStorage`.
- Bài học phát âm IPA, ngữ pháp, từ vựng, giao tiếp, TOEIC/IELTS và tiếng Anh công việc.
- Quiz chấm điểm, flashcard ôn cách quãng, Writing Lab, Listening Lab và mô phỏng hội thoại.
- Từ điển nội bộ, tra cứu trực tuyến và bộ từ vựng cá nhân ở các công cụ có hỗ trợ.
- Đọc văn bản, nhận diện giọng nói và trực quan hóa microphone tùy trình duyệt.
- Hero video toàn màn hình, hiệu ứng chữ quét sáng, giao diện responsive và hỗ trợ giảm chuyển động.

## Công nghệ

Trang chủ và bài học sử dụng HTML, CSS, JavaScript thuần. Vite 7 hỗ trợ phát triển và build; TypeScript kiểm tra mã nguồn tham chiếu. Các component React, Tailwind, Framer Motion và Lucide trong `designpro/` được giữ để tham chiếu thiết kế, không còn là một trang chủ riêng.

Dự án không có backend hoặc cơ sở dữ liệu máy chủ. Font sử dụng Inter, Fraunces và JetBrains Mono qua Google Fonts; trạng thái học được lưu cục bộ.

## Chạy bằng Live Server

Mở `index.html` bằng Live Server trong VS Code. Trang chủ không cần Vite xử lý React/TypeScript nên chạy trực tiếp trên server tĩnh.

`index_hub.html` chỉ chuyển hướng tới `index.html`, giữ tương thích với liên kết cũ. Các bài học và công cụ đều trỏ về trang chủ hợp nhất.

## Phát triển và build

Yêu cầu Node.js 22.12 trở lên và npm. Chạy tại thư mục gốc:

```bash
npm ci
npm run dev
```

Build và xem bản production:

```bash
npm run build
npm run preview
```

Build tạo `dist/`, bao gồm trang chủ, toàn bộ bài học và tài nguyên. Các script cổ điển trong HTML được giữ nguyên và sao chép cùng tài nguyên; thông báo Vite không bundle các script này không ngăn chúng hoạt động trong bản build.

## Đường dẫn

| Địa chỉ | Chức năng |
| --- | --- |
| `/` hoặc `/index.html` | Trang chủ hợp nhất |
| `/index_hub.html` | Chuyển hướng tương thích |
| `/quiz.html` | Quiz tổng hợp |
| `/tu_vung.html` | Từ vựng tổng hợp |
| `/tra_tu_vung.html` | Từ điển Anh–Việt |
| `/parts/<ten-file>.html` | Bài học và công cụ luyện tập |

## Cấu trúc thư mục

```text
Lingoreach/
├── index.html                  # Trang chủ duy nhất
├── index_hub.html              # Chuyển hướng tới index.html
├── quiz.html
├── tu_vung.html
├── tra_tu_vung.html
├── parts/                      # 38 file bài học, gồm một file trống
├── assets/
│   ├── lingoreach.css          # CSS nền tảng
│   ├── premium-dark.css        # Theme bài học
│   ├── lingoreach.js           # Tương tác và hiệu ứng dùng chung
│   ├── home.css                # Thiết kế DesignPro cho nội dung hub
│   └── home.js                 # Điều khiển video theo thiết lập hiệu ứng
├── designpro/                  # Component React tham chiếu thiết kế
├── scripts/                    # Kiểm tra và migration
├── PREMIUM-DESIGN-SYSTEM.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── dist/                       # Kết quả build, không đưa vào Git
```

## Kiểm tra

```bash
npm run build
node scripts/verify-merged-home.cjs
node scripts/verify-premium-preservation.cjs
```

Kiểm tra merge đối chiếu nguyên văn các text node và hash của toàn bộ script inline với hub trước khi hợp nhất. Kiểm tra preservation xác nhận nội dung và logic bài học, cho phép thay đổi đường dẫn về trang chủ và điều kiện hiển thị trang trí đã được ghi rõ.

Các kiểm tra trình duyệt cần Microsoft Edge và module `playwright-core`. Module này chưa được khai báo trong `package.json`; cần cài riêng và đặt `PLAYWRIGHT_CORE_PATH` tới thư mục module nếu đường dẫn mặc định trong script không phù hợp máy hiện tại.

```bash
node scripts/verify-ui.cjs
node scripts/verify-premium-ui.cjs
```

Để kiểm tra trang chủ trên server đang chạy, dùng `node scripts/verify-home.cjs`. Mặc định script kiểm tra `http://127.0.0.1:5173`; đặt `PREVIEW_URL` nếu dùng cổng Live Server hoặc preview khác. `verify-designpro.cjs` là tên tương thích gọi cùng kiểm tra này.

Ảnh kiểm tra được lưu trong `.preview/` hoặc thư mục tạm tùy script. Các kiểm tra hiện có không thay thế kiểm toán accessibility đầy đủ.

## Lưu ý

- Có 41 trang học tập có nội dung. `parts/part10_toeic_ielts.html` hiện trống và được đánh dấu đang cập nhật trên trang chủ.
- Tiến độ không đồng bộ tài khoản. Nên giữ nguyên origin/cổng khi sử dụng để tiếp tục truy cập dữ liệu `localStorage` đã lưu.
- Video, font và tra từ trực tuyến cần Internet. Nút **Hiệu ứng** hiện có cũng điều khiển video nền; giảm chuyển động sẽ dừng video và hiệu ứng chữ.
- Microphone cần quyền truy cập và môi trường được trình duyệt cho phép, thường là HTTPS hoặc localhost.
- Chatbot AI thật phụ thuộc dịch vụ và môi trường tích hợp bên ngoài; dự án chưa có backend xác thực để chạy độc lập tính năng này.
