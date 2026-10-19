---
title: "Non-functional requirements là bản đồ cho Deep Dives, và tôi đã quên mất"
tags: [system-design, interview]
language: vi
---

Hồi trước tôi đã ghi trong [bài về Delivery Framework]({% post_url 2026-10-19-system-design-delivery-framework %}) rằng đến bước Deep Dives thì "non-functional requirements từ bước 1 giờ được dùng làm bản đồ". Câu đó do chính tôi viết, và viết ra trong cùng một ngày.

Vậy mà khi ôn lại, bị hỏi "NFR ở bước 1 được dùng lại ở đâu", tôi xin gợi ý. Được gợi ý rồi, tôi trả lời là bước 6 "dựa vào thời gian", tức là bước 5 lo cho hệ thống chạy được, bước 6 phân tích thêm sau. Câu đó đúng, nhưng lạc đề. Câu hỏi là đào vào *đâu*, chứ không phải đào *khi nào*.

## Đào vào đâu: hỏi lại từng NFR

Bản vẽ ở bước 5 chạy được, nhưng chỗ có thể cải thiện thì nhiều hơn số phút còn lại. Cách chọn là đi qua từng NFR đã viết ở bước 1 và hỏi: bản vẽ hiện tại đã đáp ứng điều này chưa? NFR nào chưa đạt thì đó là chỗ cần đào sâu.

Lấy bài đặt vé xem phim mà tôi tự làm trong buổi ôn. Hai NFR tôi đã viết ra:

- Hệ thống phải chịu được 50K người cùng vào mua vé trong phút đầu mở bán.
- User A đang giữ ghế G1 trong 15 phút thì user B không được đặt ghế đó.

Mỗi NFR dẫn thẳng tới một deep dive:

| NFR | Deep dive |
|---|---|
| 50K người tranh khoảng 200 ghế trong phút đầu | Đưa request vào queue thay vì ghi thẳng vào database |
| Không bán một ghế cho hai người | Lock ghế lại trong lúc user đang giữ chỗ |

Điều buồn cười là cả hai câu trả lời này tôi đã tự nói ra ở những câu trước trong cùng buổi ôn. Tôi chỉ không nối được chúng với câu hỏi "đào vào đâu".

Đây cũng là lý do NFR phải có con số. "Chịu tải khi nhiều người đặt" thì không cho biết khi nào là đủ. "50K người trong phút đầu" thì có: thiết kế chịu được con số đó là có thể chuyển sang NFR tiếp theo.

## Chủ động, nhưng chừa chỗ

Câu hỏi tiếp theo trong buổi ôn: nếu phỏng vấn ở level senior mà người phỏng vấn ngồi im thì làm gì? Câu trả lời tôi chốt lại được là senior tự dẫn dắt cuộc thảo luận, nhưng chừa chỗ cho người phỏng vấn hỏi. Nói liền mười phút thì rất dễ đi sai hướng, vì người phỏng vấn không có lúc nào để kéo mình về đúng thứ họ muốn nghe.

Ghép hai ý lại thì câu mở đầu bước 6 có thể là: "Bản vẽ chạy được rồi. Theo NFR thì có hai chỗ tôi lo nhất là tải lúc mở bán và chuyện bán trùng ghế. Tôi đề xuất đi vào chỗ thứ nhất trước, anh/chị thấy sao?"

Bước 1 không phải thủ tục làm cho xong rồi bỏ đó. Những gì viết ở bước 1 là thứ bước 6 sẽ dùng lại.
