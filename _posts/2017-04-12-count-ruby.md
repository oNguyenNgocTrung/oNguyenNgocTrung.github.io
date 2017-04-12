---
layout: post
title: Vowel Count(Đếm nguyên âm)
tags: [til, ruby]
---

**Bài toán:**

  Đếm số nguyên âm a,e,i,o,u trong một string cho trước.

  Ví dụ: Cho chuôi "adsfeeff" sẽ trả về kết quả là 3.

**Giải pháp**
  ```
  def getCount inputStr
    inputStr.downcase.count "aeiou"
  end
  ```
  or

  ```
  def getCount inputStr
    inputStr.scan(/[aeiou]/i).size
  end
  ```
