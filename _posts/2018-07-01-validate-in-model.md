---
layout: post
title: Rails and Conditional Validations in Models
tags: [ruby, rails]
---

Thông thường khi làm chức năng đăng kí tham gia một dịch vụ nào đó thường bắt gặp một ô checkbox yêu cầu chấp nhận Điều khoản dịch vụ / Chính sách bảo mật(Terms of Service/Privacy Policies). Trong trường hợp này chúng ta thường có một attribute trong database để xác nhận người dùng đã đồng ý hay chưa.

Trong quá khứ, những thứ như vậy thường không được lưu trữ trong database - nó thường được validate ở frontend or thêm một thuộc tính ảo(virtual attribute) ở backend để validate.

Bài viết này sẽ tập trung vào trường hợp thứ hai, chúng ta sẽ thực hiện các giải pháp mà không cần lưu dữ liệu trên DB.

## Anatomy Of The Problem

User khi trước khi submit đăng kí phải bắt buộc đồng ý với Điều khoản dịch vụ(Terms of Service) của nhà cung cấp. Ngoài việc validate trên UI cần đảm bảo cũng được validate ở phía backend.

![terms of service](../img/terms_of_service.jpg)

## Solution 1 – Thêm 1 attribute ảo vào model và validate nó

Đây có lẽ là cách tiếp cận đơn giản nhất cho vấn đề trên. Dưới đây là cách chúng ta có thể triển khai:

```ruby
# app/models/user.rb
class User < ApplicationRecord
  attr_accessor :terms_of_service_accepted

  validates :terms_of_service_accepted, acceptance: true
end
```

Điều này chắc chắn sẽ hoạt đông. Nhưng hiện tại, việc xác thực sẽ luôn được thực hiện, ngay cả khi update, nó sẽ không có ý nghĩa gì nhiều. Chúng ta cần tìm một giải pháp tốt hơn.

## Solution 2 - Thêm 1 attribute ảo vào model và chỉ validate nó khi create

Một cải tiến nhỏ so với giải pháp trước là chúng ta đảm bảo rằng việc xác thực chỉ được gọi đến khi create:

```ruby
# app/models/user.rb
class User < ApplicationRecord
  attr_accessor :terms_of_service_accepted

  validates :terms_of_service_accepted, acceptance: true, on: :create
end
```

Ngay cả khi đã giải quyết được vấn đề thực tế nhưng có một vấn đề lớn về điều đó là việc validate sẽ luôn được kích hoạt trong quá trình tạo, ngay cả khi tạo người dùng từ factories! Vậy chúng ta có những lựa chọn nào khác?

## Solution 3 - Thêm 1 attribute ảo vào model và chỉ validate nó trong 1 trường hợp cụ thể

Điều thú vị trong ActiveModel validations là option `on` sẽ không giới hạn việc `:create` hay `:update` context - đó chỉ là những cái mà ActiveRecord đặt theo mặc định tùy thuộc vào trạng thái của model. Chúng ta có thể cung cấp các tuỳ chỉnh cho cả 2 method `valid?` và `save`

```ruby
user.valid?(:registration)
user.save(context: :registration)
```

Trong trường hợp đó, chúng ta có thể thay thế `:create` với `:registration` để validate.

```ruby
# app/models/user.rb
class User < ApplicationRecord
  attr_accessor :terms_of_service_accepted

  validates :terms_of_service_accepted, acceptance: true, on: :registration
end
```
