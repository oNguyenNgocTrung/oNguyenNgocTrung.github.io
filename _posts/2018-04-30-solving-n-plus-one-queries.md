---
layout: post
title: N+1 Queries or Memory Problem. Why not Solve Both?
tags: [ruby, rails]
---

Gần đây mình có gặp phải vấn đề là con server của mình bị tràn bộ nhớ, sau một hồi tìm hiều nguyên nhân thì phát hiện ra lỗi do có quá nhiều object đươc tạo ra khi dùng `includes`. Mình có tìm được một vài viết trên mạng ở [đây](https://blog.heroku.com/solving-n-plus-one-queries) có nói về cách giải quyết được vấn đề trên mà lâu này mình vẫn hay dùng `includes` một cách bừa bãi mà không để ý xem khi nào nên dùng và dùng như thế nào thì hợp lí cho từng bài toán.

Ví dụ ta đang xây dựng một blog, trong blog có nhiều posts và mỗi post thì có nhiều comments. Nhiệm vụ đầu tiên ở mỗi trang index của chúng ta là hiển thị danh sách các post, mỗi post cần phải hiên thị title, một đoạn description ngắn, và thông tin số lượng comment của post đấy.

Cách thưc hiện sẽ như sau:
```ruby
@posts = Post.all.per_page(20).page(params[:page])
```

```ruby
<% @posts.each do |post| %>
  <h1><%= link_to(post, post.title) %></h1>
  <p><%= post.description %></p>
  <%= "#{post.comments.count} comments" %>
<% end %>

<%= pagination(@posts) %>
```

Vấn đề ở trên là gì? Chúng ta có một query để gọi ra tất cả các post, tiếp theo ở mỗi post sẽ gọi thêm 1 query đẻ tính số lượng comment ở mỗi post đấy. Vậy là đã bị dính N+1 query.

Một giải phát đơn giản là sử dụng `includes` như chúng ta hay làm để  `Active Record` lấy ra tất cả các comments của các post có liên quan

```ruby
@posts = Post.includes(:comments).per_page(20).page(params[:page])
```

Sau khi thêm includes thì chúng ta chỉ có 2 query là:

```sql
select * from posts limit ? offset ?
```

```sql
select * from comments where post_id in ?
```

Vấn đề N+1 query đã được giải quyết, nhưng như ở trên vì sao mình gặp phải vấn đề bị tràn bộ nhớ. Ví dụ có 20 posts mỗi post có 100 comment. Do ActiveRecord không biết bạn cần lấy những gì thì mỗi comment nên nó sẽ lấy hết vì vậy bạn sẽ có 2000 `Active Record` objects được tạo ra ở memory. Đây là vấn đề lớn vì chúng ta không cần nhiều đến thế, chúng ta chỉ cần lấy số lượng comment mà thôi. Hình dung mỗi comment đều có nội dung khá dài, việc chúng ta load ra hết như thế gây thừa thãi tốn memory như thế nào. điều tốt duy nhất có ở đây là nó đã giải quyết đươc vấn đề N+1 query tuy nhiên cái giá phải trả thì cũng đáng buồn =]]

Vậy chúng ta làm sao để giải quyết được 2 vấn đề trên cùng lúc.

## Dùng Count cache ##

Counter cache là kỹ thuật để tăng performance cho application thông qua việc tiết kiệm số lần gọi đến SQL.
Cách thực thi rất đơn giản nhưng đem lại hiệu quả khá cao. Follow là chúng ta sẽ thêm 1 cột `comments_count` trong bảng `posts`. Mỗi lần có sự thay đổi về số lượng comment ta sẽ update trường này. Việc gọi ra thì khá đơn giản

```ruby
 <%= "#{post.comments_count} comments"  %>
```

Cả 2 vấn đề được giải quyết =]]. Nhưng với những bài toán phức tạp hơn thì thế nào. Ví dụ yêu cầu hiện thị số lượng comment đã được approved và đang pending thì thế nào. Theo như cách trên chúng ta phải thêm 2 trương ở bảng post là `pending_comments_count` và `approved_comments_count`. Ok có vẻ mới 2 trường không vấn đề gì nhưng với trường hợp phức tạp hơn nữa làm như vậy thiết kế database của chúng ta sẽ ko được tốt.

## Build Count Data in Hashed ##

Một cách khác là chúng ta sẽ tạo 1 hash với `key` là `post_id` và `value` là số lượng comments tương ứng. Việc tạo ra khá đơn giản chỉ với 1 query.

```ruby
 @posts = Post.all.per_page(20).page(params[:page])
 @count_hash = Comment.where(post_id: posts.ids).group(:post_id).count
```

với bài toán phúc tạp hơn như trên thì ta sẽ tạo ra 2 hash là `pending_count_hash` và `approved_count_hash`

```ruby
@posts = Post.all.per_page(20).page(params[:page])
post_ids = @posts.ids
@pending_count_hash   = Comment.pending.where(post_id: post_ids).group(:post_id).count
@approved_count_hash = Comment.approved.where(post_id: post_ids).group(:post_id).count
```

Để lấy ra số lượng comment chúng ta chỉ cần gọi

```ruby
  <%= "#{ @approved_count_hash[post.id].to_i  } approved comments"  %>
  <%= "#{ @pending_count_hash[post.id].to_i } pending comments"  %>
```

Tổng thể chúng ta chỉ cần 3 query, một để lấy ra các post và 2 query để lấy ra 1 hash chứa thông tin số lượng comment vs mỗi post tương ứng.

Sau khi tìm hiểu thì mình thấy đây là cách tốt nhất để giải quyết được vấn đề bộ nhớ và tránh được N+1 query.

Tổng kết thì tùy từng bài toán mà bạn có thể dùng những cách phù hợp để giải quyết, với bài toàn đơn giản chúng ta có thể dùng `counter cache` còn không có thể dùng cách trên or một cách nào khác nhưng phải đảm bảo được 2 vấn đề để ở trên để đảm bảo được perfomance tốt nhất cho website của bạn.

