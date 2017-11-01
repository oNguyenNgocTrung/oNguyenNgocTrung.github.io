---
layout: post
title: Rails 5.1's form_with vs. form_tag vs. form_for
tags: [rails]
---

![default image](../img/report10_1.jpeg)

`form_tag` và `form_for`  sẽ ko được sử dụng nhiều và chúng sẽ được thay thế dần bởi `form_with` trong tương lai. Nếu bạn muốn biết thêm về `form_with` bạn có thể đọc các đề xuất ban đầu của [DHH](https://github.com/rails/rails/issues/25197), check pull request đã được implemented tại [đây](https://github.com/rails/rails/pull/26976/files), hoặc check [API](http://api.rubyonrails.org/classes/ActionView/Helpers/FormHelper.html#method-i-form_with).

Trong bài này sẽ giải thích sự khác biệt giữa `form_tag`, `form_for` và `form_with` với cái ví dụ cụ thể.

**One syntax to rule them all**

Trước đây khi bạn muốn tạo một form, nhưng bạn không có 1 đối tượng cho nó, thì bạn sử dụng `form_tag`.

```erb
<%= form_tag users_path do %>
  <%= text_field_tag :email %>
  <%= submit_tag %>
<% end %>
```

Khi bạn có một đối tượng, thì bạn dùng `form_for`.

```erb
<%= form_for @user do |form| %>
  <%= form.text_field :email %>
  <%= form.submit %>
<% end %>
```

Như bạn thấy, chúng ta sử dụng `form builder field helper` để tạo `form` với `form_for` nhưng lại không làm điều đó với `form_tag`. Vì vậy, cú pháp cho cả hai hình thức là khác nhau.

Với `form_with` thì ko làm như vậy, bởi vì chúng ta sử dụng `form builder` mọi lúc.

`form_with` khi không có 1 đối tượng:

```erb
<%= form_with url: users_path do |form| %>
  <%= form.text_field :email %>
  <%= form.submit %>
<% end %>
```

`form_with` với 1 đối tượng:

```erb
<%= form_with model: @user do |form| %>
  <%= form.text_field :email %>
  <%= form.submit %>
<% end %>
```

Khi bạn thêm các đối số cho đối tượng, các `scope` và `url` sẽ tự động điều hướng từ đó. Nó hoạt động tương tự như form_for.

**Automatic ids and classes are gone**

`form_tag` và `form_for` khởi tạo `id` tự động cho các `fields` của form. `form_for` thì thêm cả cho thẻ `form`

```erb
<%= form_for User.new do |form| %>
  <%= form.text_field :email %>
<% end %>
```

tương đương với:

```html
<form class="new_user" id="new_user" action="/users" ...>
  ...
  <input type="text" name="user[email]" id="user_email" />
</form>
```

Với `form_with` thì phải xác định tất cả các `id` và các `class` theo cách thủ công:

```erb
<%= form_with model: @user do |form| %>
  <%= form.text_field :name %>
  <%= form.text_field :email, id: :email, class: :email %>
<% end %>
```

tương đương với:

```html
<form action="/users" ...>
  ...
  <input type="text" name="user[name]" />
  <input id="email" class="email" type="text" name="user[email]" />
</form>
```

Đừng quên chỉ định `id` cho các form fields nếu bạn muốn các `label` hoạt động.

```erb
<%= form_with model: @user do |form| %>
  <%= form.label :name %>
  <%= form.text_field :name, id: :user_name %>
<% end %>
```

**Form id and class attributes aren’t wrapped anymore**

Before:

```erb
<%= form_for @user, html: { id: :custom_id, class: :custom_class } do |form| %>
  ...
<% end %>
```

After:

```erb
<%= form_with model: @user, id: :custom_id, class: :custom_class do |form| %>
  ...
<% end %>
```

**Form fields don’t have to correspond to model attributes**

Before:

```erb
<%= form_for @user do |form| %>
  <%= form.text_field :email %>
  <%= check_box_tag :send_welcome_email %>
<% end %>
```

After:

```erb
<%= form_with model: @user, local: true do |form| %>
  <%= form.text_field :email %>
  <%= form.check_box :send_welcome_email %>
  <%= form.submit %>
<% end %>
```

 Hãy lưu ý rằng `send_welcome_email` sẽ được gửi đến `controller` dưới dạng params:

```ruby
params[:user][:send_welcome_email]
```

Vì vậy vẫn nên sử dụng `check_box_tag` thay vì `form.check_box` nếu thấy cần thiết.

**All forms are remote by default**

Đây là sự thay đổi rất thú vị. Tất cả các form được tạo từ `form_with` sẽ được submit mặc định bởi request XHR(Ajax). Sẽ không cần phải thêm option `remote: true` tương tự như chúng ta đã phải có trên `form_tag` và `form_for`.

Tuy nhiên, nếu bạn không muốn sử dụng remote cho form, bạn có thể thêm `local: true` như sau:

```erb
<%= form_with model: @user, local: true %>
  ...
<% end %>
```

**Let’s use form_with since now and never look back!**

Với những khác biệt và lợi ích trên bạn nên bắt đầu sử dụng `form_with` từ bây giờ và dẫn loại bỏ không sử dung `form_tag` và `form_for`. Ngoài ra bạn có thể tìm hiểu thêm về `form_with` tại [đây](http://api.rubyonrails.org/classes/ActionView/Helpers/FormHelper.html#method-i-form_with)


**Tham Khảo**

Bài viết trên được dịch từ  [https://m.patrikonrails.com/rails-5-1s-form-with-vs-old-form-helpers-3a5f72a8c78a](https://m.patrikonrails.com/rails-5-1s-form-with-vs-old-form-helpers-3a5f72a8c78a)
