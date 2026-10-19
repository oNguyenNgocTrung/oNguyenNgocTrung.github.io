---
title: "Go luôn sao chép, và con trỏ cũng không phải ngoại lệ"
tags: [go, pointers]
series: learning-go
language: vi
---

Mười hai năm viết Ruby để lại trong tôi một phản xạ: `b = a` nghĩa là `a` và `b` là hai cái tên cho *cùng một* object. Sửa qua tên này thì nhìn qua tên kia cũng thấy đổi:

```ruby
a = "xin chào"
b = a
b << ", Go"
puts a           # => xin chào, Go
puts a.equal?(b) # => true, cùng một object
```
{: .runnable}

Go thì không như vậy. Trong Go, `b := a` tạo ra một **bản sao độc lập**. Gán biến cũng sao chép, truyền biến vào hàm cũng sao chép. Muốn hai nơi cùng thao tác trên *một* thứ, bạn phải nói thẳng ra điều đó, bằng **con trỏ** (*pointer*).

Đây là bài đầu tiên về con trỏ trong loạt ghi chép học Go của tôi. Bài này chỉ nói về hai ký hiệu `&` và `*`, và chuyện truyền con trỏ vào hàm.

## Con trỏ là gì, và để làm gì

Con trỏ là một giá trị chứa **địa chỉ** của một biến khác, chứ không chứa bản thân dữ liệu.

Nó giải quyết đúng vấn đề ở trên: vì Go luôn sao chép, nên nếu không có con trỏ, mỗi nơi chỉ cầm một bản sao của riêng mình. Có con trỏ thì nhiều nơi cùng chạm được vào một biến gốc. Bạn cần nó trong hai trường hợp:

- Muốn một hàm **sửa được biến** của nơi gọi nó.
- Không muốn **sao chép một struct lớn** mỗi lần truyền đi.

## `&` và `*`

Mỗi biến nằm ở một vị trí nào đó trong bộ nhớ, và vị trí đó có một địa chỉ. Hai ký hiệu cần nhớ:

- **`&x`** nghĩa là "lấy địa chỉ của `x`". Nếu `x` là `int` thì `&x` có kiểu `*int`.
- **`*p`** (đặt trong biểu thức) nghĩa là "đi tới địa chỉ mà `p` đang giữ, rồi đọc hoặc ghi giá trị ở đó". Thao tác này gọi là *dereference*.

Chỗ dễ rối nhất là ký hiệu `*` có **hai vai trò**:

| Đứng ở đâu | Ví dụ | Nghĩa |
|---|---|---|
| Trong **kiểu** | `var p *int` | "kiểu con trỏ tới `int`" |
| Trong **biểu thức** | `*p = 20` | "giá trị tại địa chỉ mà `p` giữ" |

Một cách hình dung: biến giống một **ngôi nhà**, còn con trỏ là **tờ giấy ghi địa chỉ** ngôi nhà đó. Photo tờ giấy ra bao nhiêu bản thì các bản ấy vẫn dẫn về cùng một ngôi nhà.

Hình dung này có một chỗ không đúng với Go: bạn không thể "tính toán" trên địa chỉ. Kiểu `p + 1` như trong C là lỗi biên dịch ngay. Con số địa chỉ cụ thể do runtime quản lý, nên đừng bao giờ dựa vào nó.

## Nhìn bằng hình

Sơ đồ dưới đây là mô hình đơn giản hoá để học, không phải cách bộ nhớ thật sự được sắp xếp. Địa chỉ `0xA0` là số bịa ra cho dễ đọc.

```text
Sau:  x := 10
      p := &x

   biến x                     biến p (kiểu *int)
  ┌────────────┐             ┌────────────┐
  │    10      │ ◄────────── │   0xA0     │
  └────────────┘             └────────────┘
  địa chỉ: 0xA0

  x   → 10        (giá trị của x)
  &x  → 0xA0      (địa chỉ của x)
  p   → 0xA0      (p chứa địa chỉ đó)
  *p  → 10        (đi theo mũi tên, đọc giá trị)
```

Mũi tên nghĩa là "`p` giữ địa chỉ của `x`". Vì vậy khi viết `*p = 20`, bạn đi theo mũi tên và sửa ô bên trái, tức là sửa chính `x`.

## Một ví dụ chạy được

Hai hàm trông gần giống nhau, chỉ khác ở chỗ một hàm nhận `int`, hàm kia nhận `*int`. Bấm **Run** để xem kết quả:

```go
package main

import "fmt"

func doubleCopy(n int) {
	n = n * 2 // chỉ sửa bản sao
}

func doublePtr(n *int) {
	*n = *n * 2 // sửa giá trị tại địa chỉ mà n trỏ tới
}

func main() {
	x := 10
	p := &x
	fmt.Println(*p) // đọc x thông qua p

	*p = 20
	fmt.Println(x) // x đã đổi

	doubleCopy(x)
	fmt.Println(x) // không đổi

	doublePtr(&x)
	fmt.Println(x) // đã đổi
}
```
{: .runnable}

Kết quả là `10`, `20`, `20`, `40`. Theo dõi từng bước:

| Bước | Lệnh | `x` | `p` | Chuyện gì xảy ra |
|---|---|---|---|---|
| 1 | `x := 10` | 10 | — | |
| 2 | `p := &x` | 10 | → `x` | `p` có kiểu `*int`, giữ địa chỉ của `x` |
| 3 | `*p = 20` | 20 | → `x` | ghi vào nơi `p` trỏ tới, nên `x` thành 20 |
| 4 | `doubleCopy(x)` | 20 | → `x` | hàm nhận bản sao số 20, nhân thành 40, rồi bản sao biến mất khi hàm kết thúc |
| 5 | `doublePtr(&x)` | 40 | → `x` | hàm nhận bản sao của địa chỉ; bản sao đó vẫn trỏ về `x`, nên `*n` từ 20 thành 40 |

