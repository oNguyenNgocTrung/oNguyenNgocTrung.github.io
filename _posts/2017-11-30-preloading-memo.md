---
layout: post
title: Tản mạn vể Eager Loading trong rails
tags: [rails, preloading, til]
---

Như các bạn đã biết, Rails cung cấp 4 cách khác nhau để load các dữ liệu có liên kết (dữ liệu liên kết qua các bảng).

`Preload`, `Eagerload`, `Includes` và `Joins` là 4 cơ chế khác nhau để load các dữ liệu từ một bảng có quan hệ với một bảng khác. Mỗi cách đều có cơ chế hoạt động khác nhau tùy vào mục đích bài toán bạn sử dụng để tối ưu được câu truy vấn. Ví dụ như `preload` sẽ load dữ liệu quan hệ thông qua các truy vấn tách biệt nhau, `Eager load`  sẽ load toàn bộ dữ liệu quan hệ trong một truy vấn duy nhất sử dụng `LEFT OUTER JOIN`, còn với `include` thì tùy vào câu truy vấn có điều kiện hay ko nó sẽ thực hiện như `Preload` hay `Eager load`.

Đã khá nhiều bài viết nói về cách dùng cũng như sự khác biệt giữa chúng nên bài viết này chỉ tập trung vào 1 số bài toán đặc biệt như `Eager Loading Polymorphic Associations` hay `Preloading Associations với dynamic condition`

Trước hết, chúng ta thiết kế 1 DB và dữ liệu fake như bên dưới

```ruby
# Create database
class CreateAuthors < ActiveRecord::Migration[5.1]
  def change
    create_table :authors do |t|
      t.string :name

      t.timestamps
    end
  end
end

class CreateDirectors < ActiveRecord::Migration[5.1]
  def change
    create_table :directors do |t|
      t.string :name

      t.timestamps
    end
  end
end

class CreateProfiles < ActiveRecord::Migration[5.1]
  def change
    create_table :profiles do |t|
      t.string :name

      t.timestamps
    end
  end
end

class CreateBooks < ActiveRecord::Migration[5.1]
  def change
    create_table :books do |t|
      t.string :name
      t.references :author, index: true

      t.timestamps
    end
  end
end

class CreateFilms < ActiveRecord::Migration[5.1]
  def change
    create_table :films do |t|
      t.string :name
      t.references :director, index: true

      t.timestamps
    end
  end
end

class CreateLikes < ActiveRecord::Migration[5.1]
  def change
    create_table :likes do |t|
      t.references :profile, index: true
      t.references :resource, polymorphic: true, index: true

      t.timestamps
    end
  end
end
```
```ruby
class Author < ApplicationRecord
  has_many :books
end
```

```ruby
class Director < ApplicationRecord
  has_many :films
end
```

```ruby
class Book < ApplicationRecord
  belongs_to :author
  has_many :likes, as: :resource
end
```

```ruby
class Film < ApplicationRecord
  belongs_to :director
  has_many :likes, as: :resource
end
```

```ruby
class Like < ApplicationRecord
  belongs_to :resource, polymorphic: true
  belongs_to :profile
end
```

```ruby
class Profile < ApplicationRecord
  has_many :likes
end
```

```ruby
#Fake data
nolan = Director.create!(name: "Nolan")
shakespeare = Author.create!(name: "Shakespeare")
momento = Film.create!(name: "Momento", director: nolan)
dunkirk = Film.create!(name: "Dunkirk", director: nolan)
macbeth = Book.create!(name: "Macbeth", author: shakespeare)
othello = Book.create!(name: "Othello", author: shakespeare)
john = Profile.create!(name: "John")
paul = Profile.create!(name: "Paul")
Like.create!(profile: john, resource: dunkirk)
Like.create!(profile: john, resource: macbeth)
Like.create!(profile: paul, resource: momento)
Like.create!(profile: paul, resource: othello)
```

**Vấn đề 1**: `Eager Loading Polymorphic Associations`

```ruby
Like.all.each do |like|
  puts case like.resource_type
       when Book.name
         like.resource.author.name
       when Film.name
         like.resource.director.name
       end
end
```

Việc cố gắng dùng `eager load` cho trường hợp muốn lấy thông tin `author` or `director` của `book` và `film` khá khó khăn do chúng ta phải xet đến trường hợp `resource` là loại nào.

Trong trường hợp này thì chúng ta cần tìm hiểu 1 chút về  `ActiveRecord::Association::Preloader`.

```ruby
  # Eager loads the named associations for the given Active Record record(s).
  #
  # In this description, 'association name' shall refer to the name passed
  # to an association creation method. For example, a model that specifies
  # <tt>belongs_to :author</tt>, <tt>has_many :buyers</tt> has association
  # names +:author+ and +:buyers+.
  #
  # == Parameters
  # +records+ is an array of ActiveRecord::Base. This array needs not be flat,
  # i.e. +records+ itself may also contain arrays of records. In any case,
  # +preload_associations+ will preload the all associations records by
  # flattening +records+.
  #
  # +associations+ specifies one or more associations that you want to
  # preload. It may be:
  # - a Symbol or a String which specifies a single association name. For
  #   example, specifying +:books+ allows this method to preload all books
  #   for an Author.
  # - an Array which specifies multiple association names. This array
  #   is processed recursively. For example, specifying <tt>[:avatar, :books]</tt>
  #   allows this method to preload an author's avatar as well as all of his
  #   books.
  # - a Hash which specifies multiple association names, as well as
  #   association names for the to-be-preloaded association objects. For
  #   example, specifying <tt>{ author: :avatar }</tt> will preload a
  #   book's author, as well as that author's avatar.
  #
  # +:associations+ has the same format as the +:include+ option for
  # <tt>ActiveRecord::Base.find</tt>. So +associations+ could look like this:
  #
  #   :books
  #   [ :books, :author ]
  #   { author: :avatar }
  #   [ :books, { author: :avatar } ]
  ActiveRecord::Associations::Preloader.new.preload(records, associations, preload_scope = nil)
```

