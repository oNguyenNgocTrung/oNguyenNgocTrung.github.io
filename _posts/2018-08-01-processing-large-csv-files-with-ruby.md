---
layout: post
title: Processing large CSV files with Ruby
tags: [ruby, rails, popular]
---

Việc xử lý file lớn là một hoạt động cần bộ nhớ lớn và có thể khiến máy chủ hết RAM và đổi sang ổ đĩa. Với Ruby, có khá nhiều cách để xử lý thông tin những file này, chúng ta cùng kiểm chứng xem tài nguyên hệ thống được tiêu tốn thế nào cho mỗi cách.

## Chuẩn bị dữ liệu mẫu

Trước khi bắt đầu, chúng ta cần chuẩn bị một file CSV `data.csv` với một triệu bản ghi (~75MB) để test.

```ruby
require 'csv'
require_relative './helpers'

headers = ['id', 'name', 'email', 'city', 'street', 'country']

name    = "Pink Panther"
email   = "pink.panther@example.com"
city    = "Pink City"
street  = "Pink Road"
country = "Pink Country"

print_memory_usage do
  print_time_spent do
    CSV.open('data.csv', 'w', write_headers: true, headers: headers) do |csv|
      1_000_000.times do |i|
        csv << [i, name, email, city, street, country]
      end
    end
  end
end
```

Môi trường test hiện tại là:

```
Ruby version : 2.4.0
Operation : ubuntu 16.04
Processor : Intel® Core™ i5-7200U CPU @ 2.50GHz × 4
Memory : 7,6 GiB
```

Ta cần tạo file `helpers.rb` định nghĩa 2 helper methods để  đo và tính toán bộ nhớ sử dụng và thời gian thực hiện.

```ruby
equire 'benchmark'

def print_memory_usage
  memory_before = `ps -o rss= -p #{Process.pid}`.to_i
  yield
  memory_after = `ps -o rss= -p #{Process.pid}`.to_i

  puts "Memory: #{((memory_after - memory_before) / 1024.0).round(2)} MB"
end

def print_time_spent
  time = Benchmark.realtime do
    yield
  end

  puts "Time: #{time.round(2)}"
end
```

Kết quả thu được là:

```
$ ruby generate_csv.rb
Time: 5.14
Memory: 1.04 MB
```

Kết quả có thể khác nhau tùy vào môi trường test nhưng vấn đề là khi tạo file CSV, quá trình xử lý của Ruby không tăng đột biến việc sử dụng bộ nhớ bởi vì garbage collector (GC) đã lấy lại được dữ liệu cũ đã sử dụng. Sự gia tăng bộ nhớ dùng để process là khoảng 1MB, và nó tạo một file CSV khoảng 75MB. Để kiểm chứng, chúng ta hãy xem:

```
$ ls -lah data.csv
-rw-rw-r-- 1 nnt nnt 75M Aug 29 00:34 data.csv
```

## Sử dụng `CSV.read` để đọc cả file

Build một object CSV từ file data.csv và iterate với đoạn code sau:

```ruby
require_relative './helpers'
require 'csv'

print_memory_usage do
  print_time_spent do
    csv = CSV.read('data.csv', headers: true)
    sum = 0

    csv.each do |row|
      sum += row['id'].to_i
    end

    puts "Sum: #{sum}"
  end
end
```

Kết quả thu được là:

```
$ ruby parse1.rb
Sum: 499999500000
Time: 18.8
Memory: 910 MB
```

Điều cần lưu ý ở đây là bộ nhớ lên đến hơn 900MB. Lý do là do có quá nhiều String object được tạo ra, và không được dọn dẹp ngay sau khi đã sử dụng.

## Sử dụng `CSV.parse`

Lần này ta đọc file csv sau đó khởi tạo thành một CSV object để sử dụng.

```ruby
require_relative './helpers'
require 'csv'

print_memory_usage do
  print_time_spent do
    content = File.read('data.csv')
    csv = CSV.parse(content, headers: true)
    sum = 0

    csv.each do |row|
      sum += row['id'].to_i
    end

    puts "Sum: #{sum}"
  end
end
```

Kết quả:

```
$ ruby parse2.rb
Sum: 499999500000
Time: 20.19
Memory: 1000.1 MB
```

Bạn có thể thấy, việc bộ nhớ sử dung ở đây tăng lên do chứa cả object CSV ta vừa parse được.

## Xử lý từng dòng của file

```ruby
require_relative './helpers'
require 'csv'

print_memory_usage do
  print_time_spent do
    content = File.read('data.csv')
    csv = CSV.new(content, headers: true)
    sum = 0

    while row = csv.shift
      sum += row['id'].to_i
    end

    puts "Sum: #{sum}"
  end
end
```

Kết quả:

```
$ ruby parse3.rb
Sum: 499999500000
Time: 5.13
Memory: 71.2 MB
```

Kết quả trên cho ta thấy , bộ nhớ được sử dụng chỉ khoảng 71MB (xấp xỉ bằng dung lượng file). Điều này là vì nội dung file đưuọc load trong bộ nhớ và thời gian xử lý nhanh gấp 3 lần. Hướng tiếp cận này thực sự rất hữu ích khi mà chúng ta chỉ cần nội dung mà không nhất thiết phải đọc hết một tập tin mà chỉ cần đọc từng dòng một.

## Xử lý từng dòng của file từ IO object

```ruby
require_relative './helpers'
require 'csv'

print_memory_usage do
  print_time_spent do
    File.open('data.csv', 'r') do |file|
      csv = CSV.new(file, headers: true)
      sum = 0

      while row = csv.shift
        sum += row['id'].to_i
      end

      puts "Sum: #{sum}"
    end
  end
end

```

Kết quả:

```
$ ruby parse4.rb
Sum: 499999500000
Time: 7.23
Memory: 0.32 MB
```

Ta thấy bộ nhớ sử dụng ít hơn 1M nhưng thời gian thì khá chậm so với các cách trước đó bỏi vì có thêm sự tham gia của IO. Thư viện CSV đã xây dựng cơ chế cho nó bằng cách sử dụng `CSV.foreach`, theo cách như sau:

```ruby
require_relative './helpers'
require 'csv'

print_memory_usage do
  print_time_spent do
    sum = 0

    CSV.foreach('data.csv', headers: true) do |row|
      sum += row['id'].to_i
    end

    puts "Sum: #{sum}"
  end
end
```

Kết quả:

```
$ ruby parse5.rb
Sum: 499999500000
Time: 7.01
Memory: 0.3 MB
```

Để tạo ra sự khác biệt này, theo mình khi sử dụng IO object, thực chất ta đang stream nội dung của object, dùng tới đâu load tới đó chứ không phải load tất cả nội dung file vào bộ nhớ, từ đó dẫn tới sự khác biết hoàn toàn bộ nhớ.

## Kết luận

Phần lớn các trường hợp ta xử lý file csv lớn đều không cần load tất cả vào bộ nhớ làm gì, vì vậy ta hoàn toàn có những cách để xử lý để tiết kiệm tài nguyên hệ thống triệt để.

## Tham khảo

Bài viết trên được dịch và thay đổi theo cách hiểu của người viết.

[https://dalibornasevic.com/posts/68-processing-large-csv-files-with-ruby](https://dalibornasevic.com/posts/68-processing-large-csv-files-with-ruby)
