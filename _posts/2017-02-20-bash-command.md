---
layout: post
title: Bash Command
tags: [linux, unix]
---

## Table of contents
- [Một số phím tắt cơ bản khi sử dụng](#keyboard_shortcuts)
- [Tìm kiếm các lệnh đã chạy trong history](#search_history)
  - [Show các lệnh trong quá khứ với](#show_history)
  - [TÌm kiếm history voi grep](#grep)
  - [Sử dụng chức năng tìm kiếm của shell](#shell)
  - [Tìm kiếm history với tiện ích peco](#peco)
  
# Một số phím tắt cơ bản khi sử dụng {#keyboard_shortcuts}

* **Up/Down Arrows:** Dùng mũi tên lên xuống để di chuyển qua lại các câu lệnh đã thực hiện trước đây.
* **Home và End:** Di chuyển con trỏ lên đầu or cuối dòng trong câu lệnh hiện tại.
* **Ctrl+A và Ctrl+E:** tương tự với 2 phím **Home** và **End**
* **Ctrl+K:** Xóa từ vị trí con trỏ đến cuối dòng.
* **Ctrl+W:** Xóa từ vị trí con trỏ đến đầu dòng.
* **Crtl+Left và Ctrl+Right:** Di chuyển giữa các từ trong câu lệnh.
* **Ctrl+U:** Xóa lệnh.
* **Ctrl+L:** Clear Screen tượng tự với lệnh `clear`
* **Ctrl+H:** Xóa chữ trước con trỏ tương tự phím xóa(`backspace`)
* **Ctrl+T:** Đổi chỗ 2 chũ cuối cùng trước con trỏ.
* **Esc+T:** Đổi chỗ cho 2 từ cuối cùng trước con trỏ.

# Tìm kiếm các lệnh đã chạy trong history {#search_history}
**1. Show các lệnh trong quá khứ với `history`. {#show_history} **

 Ví dụ:

 Nhập 2 lệnh:

```
$ cd
$ ls
```

Sau đó truy vấn bằng lệnh `history`

```
$ history
379 cd
380 ls
```

`379`, `380` là id của lệnh đã được nhập. Bạn có thể gọi lại bằng cách `!<history line number>`, ví dụ:

```
$ !379
```
Lệnh này sẽ gọi lại lệnh `cd` vừa gõ ở trên.

Ngoài ra có thể gõ lại lệnh trước đó bằng shortcut `!-1` thay vì dùng phím mũi tên lên.

Để xóa history:

```
$ history -c
```
**2. TÌm kiếm history với `grep`** {#grep}

```
$ history | grep 'từ cần tìm'
```

Lệnh trên sẽ trỏ toàn bộ output của history vào `grep` và `grep` sẽ trích ra các từ cần tìm.
(Tìm hiểu thêm về lệnh `grep` tại [đây](http://www.ntrung.net))

**3. Sử dụng chức năng tìm kiếm của shell** {#shell}

* **Ctrl+r:** Dùng shortcut trên để trả về prompt:

```
(reverse-i-search)`': gõ từ khoá muốn tìm ở đây
```
* **Ctrl+g:** Thoát chức năng tìm kiếm.

**4. Tìm kiếm history với tiện ích `peco`** {#peco}

Peco là một tiện ích giúp pipe output vào một màn hình mà ở đó bạn có thể filter được các chuỗi kí tự tuỳ ý.

Để tìm hiểu thêm bạn có thể đọc tại [https://github.com/peco/peco](https://github.com/peco/peco)

* Cách cài đặt

Trên Ubuntu:

install golang:

```
$ sudo add-apt-repository -y ppa:ubuntu-lxc/lxd-stable
$ sudo apt-get -y update
$ sudo apt-get -y install golang
```

Thêm 2 dòng sau vào file .bashrc(.zshrc nếu bạn dùng zsh)

```
export GOPATH="$HOME/.go"
export PATH=$PATH:$HOME/.go/bin
```

Cài đặt peco

```
go get github.com/peco/peco/cmd/peco
```

Trên Mac chỉ cẩn cài đăt:

```
$ brew install go
$ brew install peco
```

Để sử dụng peco lấy thông tin trong history và gắn shortcut `Ctrl+r` để select history ta thêm đoạn code sau
vào file .bashrc(.zshrc nếu bạn dùng zsh)

```
function peco-select-history() {
  local tac
  if which tac > /dev/null; then
      tac="tac"
  else
      tac="tail -r"
  fi
  BUFFER=$(\history -n 1 | \
      eval $tac | \
      awk '!_[$0]++' | \
      peco --query "$LBUFFER")
  CURSOR=$#BUFFER
  zle clear-screen
}
zle -N peco-select-history
bindkey '^r' peco-select-history
```
