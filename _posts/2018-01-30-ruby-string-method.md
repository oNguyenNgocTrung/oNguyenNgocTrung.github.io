---
layout: post
title: Ruby String Methods (Ultimate Guide)
tags: [ruby, popular]
---

`String` là một object có rất nhiều method mà chúng ta có thể sử dụng để làm việc với chúng. Trong bài này, ta sẽ tìm hiểu các method hữu ích nhất khi làm việc với `string` thông qua các ví dụ.

(Bài viết đươc dịch và tham khảo từ bài gốc ở [đây](http://www.rubyguides.com/2018/01/ruby-string-methods/))

## Lấy chiều dài của một `string`

```ruby
"ruby".size
# 4
```

## String Interpolation là gì?

String interpolation cho phép kết hợp các string với nhau:

```ruby
name = "Jesus"

puts "Hello #{name}"

```

Ngoài ra chúng ta cũng có thể thực hiện một số code bên trong interpolation để trả về giá trị nhưng không được khuyến khích dùng.

```ruby
puts "The total is #{1+1}"

# "the total is 2"
```

## Lấy một chuỗi con trong 1 string

Nếu chỉ muốn một phần của một string, thay vì toàn bộ string, thì ta có thể sử dụng một phạm vi để trích xuất 1 phần đó.

Giống như sau:

```ruby
string = "abc123"

string[0,3]
# abc

string[3,3]
# 123
```

Số đầu tiên là vị trí index kí tự bắt đầu và số thứ hai là số ký tự muốn lấy.

Chúng ta cũng có thể sử dụng một phạm vi để làm điều gì đó như 'nhận được tất cả các kí tự trừ kí tự cuối'.

Ví dụ:

```ruby
string = "abc123"

string[0..-2]
# "abc12"
```

Như đoạn code trên, số đầu tiên là chỉ số bắt đầu và số thứ hai là chỉ số kết thúc(inclusive).

## Xác đinh một string có chứa một string khác.

Cách dễ dàng nhất để tìm ra nếu một string nằm trong một string khác là dùng `include?` method.

```ruby
string = "Today is Saturday"

string.include?("Saturday")
# true
```

Ngoài ra có thể dùng method `index`

```ruby
string = "Today is Sunday"

string.index("day")
# 2
```

Method này tìm kiếm một phần các từ và thay vì trả về `true` hoặc `false` nó sẽ trả về chỉ mục(index) nơi bắt đầu string này được tìm thấy.

Như ví dụ trên, `index` đc tìm kiếm từ `day` trong string `Today`.

## Pad một Ruby String

Một cách để pad một string là sử dụng method `rjust` với hai arguments:

```ruby
binary_string = "1101"
binary_string.rjust(8, "0")

# "00001101"
```

Nếu muốn pad bên phải, sử dụng `ljust`:

```ruby
binary_string = "1111"
binary_string.ljust(8, "0")

# "11110000"
```

## So sánh các strings khi bỏ qua các case

Vì so sánh string là phân biệt chữ hoa chữ thường nhưng nếu muốn chắc chắn 2 strings đều nằm trong cùng một trường hợp thì cách phổ biến để làm điều đó là làm cho cả 2 string đều `upcase` hoặc `downcase`.

Ví dụ:

```ruby
lang1 = "ruby"
lang2 = "Ruby"

lang1.upcase == lang2.upcase
```

## Trim một string và xoá bỏ white space

Khi đọc dữ liệu từ một file hoặc một trang web, có thể thấy có thêm khoảng trắng trong string của mình. Ta có thể loại bỏ nó bằng method `strip`.

```ruby
extra_space = "   test    "
extra_space.strip

# "test"
```

Nếu chỉ muốn xóa khoảng trắng khỏi một trong hai bên (trái / phải), ta có thể sử dụng method `lstrip` & `rstrip`.

## String Prefix & Suffix

Dùng `start_with?` để kiểm tra nếu một string bắt đầu với một tiền tố cụ thể.

Ví dụ:

```ruby
string = "ruby programming"

string.start_with? "ruby"
# true
```

Tương tự với `end_with?`:

```ruby
string = "ruby programming"

string.end_with? "programming"
# true
```

Ngoài ra, Ruby 2.5 đã giới thiệu thêm method `delete_prefix` & `delete_suffix`

```ruby
string = "bacon is expensive"

string.delete_suffix(" is expensive")

# "bacon"
```

## Chuyển một String thành một mảng các kí tự

Lấy một string và phá vỡ nó xuống thành một mảng các ký tự rất dễ dàng với method `split`.

Ví dụ:

```ruby
string = "a b c d"

string.split
# ["a", "b", "c", "d"]
```

Theo mặc định `split` sẽ sử dụng một space như là ký tự phân chia, nhưng ta có thể thêm một đối số vào method này để chỉ định một ký tự phân chia khác.

Dưới đây là cách bạn có thể chia tách một danh sách các giá trị được phân chia bằng dấu phẩy:

```ruby
csv = "a,b,c,d"

string.split(",")
# ["a", "b", "c", "d"]
```

## Chuyển đổi một mảng sang một String

Nếu muốn lấy một mảng bao gồm các string và kết hợp thành một string lớn hơn, ta có thể làm điều đó bằng cách sử dụng method `join`.

Ví dụ:

```ruby
arr = ['a', 'b', 'c']

arr.join
# "abc"
```

Chúng ta cũng có thể thêm một đối số trong method `join`, đối số này là dấu phân chia ký tự.

Ví dụ:

```ruby
arr = ['a', 'b', 'c']

arr.join("-")
# "a-b-c"
```

## Chuyển dổi một string thành một Integer

Nếu muốn chuyển đổi một string như '49' thành số nguyên Integer 49, ta dùng method `to_i`.

```ruby
"49".to_i
```

Lưu ý rằng nếu ta thử điều này với một string không chứa số thì nó sẽ trả về 0.

```ruby
"a".to_i
# 0
```

## Kiểm tra xem một string có phải là một số

Chúng ta có thể làm như sau với method `match?`. Method này được giới thiệu trong phiên bản Ruby 2.4, với version cũ hơn ta dùng `match`(bỏ đi dấu hỏi):

```ruby
"123".match?(/\A-?\d+\Z/)
# true

"123bb".match?(/\A-?\d+\Z/)
# false
```

Đoạn code trên sử dụng một `regular expression` để check string có thoả mãn là một số hoàn toàn ko.

## Làm thế nào để thêm ký tự

Bạn có thể xây dựng một string lớn từ các string nhỏ hơn bằng cách nối các ký tự với một string hiện có.

Đây là cách để làm điều đó bằng cách sử dụng `<<`:

```ruby
string = ""

string << "hello"
string << " "
string << "there"

# "hello there"
```

Không sử dụng `+=` cho điều này vì nó sẽ tạo ra một string mới mỗi lần.

## Iterate Over các ký tự của một string trong Ruby

Đôi khi chúng ta cần làm việc với từng kí tự trong một string. Một cách để làm điều đó là sử dụng method `each_char`:

```ruby
"rubyguides".each_char { |ch| puts ch }
```

Ta cũng có thể sử dụng method `chars` để chuyển đổi string thành một mảng các ký tự. Sau đó dùng mảng này để iterate.

```ruby
array_of_characters = "rubyguides".chars
# ["r", "u", "b", "y", "g", "u", "i", "d", "e", "s"]
```

## Chuyển đổi một string thành chữ hoa hoặc chữ thường trong Ruby

Nếu muốn chuyển đổi một string cho tất cả thành chữ hoa, dùng method `upcase`.

```ruby
"abcd".upcase
# "ABCD"
```

Ngược lại chuyển tất cả thành chữ thuường dùng `downcase`.

```ruby
"ABCD".downcase
# "abcd"
```

## Create Multiline Strings

Ta có thể tạo string gồm nhiều dòng theo hai cách khác nhau.

Một là bằng cách sử dụng heredocs:

```ruby
b = <<-STRING
aaa
bbb
ccc
STRING
```

Và cách khác là bằng cách sử dụng `%Q`:

```ruby
a = %Q(aaa
bbb
ccc
)
```

## Thay thế text bên trong một string

Nếu muốn thay thế một số text bên trong một string ta có thể sử dụng method `gsub`.

Ví dụ thay thế từ 'dog' bằng 'cat':

```ruby
string = "We have many dogs"
string.gsub("dogs", "cats")

# "We have many cats"
```

Lưu ý rằng `gsub` sẽ trả về một string mới, nếu muốn áp dụng các thay đổi cho string ban đầu, ta có thể sử dụng `gsub!`.

Method `gsub` cũng có thể dùng `regular expressions` như một đối số để thay thế các mẫu thay vì các từ chính xác.

Ví dụ:

```ruby
string = "We have 3 cats"

string.gsub(/\d+/, "5")
```

Điều này sẽ thay thế tất cả các số trong string bằng số 5.

Có thêm một cách để sử dụng method này, với một block:

```ruby
title = "the lord of the rings"

title.gsub(/\w+/) { |word| word.capitalize }
# "The Lord Of The Rings"
```
