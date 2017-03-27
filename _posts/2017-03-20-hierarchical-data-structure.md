---
layout: post
title: Tìm hiểu về Hierarchical Data Structure
tags: [ruby, rails]
---

Gần đây mình có làm một dự án có liên quan đến lưu trữ dự liệu dạng phân cấp cha con. Đây là bài toán mình từng được học và dùng trong các bài thi ở trường đại học khá nhiều nhưng là lần đầu tiên mình sử dụng khi làm một dự án thực tế =]] Vậy để ôn lại chút kỉ niệm thời sinh viên, bài viết này sẽ tìm hiểu về dữ liệu dạng phân cấp (hierarchical data structure) và áp dụng bài toán với ROR.

## Table of contents
- Giới thiệu
- Các cách cài đặt
  - Parent-child model (adjacency list model)
  - Nested set model (Mô hình tập hợp lồng nhau)
- Vẽ một cây gia phả gồm cha và con dùng ROR

# Giới thiệu
  Dự liệu dạng phân cấp là một tập hợp các dữ liệu mà mỗi phần tử có một phần tử cha `parent` hoặc có nhiều phần tử con `child` (ngoại trừ phần tử gốc `root` sẽ không có `parent`).

  Việc lưu trữ dữ liệu này được áp dụng nhiều trong các bài toán như phân cấp menu, category...
  Chúng ta sẽ tham khảo cấu trúc cha con phía dưới để làm ví dụ cho toàn bài viết.

  ![Tree](../img/tree.png)

# Các cách cài đặt
  Việc lưu trữ dự liệu này trên CSDL cũng cần có sự tính toán. Dựa vào từng trường hợp mà ta có cách lưu trữ khác nhau. Hiện có 2 mô hình lưu trữ phổ biến là Nested set model (Mô hình tập hợp lồng nhau) và Parent-child model (mô hình cha con).