## Go luôn truyền theo giá trị, kể cả khi dùng con trỏ

Đây là ý quan trọng nhất của bài, và cũng là chỗ tôi phải đọc lại vài lần mới thấy thấm.

Truyền con trỏ **không phải ngoại lệ** của quy tắc "Go luôn sao chép". Ở bước 4, thứ được sao chép là số `20`. Ở bước 5, thứ được sao chép là **địa chỉ** của `x`. Cả hai lần Go đều sao chép. Chỉ có điều, một địa chỉ đã sao chép vẫn dẫn về cùng một chỗ, giống như tờ giấy photo vẫn chỉ về cùng một ngôi nhà.

## Ba lỗi hay gặp

**1. Dereference một con trỏ `nil`.** Giá trị mặc định (*zero value*) của một con trỏ là `nil`, tức là nó chưa trỏ tới đâu cả. Đoạn code sau biên dịch bình thường nhưng crash khi chạy:

```go
package main

func main() {
	var p *int // p là nil
	*p = 5     // đi tới "không đâu cả" để ghi
}
```
{: .runnable}

Chạy thử sẽ thấy:

```text
panic: runtime error: invalid memory address or nil pointer dereference
```

Trước khi dùng `*p`, hãy chắc rằng `p` đang trỏ tới một biến thật, hoặc kiểm tra `p != nil`.

**2. Nhầm hai vai trò của `*`.** `var p *int` là khai báo kiểu, còn `*p = 5` là dereference. Nếu lỡ viết `p = 5` thay vì `*p = 5`, Go báo lỗi biên dịch ngay, vì không thể gán một `int` cho một `*int`:

```text
cannot use 5 (untyped int constant) as *int value in assignment
```

**3. Sợ trả về địa chỉ của biến cục bộ.** Ai từng học C sẽ chột dạ khi thấy `return &x` trong một hàm, vì trong C biến cục bộ biến mất khi hàm kết thúc. Trong Go thì việc này **hoàn toàn an toàn**. Compiler tự quyết định đặt biến ở đâu, qua một bước gọi là *escape analysis*. Nói nôm na, compiler xem biến có còn được dùng sau khi hàm kết thúc hay không. Nếu có, nó đặt biến ở vùng nhớ sống lâu hơn (*heap*) thay vì vùng nhớ bị dọn ngay khi hàm trả về (*stack*). Bạn không phải tự lo chuyện đó. Con trỏ cũng không đồng nghĩa với "cấp phát trên heap".

## Tự kiểm tra

Thử trả lời trước khi mở đáp án.

**Câu 1.** Vì sao `doubleCopy(x)` không làm thay đổi `x`, còn `doublePtr(&x)` thì có? Trong cả hai trường hợp, thứ gì đã được sao chép?

**Câu 2.** Đoạn sau in ra gì?

```go
a := 5
b := a
p := &a
*p = 7
fmt.Println(a, b)
```

**Câu 3.** Viết hàm `swap(x, y *int)` hoán đổi giá trị của hai biến, sao cho đoạn sau in ra `2 1`:

```go
a, b := 1, 2
swap(&a, &b)
fmt.Println(a, b)
```

<details markdown="1">
<summary>Đáp án</summary>

**Câu 1.** `doubleCopy` nhận bản sao của *giá trị* (số 20), sửa bản sao rồi bỏ đi. `doublePtr` nhận bản sao của *địa chỉ*, và địa chỉ đó vẫn dẫn về `x`. Cả hai lần đều là sao chép, chỉ khác thứ được sao chép.

**Câu 2.** `7 5`. `b := a` đã tạo một bản sao từ trước khi `p` xuất hiện, nên `b` hoàn toàn độc lập với `a`. Đây chính là chỗ Go khác Ruby ở đầu bài.

**Câu 3.** Lúc tự làm, tôi viết theo kiểu quen tay, dùng một biến tạm:

```go
func swap(x *int, y *int) {
	z := *y
	*y = *x
	*x = z
}
```

Chạy đúng, nhưng code Go thường viết gọn hơn:

```go
package main

import "fmt"

func swap(x, y *int) { // tham số liền nhau cùng kiểu thì gộp lại
	*x, *y = *y, *x // gán song song, không cần biến tạm
}

func main() {
	a, b := 1, 2
	swap(&a, &b)
	fmt.Println(a, b)
}
```
{: .runnable}

Go tính xong toàn bộ vế phải trước (đọc `*y` và `*x`), rồi mới gán vào vế trái, nên không có chuyện giá trị bị ghi đè giữa chừng.

</details>

## Tóm lại

- `&x` lấy địa chỉ của `x`.
- `*p` đọc hoặc ghi giá trị tại địa chỉ đó.
- `*int` là kiểu "con trỏ tới `int`".
- Go luôn truyền theo giá trị. Con trỏ chỉ là một *giá trị địa chỉ* được sao chép, và bản sao đó vẫn dẫn về đúng chỗ cũ.

Bài tiếp theo sẽ nói về con trỏ tới struct, chỗ mà con trỏ được dùng nhiều nhất trong code thực tế. Bài đó cũng giải thích một điều lạ: vì sao `p.Name` vẫn chạy được dù `p` là con trỏ, không cần viết `(*p).Name`.
