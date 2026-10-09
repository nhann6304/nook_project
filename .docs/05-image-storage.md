# Lưu ảnh khi deploy — chọn kho nào

> 09/10/2026. Cả hai bên cần: backend chọn kho, app thì biết ảnh tải lên đâu và
> vì sao ảnh hiện nhanh. Luật gốc: **ảnh gốc giữ NGUYÊN 100%** — không cắt, không
> nén lại, không thu nhỏ. Bản nhẹ cho bảng tin là bản sao riêng, xoá được, dựng lại được.

## Đường đi của một tấm ảnh (đã có sẵn)

```
App ──(1) POST /v1/media/upload-url ──► Server ký giấy phép PUT (S3 presigned)
App ──(2) PUT bytes gốc ─────────────► KHO (không qua Node)
App ──(3) POST /v1/media/:id/complete ► Server hỏi kho, soi dung lượng, nhận
Server ── việc nền ──► dựng bản `feed` (webp 1290px) + `thumb` (320px) cạnh bản gốc
```

Backend nói **giao thức S3**, nên đổi kho chỉ là đổi biến môi trường
(`STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_KEY_ID`, `STORAGE_SECRET`,
`STORAGE_REGION`, `STORAGE_PATH_STYLE`), không sửa mã.

## So sánh

| Kho | Giá (2026, tham khảo) | Băng thông ra | Hợp khi | Điểm trừ |
|---|---|---|---|---|
| **Cloudflare R2** ⭐ | ~$0.015/GB/tháng, 10 GB miễn phí | **Miễn phí** | App ảnh: đọc nhiều hơn ghi rất nhiều | Ít vùng chọn hơn AWS |
| Backblaze B2 + Cloudflare CDN | ~$0.006/GB/tháng | Miễn phí qua Cloudflare | Kho rất lớn, muốn rẻ nhất | Thêm một bước dựng CDN |
| AWS S3 + CloudFront | ~$0.023/GB/tháng | **Tốn** (~$0.085/GB) | Đã ở hệ AWS | Hoá đơn băng thông phình theo người xem |
| MinIO tự chạy trên VPS | Giá VPS + ổ đĩa | Theo VPS | Giai đoạn thử, ít người | Tự lo sao lưu, đầy ổ, chết máy là mất ảnh |
| Supabase / Firebase Storage | Theo gói | Theo gói | Đã dùng nền tảng đó | Khoá chặt vào một nhà, khó dời |

## Đề xuất

1. **Máy dev + bản chạy thử (docker compose):** MinIO — đã có trong `backend/docker/`.
2. **Production: Cloudflare R2.** Lý do quyết định là **băng thông ra miễn phí**:
   app ảnh mỗi tấm được 10–20 người xem nhiều lần, tiền băng thông mới là tiền
   lớn, không phải tiền lưu trữ. Gắn một tên miền riêng (vd. `media.lovo.app`)
   để ảnh đi qua CDN của Cloudflare.
3. **Sao lưu:** bật versioning/lifecycle của kho, hoặc chép định kỳ bản gốc sang
   một kho thứ hai (B2 rẻ). Bản `feed`/`thumb` KHÔNG cần sao lưu — dựng lại được.
4. **Đọc ảnh:** bảng tin dùng bản `feed`; "Xem ảnh gốc" / "Lưu về máy" dùng bản
   gốc. Đường đọc là đường ký có hạn, không để thùng chứa công khai.