## Parent-child model
  Trong cấu trúc này thì mỗi một node sẽ có 1 thuộc tính là parent_id dùng để lưu id của node cha của nó. Riêng node đầu tiên (root) sẽ có parent_id là null.

  Tạo database vs dữ liệu dựa trên mô hình ở trên.

  ```
  $ mysql -u root -p
  mysql> create database family_tree;
  mysql> use family_tree;
  mysql> CREATE TABLE families(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL,parent_id INT DEFAULT NULL);
  mysql> INSERT INTO families (name, parent_id) VALUES ("Nguyen Ngoc Ho", NULL), ("Nguyen Ngoc Hoi", 1), ("Nguyen Ngoc Chien", 2), ("Nguyen Ngoc Thanh", 3), ("Nguyen Ngoc Thuan", 3), ("Nguyen Ngoc Than", 2), ("Nguyen Ngoc QUyet", 6), ("Nguyen Ngoc Duy", 6), ("Nguyen Ngoc Phan", 1), ("Nguyen Ngoc Tho", 9), ("Nguyen Ngoc Thanh", 10), ("Nguyen Ngoc Giang", 10), ("Nguyen Ngoc Phat", 9), ("Nguyen Ngoc UY", 13), ("Nguyen Ngoc Dang", 13);
  mysql> Select * from families;
  +----+-------------------+-----------+
  | id | name              | parent_id |
  +----+-------------------+-----------+
  |  1 | Nguyen Ngoc Ho    |      NULL |
  |  2 | Nguyen Ngoc Hoi   |         1 |
  |  3 | Nguyen Ngoc Chien |         2 |
  |  4 | Nguyen Ngoc Thanh |         3 |
  |  5 | Nguyen Ngoc Thuan |         3 |
  |  6 | Nguyen Ngoc Than  |         2 |
  |  7 | Nguyen Ngoc QUyet |         6 |
  |  8 | Nguyen Ngoc Duy   |         6 |
  |  9 | Nguyen Ngoc Phan  |         1 |
  | 10 | Nguyen Ngoc Tho   |         9 |
  | 11 | Nguyen Ngoc Thanh |        10 |
  | 12 | Nguyen Ngoc Giang |        10 |
  | 13 | Nguyen Ngoc Phat  |         9 |
  | 14 | Nguyen Ngoc UY    |        13 |
  | 15 | Nguyen Ngoc Dang  |        13 |
  +----+-------------------+-----------+
  15 rows in set (0,00 sec)
  ```
  Như cách cài đặt ở trên `Nguyen Ngoc Ho` có  `parent_id` là  `NULL` vì nó là phần tử gốc(ông tổ của cây phả hệ trên). `Nguyen Ngoc Hoi` hay `Nguyen Ngoc Phan` đều có `parent_id` là 1, bởi vì bố của 2 ông này là `Nguyen Ngoc Ho` có `id` là 1. Tương đương như trên ta lưu được một cấu trúc cây dựa trên kiểu parent-child này vào CSDL.

  Với cách lưu như trên thì việc tìm node cha hay update, insert dữ liệu khá đơn giản. Nhưng với các yêu cầu như duyêt toàn bộ cây hay duyêt một nhánh của cây thì nó khá là phức tạp.

  Ví dụ:

  **Duyệt toàn bộ cây**

  ```
  mysql> SELECT f1.name AS the_he_1, f2.name AS the_he_2, f3.name AS the_he_3, f4.name AS the_he_4 FROM families AS f1 LEFT JOIN families AS f2 ON f2.parent_id = f1.id LEFT JOIN families AS f3 ON f3.parent_id = f2.id LEFT JOIN families AS f4 ON f4.parent_id = f3.id WHERE f1.name = "Nguyen Ngoc Ho";
  +----------------+------------------+-------------------+-------------------+
  | the_he_1       | the_he_2         | the_he_3          | the_he_4          |
  +----------------+------------------+-------------------+-------------------+
  | Nguyen Ngoc Ho | Nguyen Ngoc Hoi  | Nguyen Ngoc Chien | Nguyen Ngoc Thanh |
  | Nguyen Ngoc Ho | Nguyen Ngoc Hoi  | Nguyen Ngoc Chien | Nguyen Ngoc Thuan |
  | Nguyen Ngoc Ho | Nguyen Ngoc Hoi  | Nguyen Ngoc Than  | Nguyen Ngoc QUyet |
  | Nguyen Ngoc Ho | Nguyen Ngoc Hoi  | Nguyen Ngoc Than  | Nguyen Ngoc Duy   |
  | Nguyen Ngoc Ho | Nguyen Ngoc Phan | Nguyen Ngoc Tho   | Nguyen Ngoc Thanh |
  | Nguyen Ngoc Ho | Nguyen Ngoc Phan | Nguyen Ngoc Tho   | Nguyen Ngoc Giang |
  | Nguyen Ngoc Ho | Nguyen Ngoc Phan | Nguyen Ngoc Phat  | Nguyen Ngoc UY    |
  | Nguyen Ngoc Ho | Nguyen Ngoc Phan | Nguyen Ngoc Phat  | Nguyen Ngoc Dang  |
  +----------------+------------------+-------------------+-------------------+
  8 rows in set (0,00 sec)
  ```

  **Tìm tất cả các nút lá trong cây (những nốt không có con)**

  ```
  mysql> SELECT f1.id, f1.name FROM families AS f1 LEFT JOIN families AS f2 ON f1.id = f2.parent_id WHERE f2.id IS NULL;
  +----+-------------------+
  | id | name              |
  +----+-------------------+
  |  4 | Nguyen Ngoc Thanh |
  |  5 | Nguyen Ngoc Thuan |
  |  7 | Nguyen Ngoc QUyet |
  |  8 | Nguyen Ngoc Duy   |
  | 11 | Nguyen Ngoc Thanh |
  | 12 | Nguyen Ngoc Giang |
  | 14 | Nguyen Ngoc UY    |
  | 15 | Nguyen Ngoc Dang  |
  +----+-------------------+
  8 rows in set (0,00 sec)
  ```

  **Duyệt một nhánh của cây**

  ```
  mysql> SELECT f1.name AS the_he_1, f2.name AS the_he_2, f3.name AS the_he_3, f4.name AS the_he_4 FROM families AS f1 LEFT JOIN families AS f2 ON f2.parent_id = f1.id LEFT JOIN families AS f3 ON f3.parent_id = f2.id LEFT JOIN families AS f4 ON f4.parent_id = f3.id WHERE f1.name = "Nguyen Ngoc Ho" AND f4.name = "Nguyen Ngoc Dang";
  +----------------+------------------+------------------+------------------+
  | the_he_1       | the_he_2         | the_he_3         | the_he_4         |
  +----------------+------------------+------------------+------------------+
  | Nguyen Ngoc Ho | Nguyen Ngoc Phan | Nguyen Ngoc Phat | Nguyen Ngoc Dang |
  +----------------+------------------+------------------+------------------+
  1 row in set (0,00 sec)
  ```

## Nested set model