Có 3 options là:

- `records` đây là 1 array của ActiveRecord::Base. Ví dụ trong trường hợp này records là `Like.all.to_a`

- `associations` chỉ định 1 or nhiều associations mà bạn muốn preload. Ví dụ `:author`, `:director` or `[:author, :director]`

- `preload_scope` đây là 1 optional, trong document của rails ko thấy định nghĩa nhưng theo mình hiểu nó là 1 scope của associations mà bạn muốn đưa vào. Chúng ta sẽ thử ở ví dụ tiếp bên dưới.


Áp dụng `ActiveRecord::Association::Preloader` để giải quyết bài toán ở trên ta có thể làm như sau:

```ruby
class Like::Preloader
  def self.preload(likes)
    preloader = ActiveRecord::Associations::Preloader.new
    preloader.preload(likes.select { |like| like.resource_type.eql?(Book.name) }, { resource: :author })
    preloader.preload(likes.select { |like| like.resource_type.eql?(Film.name) }, { resource: :director })
  end
end
```

```ruby
likes = Like.all
Like::Preloader.preload(likes)
likes.each do |like|
  puts case like.resource_type
       when Book.name
         like.resource.author.name
       when Film.name
         like.resource.director.name
       end
end
```

```
Like Load (0.2ms)  SELECT `likes`.* FROM `likes`
Book Load (0.5ms)  SELECT `books`.* FROM `books` WHERE `books`.`id` IN (1, 2)
Author Load (0.3ms)  SELECT `authors`.* FROM `authors` WHERE `authors`.`id` = 1
Film Load (0.3ms)  SELECT `films`.* FROM `films` WHERE `films`.`id` IN (2, 1)
Director Load (0.2ms)  SELECT `directors`.* FROM `directors` WHERE `directors`.`id` = 1
```

**Vấn đề  2**: `Preloading Associations với dynamic condition`

Ví dụ chúng ta muốn hiển thị tất cả các `authors` và các cuốn sách `book` của `author` đó mà tên `book` bắt đầu bằng chữ bất kì như `T` chằng hạn:

Theo thông thường tránh N+1 ta sẽ làm như sau:

```ruby
Author.includes(:books).each do |author|
  author.books.select{|book| book.name.start_with?("T")}.each do |book|
    puts book.name
  end
end
```

Cách này đã giải quyết được N+1 nhưng vấn đê là chúng ta vẫn load nhiều dữ liệu hơn cái chúng ta cần, như cách trên ta đã load tất cả các book ra mà ko loại trừ chỉ lấy những book bắt đầu bằng chữ `T`.

Cách thứ 2 là sẽ tạo thêm 1 associations cho `Author`

```ruby
class Author < ApplicationRecord
  has_many :books
  has_many :t_start_name_books, -> {where("`books`.`name` LIKE 'T%'")}
end
```

```ruby
Author.includes(:t_start_name_books).each do |author|
  author.t_start_name_books.each do |book|
    puts book.name
  end
end
```

Nó đã giải quyết được vấn đề load thừa dữ liệu. Nhưng nếu điều kiện thay đổi như ko phải bắt đầu bằng chứ `T` nữa mà là chữ `M`.. hay nhiều điều kiện hơn. Tạo 1 associations không hợp lí cho lắm vs những điều kiện phức tạp. Thật may là `ActiveRecord::Association::Preloader` đang còn 1 option là `preload_scope`, cái này như đã nói ở trên là trong document ko ghi rõ nó là cái gì, sử dụng như thế nào, đọc code của thằng này thì mình nghĩ nó là scope của associations, sẽ load những thứ được lọc từ condition.

Thử áp dụng vào ví dụ trên

```ruby
authors = Author.all.to_a
ActiveRecord::Associations::Preloader.new.preload(authors, :books, Book.where("`books`.`name` LIKE 'T%'"))
authors.each do |author|
  author.books.each do |book|
    puts book.name
  end
end
```

```
Author Load (0.5ms)  SELECT `authors`.* FROM `authors`
Book Load (0.3ms)  SELECT `books`.* FROM `books` WHERE (`books`.`name` LIKE 'T%') AND `books`.`author_id` IN (1, 2, 3)
Book Load (0.2ms)  SELECT `books`.* FROM `books` WHERE (`books`.`name` LIKE 'T%')
```

Các câu truy vấn cũng tương tự như cách trên. Chúng ta có thể áp dụng dùng preload cho trường hợp có điều kiện bằng cách này. Với trường hợp preload nhiều `associations` thì có vẻ ko đc. tiếc là trên document ko có mô tả rõ ràng, mình sẽ tìm hiểu cách implement của bọn này và bổ sung ở bài viết sau.
