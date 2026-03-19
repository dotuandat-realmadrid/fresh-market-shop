-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: fresh-market
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP DATABASE IF EXISTS `fresh-market`;
CREATE DATABASE `fresh-market`;
USE `fresh-market`;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` varchar(36) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL,
  `createddate` datetime(6) DEFAULT NULL,
  `modifieddate` datetime(6) DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `modifiedby` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('4f213730-ede7-4709-ac08-ab849fc779de','STAFF_INVENTORY','Nhân viên kiểm kho',1,NULL,NULL,NULL,NULL),
('5376954e-d221-40cb-afa4-35a196ac6769','CUSTOMER','Khách hàng',1,NULL,NULL,NULL,NULL),
('844a29ca-5087-44dc-ab67-1b95628fcd4d','STAFF_SALE','Nhân viên bán hàng',1,NULL,NULL,NULL,NULL),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','ADMIN','Admin',1,NULL,NULL,NULL,NULL),
('d05f2583-888c-4c8a-bea4-cb5b76154684','STAFF_CUSTOMER_SERVICE','Nhân viên chăm sóc khách hàng',1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(36) NOT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `createddate` datetime(6) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT 1,
  `modifiedby` varchar(255) DEFAULT NULL,
  `modifieddate` datetime(6) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `level` int NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_category_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` (`id`, `createdby`, `createddate`, `is_active`, `modifiedby`, `modifieddate`, `code`, `name`, `image_path`, `level`, `description`) VALUES
-- Level 1: Danh mục chính (menu trái)
('03672617-9174-4944-ae9c-3389d6fddf8b', 'admin@gmail.com', '2026-03-02 10:00:00.000000', 1, 'admin@gmail.com', NOW(), 'khuyen-mai', 'Khuyến Mãi Hot', 'menu_icon_1.png', 1, 'Khuyến Mãi'),
('0edeeec4-514e-4423-a95a-9e7e49f9aed6', 'admin@gmail.com', '2026-03-02 10:00:00.000001', 1, 'admin@gmail.com', NOW(), 'gio-hoa-qua-nhap-khau', 'Quà Tặng Trái Cây',  'menu_icon_2.png', 1, 'Giỏ Hoa Quả Nhập Khẩu Cao Cấp - Quà Tặng Ý Nghĩa'),
('12c833ab-527e-46c6-bb5e-0771a898fc36', 'admin@gmail.com', '2026-03-02 10:00:00.000002', 1, 'admin@gmail.com', NOW(), 'qua-tang-cao-cap', 'Quà Tặng Thực Phẩm',  'menu_icon_3.png', 1, 'Quà Tặng Thực Phẩm'),
('1d2299b6-3783-46e0-b0dd-245542d26a4f', 'admin@gmail.com', '2026-03-02 10:00:00.000003', 1, 'admin@gmail.com', NOW(), 'trai-cay', 'Trái Cây', 'menu_icon_4.png', 1, 'Trái Cây'),
('293ac549-db0d-458d-87f8-9ece5827e20c', 'admin@gmail.com', '2026-03-02 10:00:00.000004', 1, 'admin@gmail.com', NOW(), 'thuc-pham-huu-co', 'Thực Phẩm Hữu Cơ',  'menu_icon_5.png', 1, 'Thực Phẩm Hữu Cơ'),
('4ee24d42-77dc-43ce-960f-e06cfb713083', 'admin@gmail.com', '2026-03-02 10:00:00.000005', 1, 'admin@gmail.com', NOW(), 'rau-cu', 'Rau Củ & Nấm', 'menu_icon_6.png', 1, 'Rau Củ, Nấm'),
('6a768ea0-ebf9-4e85-910b-66a353e27923', 'admin@gmail.com', '2026-03-02 10:00:00.000006', 1, 'admin@gmail.com', NOW(), 'thit-ca-trung', 'Thịt, Cá, Trứng & Hải Sản', 'menu_icon_7.png', 1, 'Thịt, Cá, Trứng & Hải Sản'),
('6dd4379e-e7b7-4a8f-9649-0328a0a61d8a', 'admin@gmail.com', '2026-03-02 10:00:00.000007', 1, 'admin@gmail.com', NOW(), 'bo-sua', 'Bơ, Sữa, Phô Mai',  'menu_icon_8.png', 1, 'Bơ Sữa, Phomai'),
('8af78245-0016-4e78-8424-82232802e656', 'admin@gmail.com', '2026-03-02 10:00:00.000008', 1, 'admin@gmail.com', NOW(), 'thuc-pham-dong-mat', 'Thực Phẩm Đông Mát',  'menu_icon_9.png', 1, 'Thực Phẩm Đông Mát'),
('967602fb-2e2b-4aeb-9eb8-5897ae55c619', 'admin@gmail.com', '2026-03-02 10:00:00.000009', 1, 'admin@gmail.com', NOW(), 'thuc-pham-kho', 'Thực Phẩm Khô', 'menu_icon_10.png', 1, 'Thực Phẩm Khô'),
('220d1e42-3ba9-475b-950a-0392668f583c', 'admin@gmail.com', '2026-03-02 10:00:00.000010', 1, 'admin@gmail.com', NOW(), 'banh-keo-thuc-uong','Bánh, Kẹo & Thức Uống', 'menu_icon_11.png', 1, 'Bánh, Kẹo & Thức Uống'),
('030da7c9-d09e-4016-b885-c2df0ddb5260', 'admin@gmail.com', '2026-03-02 10:00:00.000011', 1, 'admin@gmail.com', NOW(), 'cham-soc-suc-khoe','Thực Phẩm Chăm Sóc Sức Khỏe', 'menu_icon_12.png', 1, 'Chăm Sóc Sức Khỏe'),
('0edeeec4-514e-4423-a95a-9e7e49fa9ed6', 'admin@gmail.com', '2026-03-02 10:00:00.000012', 1, 'admin@gmail.com', NOW(), 'hoa-cay', 'Hoa, Cây Xanh', 'menu_icon_13.png', 1, 'Hoa & Cây'),
('3713c508-7713-4d9f-96e8-0e1eb36b979e', 'admin@gmail.com', '2026-03-02 10:00:00.000013', 1, 'admin@gmail.com', NOW(), 'do-dung-gia-dinh-2','Chăm Sóc Nhà Cửa, Cá Nhân', 'menu_icon_14.png', 1, 'Đồ Dùng Gia Đình'),

-- Level 2: Danh mục con của Quà Tặng Trái Cây
('48f8997a-dc5c-4f55-b32d-8a1f3e281fd8', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'san-pham-ban-chay', 'Sản Phẩm Bán Chạy', 'menu2_icon_1.jpg', 2, 'Sản Phẩm Bán Chạy'),
('adcf99cd-9a49-42e1-9120-b0e5cda6614e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'hop-qua-trai-cay', 'Hộp Quà Trái Cây', 'menu2_icon_2.jpg', 2, 'Hộp Quà Trái Cây'),
('d71186c0-5756-4ee8-b27d-df635fdb726a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gio-trai-cay-nhap', 'Giỏ Trái Cây', 'menu2_icon_3.jpg', 2, 'Giỏ Trái Cây Nhập'),
('a20e7a76-5913-4025-9e0b-9bfcb20c45c6', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'bst-trai-cay-cao-cap', 'Quà Tặng Trái Cây Cao Cấp', 'menu2_icon_4.jpg', 2, 'BST Trái Cây Cao Cấp'),
('b738b69a-cb75-4382-8ce4-2ca62f92af02', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-8-3', 'Quà Tặng 8/3', 'menu2_icon_5.jpg', 2, 'Quà Tặng 8/3'),
('b75bd02b-6635-4c81-b7bd-d588bd34a28b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gio-trai-cay-hoa', 'Giỏ Trái Cây & Hoa', 'menu2_icon_6.jpg', 2, 'Giỏ Trái Cây & Hoa'),
('bc4d7360-ba80-46f7-acb5-b48d760ff07b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'hop-qua-trai-cay-hoa', 'Hộp Quà Trái Cây & Hoa', 'menu2_icon_7.jpg', 2, 'Hộp Quà Trái Cây & Hoa'),
('36dcbb75-2988-4e4c-ae9c-fe57d3f5483f', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gio-trai-cay-cam-on', 'Giỏ Trái Cây Cảm Ơn', 'menu2_icon_8.jpg', 2, 'Giỏ Trái Cây Cảm Ơn'),
('02aefc7c-a1cf-49e0-ac6a-3da23e1f4131', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gio-trai-cay-chuc-mung', 'Giỏ Trái Cây Chúc Mừng', 'menu2_icon_9.jpg', 2, 'Giỏ Trái Cây Chúc Mừng'),
('fcf06f4d-1c0e-4453-b094-6f8c87db70e4', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-sinh-nhat', 'Giỏ Trái Cây Sinh Nhật', 'menu2_icon_10.jpg', 2, 'Quà Sinh Nhật'),
('d71186c3-5756-4ee8-b27d-df635fdb726a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gio-trai-cay-dang-le', 'Giỏ Trái Cây Dâng Lễ', 'menu2_icon_11.jpg', 2, 'Giỏ Trái Cây Dâng Lễ'),
('cb4b3ec0-3665-4b3e-8bc7-8cfe5626bc2e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gio-trai-cay-dam-tang', 'Giỏ Trái Cây Đám Tang', 'menu2_icon_12.jpg', 2, 'Giỏ Trái Cây Đám Tang'),
('f57af8cc-bb54-4f3d-9e60-6e2f6f1bf9b1', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-trai-cay-theo-mua', 'Trái Cây Theo Mùa', 'menu2_icon_13.jpg', 2, 'Quà Tặng Trái Cây Theo Mùa'),
('c407c1ba-7d80-4684-b82a-db01e9017106', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-nhom-kiwi', 'Kiwi', 'menu2_icon_14.jpg', 2, 'Quà Tặng Nhóm Kiwi'),
('aba8a146-dc87-4786-9768-676c813040e0', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-cac-loai-nho', 'Nho', 'menu2_icon_15.jpg', 2, 'Quà Tặng Các Loại Nho'),
('dfbeb19c-21d0-4e24-bc60-091f18db6638', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-cherry', 'Cherry', 'menu2_icon_16.jpg', 2, 'Quà Tặng Cherry'),
('fc130572-0f12-4889-a874-1ce0e6adbc4f', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-nhom-tao-le', 'Táo, Lê', 'menu2_icon_17.jpg', 2, 'Quà Tặng Nhóm Táo, Lê'),
('7941d5cc-3d0d-4978-8321-8246b61fc67d', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-envy', 'Táo Envy', 'menu2_icon_18.jpg', 2, '"Magic Envy Moments" Collection'),
('0ffba7e9-8789-401c-b564-c2366ba425a2', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-nhom-cam-quyt', 'Cam, Quýt', 'menu2_icon_19.jpg', 2, 'Quà Tặng Nhóm Cam, Quýt'),
('4e18aff3-6e8f-4e78-8258-9dffc001a01b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-cay-xanh', 'Cây Xanh', 'menu2_icon_20.jpg', 2, 'Quà Tặng Cây Xanh'),

-- Level 2: Danh mục con của Quà Tặng Thực Phẩm
('d459df02-7e70-4b2e-9f33-0bcd1789c813', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trung-thu', 'Tết Trung Thu', 'menu3_icon_1.jpg', 2, 'Quà Tặng Trung Thu'),
('dc9bdcd0-500c-4511-896e-4d828ecfc210', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-thuc-pham-va-thuc-uong', 'Thực Phẩm & Thức Uống', 'menu3_icon_2.jpg', 2, 'Quà Tặng Thực Phẩm và Thức Uống'),
('ee97933d-86ba-4e3c-8536-f9c70212fa09', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ruou-vang-pho-mai-thit-nguoi', 'Rượu Vang & Phô Mai, Thịt Nguội', 'menu3_icon_3.jpg', 2, 'Rượu Vang & Phô Mai, Thịt nguội'),
('f15405dd-ba41-4954-bad6-65232a8309ab', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-thuc-pham-huu-co', 'Quà Tặng Hữu Cơ - Organic', 'menu3_icon_4.jpg', 2, 'Quà Tặng Thực Phẩm Hữu Cơ'),
('3707cb66-e53a-4295-a5d3-845625c924b6', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'hop-qua-ruou-vang', 'Rượu Vang', 'menu3_icon_5.jpg', 2, 'Hộp Quà Rượu Vang'),
('06b03f7c-2b25-4a4b-934a-96f5c29e2736', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'yen-sao', 'Yến Sào', 'menu3_icon_6.jpg', 2, 'Yến Sào'),
('08814390-d044-43ee-a8fe-2ca385f682d1', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nhan-sam', 'Nhân Sâm', 'menu3_icon_7.jpg', 2, 'Nhân Sâm'),
('0d971c5b-47f3-442b-a8d8-b5203f5ddff2', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'mat-ong-manuka', 'Mật Ong Manuka', 'menu3_icon_8.jpg', 2, 'Mật Ong Manuka'),
('0dcec000-e12e-4c14-a5a0-456daf28664a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-snack-box', 'Hộp Quà Snack Box', 'menu3_icon_9.jpg', 2, 'Hộp Quà Snack Box'),
('0e149c35-b9e4-4af1-ba4d-b7285111ffc6', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'tui-qua-dac-san', 'Quà Tặng Đặc Sản Việt Nam', 'menu3_icon_10.jpg', 2, 'Quà Tặng Đặc Sản Việt Nam'),
-- ('4e18aff3-6e8f-4e78-8258-9dffc001a01b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-cay-xanh', 'Cây Xanh', 'menu2_icon_20.jpg', 2, 'Quà Tặng Cây Xanh'),
('20665167-67d3-4fff-a198-94f11ce6ff64', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nen-thom-tinh-dau', 'Nến Thơm & Tinh Dầu', 'menu3_icon_12.jpg', 2, 'Nến Thơm & Tinh Dầu'),

-- Level 2: Danh mục con của Quà Tặng Trái Cây
('31f57c4c-b50c-485f-993f-4c480877b3f5', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trai-cay-nhap', 'Trái Cây Nhập Khẩu', 'menu4_icon_1.jpg', 2, 'Trái Cây Nhập'),
('66e4808b-cc16-40d1-8c4c-511785a8b27e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trai-cay-viet', 'Trái Cây Việt Nam', 'menu4_icon_2.jpg', 2, 'Trái Cây Việt'),
('4fc28aae-8101-4b95-85ac-2c89f6a0c5b9', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trai-cay-cat-san', 'Trái Cây Cắt Sẵn', 'menu4_icon_3.jpg', 2, 'Trái Cây Cắt Sẵn Tươi Ngon'),
('43175b90-311c-4643-815c-0e9358a27825', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trai-cay-thung', 'Trái Cây Thùng', 'menu4_icon_4.jpg', 2, 'Trái Cây Thùng'),

-- Level 3: Danh mục con của Trái Cây Nhập Khẩu
('2613ed26-3981-46f4-9ddb-a9702cc5e8d5', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nho-xanh-khong-hat', 'Nho Nhập Khẩu', NULL, 3, 'Tuyển Chọn Nho Xanh Không Hạt & Các Loại Nho Nhập Khẩu Khác'),
('395c2954-bfe8-4fbe-a05e-ddf2c6b9de3e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'viet-quat-dau-tay-cac-loai', 'Dâu Tây & Các Loại Berry Nhập Khẩu', NULL, 3, 'Dâu Tây & Các Loại Berry Nhập Khẩu'),
('42f5635e-8f51-485a-940b-d0b3afbddc4e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'tao-envy', 'Táo Envy', NULL, 3, 'Táo Envy'),
('45c43b45-2360-4ffa-87ad-16bebafa9e9b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trai-cay-huu-co', 'Trái Cây Hữu Cơ', NULL, 3, 'Trái Cây Hữu Cơ'),
('50db492a-679a-4a21-bad4-b1e45394bab2', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'kiwi', 'Kiwi Nhập Khẩu', NULL, 3, 'Kiwi Nhập Khẩu'),
('512eff7d-e023-452d-97b8-dfd8e37389da', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'man-nhap-khau', 'Mận Nhập Khẩu', NULL, 3, 'Mận Nhập Khẩu'),
('523e1850-7467-48b9-9457-02b4427210df', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'tao', 'Táo Nhập Khẩu', NULL, 3, 'TÁO NHẬP KHẨU'),
('5acb4348-3815-4c20-94ae-0cc5d71d366e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cherry', 'Cherry Nhập Khẩu (Hết Mùa)', NULL, 3, 'Cherry Nhập Khẩu Mỹ, Úc - Ngọt, Giòn, Giá Tốt'),

-- Level 3: Danh mục con của Trái Cây Việt Nam
('5f67d4aa-e7b0-42e3-a6f8-59e5ae56c740', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trai-cay-theo-mua', 'Trái Cây Theo Mùa', NULL, 3, 'Trái Cây Theo Mùa'),
('6c59315f-836c-4434-970a-5c6e9cd9af44', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'xoai-chuoi', 'Xoài & Chuối', NULL, 3, 'Xoài & Chuối'),
('6fc0e39f-565d-44f9-99d4-84df16559f27', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'tao-le-oi-tcv', 'Táo, Lê, Ổi', NULL, 3, 'Táo, Lê, Ổi TCV'),
('8e8114eb-0b7c-4068-9c09-94c19e742353', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'buoi-cam-quyt-tcv', 'Bưởi, Cam, Quýt', NULL, 3, 'Bưởi, Cam, Quýt TCV'),

-- Level 2: Danh mục con của Thực Phẩm Hữu Cơ
('991b858e-886a-48c9-8ff4-71a368edf344', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trai-cay-organic-huu-co', 'Trái Cây Hữu Cơ', 'menu5_icon_1.jpg', 2, 'Trái Cây Organic / Hữu Cơ'),
('a060c6ea-41f0-4b45-87e5-064bb54a5328', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thuc-pham-kho-huu-co', 'Thực Phẩm Khô Hữu Cơ', 'menu5_icon_2.jpg', 2, 'Thực Phẩm Khô Hữu Cơ'),
('a3ad1e70-a248-413b-8af1-86219b3a1c02', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gao-huu-co', 'Gạo Hữu Cơ Chất Lượng Cao', 'menu5_icon_3.jpg', 2, 'Gạo Hữu Cơ Chất Lượng Cao'),
('b927eeb0-927e-4642-afac-7d384e6d9e2d', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gia-vi-huu-co-1', 'Gia Vị Hữu Cơ', 'menu5_icon_4.jpg', 2, 'Gia Vị Hữu Cơ'),
('bdcc2d5c-b204-40a3-b20f-284d8f2ea6f1', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'hat-trai-cay-say-huu-co', 'Hạt - Trái Cây Sấy Hữu Cơ', 'menu5_icon_5.jpg', 2, 'Hạt - Trái Cây Sấy Hữu Cơ'),
('be2198fb-f016-48b5-b324-58b32b725882', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thuc-uong-huu-co', 'Thức Uống Hữu Cơ', 'menu5_icon_6.jpg', 2, 'Thức Uống Hữu Cơ'),
('c1fc8ce9-ac6f-44b5-a797-be02e16e84b7', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'sua-tp-huu-co-cho-be', 'Sữa & TP. Hữu Cơ Cho Bé', 'menu5_icon_7.jpg', 2, 'Sữa & TP. Hữu Cơ Cho Bé'),
-- ('f15405dd-ba41-4954-bad6-65232a8309ab', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-thuc-pham-huu-co', 'Quà Tặng Hữu Cơ - Organic', 'menu3_icon_4.jpg', 2, 'Quà Tặng Thực Phẩm Hữu Cơ'),
('d72c2816-d523-4527-8628-295919f9cb63', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'keo-huu-co', 'Kẹo Hữu Cơ', 'menu5_icon_9.jpg', 2, 'Kẹo Hữu Cơ'),

-- Level 2: Danh mục con của Rau Củ & Nấm
('d9051ce0-f139-4d63-9f62-e555992045cd', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'rau-an-la', 'Rau Ăn Lá', 'menu6_icon_1.jpg', 2, 'Rau Ăn Lá'),
('e7747def-c7aa-4ab4-97a1-414f7c935659', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cu-qua', 'Củ, Quả', 'menu6_icon_2.jpg', 2, 'Củ, Quả'),
('ebc4e1cf-9331-4407-97e7-fb9d19bf41c8', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nam-dau-hu-tu-nhien-huu-co', 'Nấm, Đậu Hũ', 'menu6_icon_3.jpg', 2, 'Nấm & Đậu Hũ'),
('f012f7f4-a50a-44bd-88fb-2b162df6d28c', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'kim-chi-dua-muoi-rong-nho', 'Kim Chi - Đồ Chua - Rong nho', 'menu6_icon_4.jpg', 2, 'Kim Chi - Đồ Chua - Rong nho'),

-- Level 3: Danh mục con của Rau Ăn Lá
('fc124dfc-aff6-488e-b2f5-cbde4eaeabd4', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'rau-la', 'Rau Lá', NULL, 3, 'Rau Ăn Lá'),
('7c65169a-f152-4c51-b247-523dde58254d', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'rau-gia-vi', 'Rau Gia Vị', NULL, 3, 'Rau Gia Vị'),
('7d7581be-a4e8-4d6b-8d6b-db9ab99e44a0', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'salad', 'Salad Hỗn Hợp', NULL, 3, 'Tổng Hợp Nguyên Liệu Làm Các Món Salad'),
('7d7581be-aff6-488e-b2f5-cbde4eaeabd4', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'rau-huu-co', 'Rau Hữu Cơ', NULL, 3, 'Rau hữu cơ'),

-- Level 3: Danh mục con của Củ, Quả
('fc124bfc-a4e8-488e-b2f5-cbde4eaeabd4', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'rau-cu-qua-an-toan', 'Củ, Quả Tươi', NULL, 3, 'Rau Củ Quả An Toàn'),
('fc124bfc-aff6-488e-88fb-cbde4eaeabd4', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'rau-cu-qua-huu-co', 'Củ, Quả Hữu Cơ', NULL, 3, 'Rau Củ Quả Hữu Cơ'),
('fc124bfc-aff6-88fb-b2f5-2b162df6d28c', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'rau-cu-dong-lanh', 'Củ, Quả Sơ Chế - Đông Lạnh', NULL, 3, 'Củ Quả Sơ Chế - Đông Lạnh'),

-- Level 3: Danh mục con của Nấm, Đậu Hủ
('7eb01433-b25a-42f7-804b-5791d54ab501', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nam', 'Nấm', NULL, 3, 'Nấm'),
('7f4de4fa-3a46-4974-9bf0-f80ed077a445', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'dau-hu', 'Đậu Hủ', NULL, 3, 'Đậu hũ'),

-- Level 2: Danh mục con của Thịt, Cá, Trứng & Hải Sản
('c2d7a358-14c3-4107-bac6-3eb564fa4b43', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-heo', 'Thịt Heo', 'menu7_icon_1.jpg', 2, 'Thịt heo'),
('124953d7-8959-4336-a223-8f738b7d01e2', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-bo', 'Thịt Bò', 'menu7_icon_2.jpg', 2, 'Thịt bò'),
('14830a4b-d356-441b-b0ef-8c15f868547c', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-ga-vit-chim', 'Thịt Gà, Vịt & Chim', 'menu7_icon_3.jpg', 2, 'Thịt Gà, Vịt, Chim'),
('16c32245-d8e7-4857-9a22-217fe3fbafed', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ca-hai-san', 'Cá, Hải Sản', 'menu7_icon_4.jpg', 2, 'Cá, Hải Sản'),

-- Level 3: Danh mục con của Thịt Heo
('7fa5946b-e27b-4098-9c88-b5e11aeb9dee', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-heo-tuoi-mat', 'Thịt Heo Tươi Mát', NULL, 3, 'Thịt Heo Tươi Mát'),

-- Level 3: Danh mục con của Thịt Bò
('17b4ddb9-62b3-4ae4-9cf7-ba9ce6bbfa02', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-bo-tuoi-mat', 'Thịt Bò Tươi Mát', NULL, 3, 'Thịt Bò Tươi Mát'),
('187a09db-d677-4ebf-97f8-31bf8c0eee84', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-bo-dong-mat', 'Thịt Bò Đông Mát', NULL, 3, 'Thịt Bò Đông Mát'),
('18b41eea-99d2-444a-b721-e41c08935f0d', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-bo-nhap-khau', 'Thịt Bò Nhập Khẩu', NULL, 3, 'Thịt Bò Nhập Khẩu'),

-- Level 3: Danh mục con của Thịt Gà, Vịt & Chim
('18ca3cd9-5af9-40c1-94a2-44c058e34e62', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-ga-vit-chim-tuoi-mat', 'Thịt Gà, Vịt Chim Tươi Mát', NULL, 3, 'Thịt Gà, Vịt Chim Tươi Mát'),
('198b1686-7f6b-4c54-9b8e-8b5db5ce71ea', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-ga-vit-chim-dong-lanh', 'Thịt Gà, Vịt Chim Đông Lạnh', NULL, 3, 'Thịt Gà, Vịt Chim Đông Lạnh'),
('1a21d219-71d4-4458-832f-c1727c84e325', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trung-ga-vit-cut', 'Trứng Gà, Vịt, Cút', NULL, 3, 'Trứng Gà, Vịt, Cút'),

-- Level 3: Danh mục con của Cá, Hải Sản
('1a32e2d7-a14d-48b6-acd6-6a6db993467c', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ca-hai-san-tuoi-mat', 'Cá, Hải Sản Tươi Mát', NULL, 3, 'Cá, Hải Sản Tươi Mát'),
('1a58c062-ebe1-4d81-aafa-f597fee26781', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'hai-san-kho-mot-nang', 'Hải Sản Khô Một Nắng', NULL, 3, 'Hải Sản Khô & Một Nắng'),
('1a93c040-80d6-4b95-b70d-b18e1bbd085e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ngheu-so-oc-hen', 'Nghêu, Sò, Ốc, Hến', NULL, 3, 'Nghêu, Sò, Ốc, Hến'),

-- Level 2: Danh mục con của Bơ, Sữa, Phô Mai
('1aad1cfd-dffc-4ef6-91e6-25569179ec94', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'sua-dong-vat-1', 'Sữa Động Vật', 'menu8_icon_1.jpg', 2, 'Sữa Động Vật'),
('1acaf12c-daeb-4ccd-b9c0-9fed2f251270', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'sua-thuc-vat', 'Sữa Thực Vật', 'menu8_icon_2.jpg', 2, 'Sữa Thực Vật'),
('1bf6c6fd-f7c1-48bb-82ed-cb9d9e63b341', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'sua-chua', 'Sữa Chua', 'menu8_icon_3.jpg', 2, 'Sữa Chua'),
('1d6b1cba-5850-41e6-a7e9-6cec5f093b31', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'pho-mai', 'Phô Mai', 'menu8_icon_4.jpg', 2, 'Phô mai'),
('1e0cb2be-15b9-44fa-ba22-d1a28e73b642', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'bo', 'Bơ', 'menu8_icon_5.jpg', 2, 'Bơ'),
('1e168207-456c-4990-beda-b86446adf1e2', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thach-pudding', 'Bánh Flan - Thạch - Chè', 'menu8_icon_6.jpg', 2, 'Bánh Flan - Thạch - Chè'),

-- Level 3: Danh mục con của Sữa Động Vật
('21ac9bd9-93ea-450e-967f-30c8b6433a7e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'sua-thanh-trung', 'Sữa Thanh Trùng', NULL, 3, 'Sữa Thanh Trùng'),
('21b32491-6aed-417f-afc1-edd0835ed2db', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'sua-tiet-trung', 'Sữa Tiệt Trùng', NULL, 3, 'Sữa Tiệt Trùng'),

-- Level 3: Danh mục con của Sữa Thực Vật
('22347129-bba9-44c6-942c-44a18b657d19', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'sua-hat', 'Sữa Hạt', NULL, 3, 'Sữa Hạt'),
('22ab5ef8-e2cf-48aa-bfaa-54cd172b99fc', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'sua-dau', 'Sữa Đậu', NULL, 3, 'Sữa Đậu'),

-- Level 2: Danh mục con của Thực Phẩm Đông Mát
('23bbeb27-3424-40fb-b9d1-97555e34c03b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'pizza-banh-mi-banh-bao', 'Pizza - Bánh Mì - Bánh Bao', 'menu9_icon_1.jpg', 2, 'Pizza - Bánh Mì - Bánh Bao'),
('25ffe83b-c805-4c58-9cbd-94ac4123b35e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cha-gio-ha-cao-mandu', 'Chả Giò - Há Cảo - Mandu', 'menu9_icon_2.jpg', 2, 'Chả Giò - Há Cảo - Mandu'),
('2672e100-23b8-4ca1-bf9c-a95ba912399e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cha-muc-ca-ca-vien-bo-vien', 'Chả Mực, Chả Cá - Cá Viên, Bò Viên', 'menu9_icon_3.jpg', 2, 'Chả Mực, Chả Cá - Cá Viên, Bò Viên'),
('276f5dfc-9b59-4e6a-8c0b-516c786b250a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'lap-xuong-xuc-xich', 'Xúc Xích - Lạp Xưởng Tươi', 'menu9_icon_4.jpg', 2, 'Lạp Xưởng - Xúc Xích'),
('28f7ea42-2653-4323-978b-bea258f0f0d7', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cha-lua-nem-thit-nguoi', 'Chả lụa, Nem, Thịt nguội', 'menu9_icon_5.jpg', 2, 'Chả lụa, Nem, Thịt nguội'),
('291116e6-6190-4161-a656-0cb82196830d', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'san-sang-an', 'Sẵn Sàng Ăn', 'menu9_icon_6.jpg', 2, 'Sẵn Sàng Ăn'),
('291c4f60-cbd8-49de-99b0-a4d49936c569', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'vien-tha-lau', 'Nước Lẩu & Viên Thả Lẩu', 'menu9_icon_7.jpg', 2, 'Nước lẩu, Viên thả lẩu'),
('2949d540-8d9e-4807-b1ea-45cdc977cfa1', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'hai-san-dong-lanh', 'Cá, Hải Sản Đông Mát', 'menu9_icon_8.jpg', 2, 'Hải Sản Đông Lạnh'),
('2cc38516-7883-4846-98cd-777f16afb16d', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'kem', 'Kem', 'menu9_icon_9.jpg', 2, 'Kem'),

-- Level 2: Danh mục con của Thực Phẩm Khô
('2cf7dd2d-ba19-499d-9b89-28a5deeaaceb', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gia-vi', 'Gia Vị', 'menu10_icon_1.jpg', 2, 'Gia Vị'),
('2da0bfc6-7719-4139-ad7d-72629ad987f1', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gao-cac-loai', 'Các Loại Gạo & Nếp', 'menu10_icon_2.jpg', 2, 'Gạo,Nếp Các Loại'),
('2e106798-1985-4bb4-a889-1e7fd0d4b9f7', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'mi-kho-nui-hu-tieu-banh-trang', 'Mì Khô, Nui, Hủ Tiếu & Bánh Tráng', 'menu10_icon_3.jpg', 2, 'Mì Khô, Nui, Hủ Tiếu & Bánh Tráng'),
('2ef83c62-41a7-417f-91c1-4013e4492c0a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'do-hop', 'Đồ Hộp', 'menu10_icon_4.jpg', 2, 'Thực Phẩm Đóng Hộp'),
('2f395712-87fc-4e4f-b21e-787ae941e71b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ngu-coc-yen-mach', 'Ngũ Cốc, Yến Mạch', 'menu10_icon_5.jpg', 2, 'Ngũ Cốc & Yến Mạch'),
('2f98dd45-3422-4d88-9e5b-55886e6a4030', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'dau-nam-do-kho', 'Đậu - Nấm - Đồ Khô', 'menu10_icon_6.jpg', 2, 'Đậu, Nấm, Đồ Khô'),
-- ('276f5dfc-9b59-4e6a-8c0b-516c786b250a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'lap-xuong-xuc-xich', 'Xúc Xích - Lạp Xưởng Tươi', 'menu9_icon_4.jpg', 2, 'Lạp Xưởng - Xúc Xích'),
('3094d169-be66-4934-a61e-77f72196bfad', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'bot-cac-loai', 'Các Loại Bột', 'menu10_icon_8.jpg', 2, 'Bột Các Loại'),
('30f1a08e-64ec-45ef-8c91-a6d433157518', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thuc-pham-chay', 'Thực Phẩm Chay', 'menu10_icon_9.jpg', 2, 'Thực Phẩm Chay'),
('33256a9f-b631-4472-8e36-98f52ad54124', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'hat-trai-cay-say', 'Hạt, Trái Cây Sấy', 'menu10_icon_10.jpg', 2, 'Hạt - Trái cây sấy'),
('3392c0a2-2bdc-4eb4-b01b-9c07d1877cb3', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'kho-che-bien-san', 'Khô Chế Biến Sẵn', 'menu10_icon_11.jpg', 2, 'Khô Chế Biến Sẵn'),
('340fd0f8-3385-4dfe-8754-763bc1476b44', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'dac-san-viet-nam', 'Đặc Sản Việt Nam', 'menu10_icon_12.jpg', 2, 'Đặc Sản Việt Nam'),

-- Level 3: Danh mục con của Gia Vị
('3539e77f-a194-4a8a-8622-5f6afc6d2af6', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'dau-an', 'Dầu Ăn', NULL, 3, 'Dầu Ăn'),
('3620c767-d84a-46e4-9a5a-564359aec0ff', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nuoc-mam-nuoc-tuong-dau-hao', 'Nước Mắm - Nước Tương, Dầu Hào', NULL, 3, 'Nước Mắm - Nước Tương, Dầu Hào'),
('3658022c-4869-411e-bc21-1cf866ef27f6', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'duong-muoi-hat-nem', 'Đường - Muối - Hạt Nêm', NULL, 3, 'Đường - Muối - Hạt Nêm'),
('3672916e-d081-4603-9d35-005d2539e944', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'tuong-mayonnaise', 'Tương - Mayonnaise - Giấm', NULL, 3, 'Tương, Mayonnaise'),
('38307388-f6c8-4633-a36e-c5102737082a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gia-vi-nem-san', 'Gia Vị Nêm Sẵn', NULL, 3, 'Gia Vị Nêm Sẵn'),
('38d65aef-9d2b-416b-9ee8-c93dd4b17f87', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nuoc-cham-mam', 'Sốt & Nước Chấm Pha Sẵn', NULL, 3, 'Sốt & Nước Chấm Pha Sẵn'),
('390791a9-239a-452e-9b61-4ea0aa06ab2f', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'bot-gia-vi', 'Bột Gia Vị', NULL, 3, 'Bột Gia Vị'),

-- Level 3: Danh mục con của Các Loại Gạo & Nếp
-- ('396b88f4-0407-48ee-9c23-26c78dd7d89c', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gao-huu-co', 'Gạo Hữu Cơ Chất Lượng Cao', NULL, 3, 'Gạo Hữu Cơ Chất Lượng Cao'),
('39b7e223-7744-4ec8-b824-c5e6fe6c054f', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'gao', 'Gạo', NULL, 3, 'Gạo'),
('3ab5f6ff-0577-484a-af10-94154a6c887b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nep', 'Nếp', NULL, 3, 'Nếp'),

-- Level 3: Danh mục con của Mì Khô, Nui, Hủ Tiếu & Bánh Tráng
('3adeed2b-ee34-48b7-8622-985e771548d3', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'mi-kho-bun-mien-pho-huu-co', 'Mì Khô, Bún, Miến, Phở Hữu Cơ', NULL, 3, 'Mì Khô, Bún, Miến, Phở Hữu Cơ'),
('3de40faf-a15b-42d5-9570-b3fee921ab04', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'mi-kho-nui-hu-tieu', 'Mì Khô, Nui, Hủ Tiếu', NULL, 3, 'Mì Khô, Nui, Hủ Tiếu'),
('3e8c5089-ab4c-422d-a1a5-101e531e92fd', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'banh-trang-banh-da-banh-phong', 'Bánh Tráng, Bánh Đa & Bánh Phồng', NULL, 3, 'Bánh Tráng, Bánh Đa & Bánh Phồng'),
('3f3e3ac4-d117-4dfe-860c-06769bc01bec', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'rong-bien-cac-loai', 'Rong Biển Các Loại', NULL, 3, 'Rong biển các loại'),

-- Level 3: Danh mục con của Đồ Hộp
('3f727497-3f4d-4e87-8fce-bffdbc9056e0', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ca-hop', 'Cá Hộp', NULL, 3, 'Cá Hộp'),
('406641ad-f607-42e3-a5d7-82e5e0a3bae4', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thit-hop', 'Thịt Hộp', NULL, 3, 'Thịt Hộp'),
('418e9d48-2560-495c-b84b-e8419974a75a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'pate', 'Pate', NULL, 3, 'Pate'),

-- Level 3: Danh mục con của Ngũ Cốc, Yến Mạch
-- ('41958709-a516-44e7-9e24-9f53a80e3ca6', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ngu-coc-yen-mach', 'Ngũ Cốc & Yến Mạch', NULL, 3, 'Ngũ Cốc & Yến Mạch'),
('47f37a38-0972-4117-80b8-547b285b6989', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ngu-coc-dang-thanh', 'Ngũ Cốc Dạng Thanh', NULL, 3, 'Ngũ Cốc Dạng Thanh'),

-- Level 3: Danh mục con của Sữa Đậu - Nấm - Đồ Khô
('484df3ab-c4ec-4cd3-b528-ae28cda3612e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cac-loai-dau-kho', 'Các Loại Đậu Khô', NULL, 3, 'Các Loại Đậu Khô'),
('48935336-74f1-48d2-99bd-50c3d05ec91b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cac-loai-nam-kho', 'Các Loại Nấm Khô', NULL, 3, 'Các Loại Nấm Khô'),

-- Level 2: Danh mục con của Bánh, Kẹo & Thức Uống
('48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'banh-keo-cac-loai', 'Bánh Kẹo Các Loại', 'menu11_icon_1.jpg', 2, 'Bánh Kẹo Các Loại'),
('49614d44-5726-4b59-a585-581ee347e965', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thuc-uong', 'Thức Uống', 'menu11_icon_2.jpg', 2, 'Thức Uống'),
-- ('d459df02-7e70-4b2e-9f33-0bcd1789c813', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'trung-thu', 'Tết Trung Thu', 'menu3_icon_1.jpg', 2, 'Quà Tặng Trung Thu'),

-- Level 3: Danh mục con của Bánh, Kẹo Các Loại
-- ('0e149c35-b9e4-4af1-ba4d-b7285111ffc6', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'tui-qua-dac-san', 'Quà Tặng Đặc Sản Việt Nam', 'menu3_icon_10.jpg', 2, 'Quà Tặng Đặc Sản Việt Nam'),
('4d60db0c-e8e5-48a8-ada4-8f006cad3208', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'snack-an-vat', 'Snack, Ăn Vặt', NULL, 3, 'Snack, Ăn Vặt'),
('4e728f7f-a796-419e-b868-86e9b42f8468', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'banh-mi-mem-banh-ngot', 'Bánh Mềm Các Loại', NULL, 3, 'Bánh Mì Mềm & Bánh Ngọt'),
('4ed0f445-fc05-4fce-830a-df39ae4b8053', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'banh-cac-loai', 'Bánh Quy - Bánh Xốp - Bánh Que', NULL, 3, 'Bánh Các Loại'),
('50215266-39b1-4ee2-a965-99099d1ea550', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'com-chay-banh-trang', 'Cơm Cháy, Bánh Tráng', NULL, 3, 'Cơm Cháy & Bánh Tráng'),
('5084cf06-2303-42c5-bf92-a24e64104341', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'keo-cac-loai-1', 'Kẹo Các Loại', NULL, 3, 'Kẹo Các Loại'),
('50f79d7d-5b03-4c9b-a4d9-68ed0ea45963', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'Socola Các Loại', 'Socola Các Loại', NULL, 3, 'Socola Các Loại'),
-- ('1e168207-456c-4990-beda-b86446adf1e2', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'thach-pudding', 'Bánh Flan - Thạch - Chè', 'menu8_icon_6.jpg', 2, 'Bánh Flan - Thạch - Chè'),
('51dd7dcb-b77d-4850-9d51-e693d8fa90af', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'mut-trai-cay-bo-dau-phong', 'Mứt Trái Cây & Bơ Đậu Phộng', NULL, 3, 'Mứt Trái Cây & Bơ Đậu Phộng'),

-- Level 3: Danh mục con của Thức Uống
('5536bd74-50c3-43c0-b63d-c76d6c6eb7f1', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'bia-nuoc-co-con', 'Bia, Nước Có Cồn', NULL, 3, 'Bia, Nước Có Cồn'),
('5629a831-4aef-40bc-9520-d11f5c68a030', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ruou-nhap-khau', 'Rượu, Nước Trái Cây Lên Men', NULL, 3, 'Rượu, Nước Trái Cây Lên Men'),
('587ee362-4d61-424b-ae99-b2a08f2677bd', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nuoc-khoang-tu-nhien-nhap-khau', 'Nước Suối & Nước Khoáng', NULL, 3, 'Nước Suối & Nước Khoáng'),
('5920f10a-ce59-41af-ad4d-11a643b60114', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nuoc-co-ga', 'Nước Ngọt', NULL, 3, 'Nước Có Ga'),
('5aef9b56-a709-4f70-9bc2-cd0bf0100e96', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nuoc-trai-cay', 'Nước Trái Cây', NULL, 3, 'Nước Trái Cây'),
('5bae4749-e9e9-4f9a-85f3-aaa211f9e5e5', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'ca-phe-tra', 'Trà & Cà Phê', NULL, 3, 'Cà Phê & Trà'),
('5cde3e6a-0219-41f0-b913-91b2023285a7', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'mat-ong', 'Mật Ong', NULL, 3, 'Mật Ong'),
-- ('3094d169-be66-4934-a61e-77f72196bfad', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'bot-cac-loai', 'Các Loại Bột', 'menu10_icon_8.jpg', 2, 'Bột Các Loại'),

-- Level 2: Danh mục con của Thực Phẩm Chăm Sóc Sức Khỏe
-- ('06b03f7c-2b25-4a4b-934a-96f5c29e2736', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'yen-sao', 'Yến Sào', 'menu3_icon_6.jpg', 2, 'Yến Sào'),
-- ('08814390-d044-43ee-a8fe-2ca385f682d1', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nhan-sam', 'Nhân Sâm', 'menu3_icon_7.jpg', 2, 'Nhân Sâm'),
-- ('0d971c5b-47f3-442b-a8d8-b5203f5ddff2', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'mat-ong-manuka', 'Mật Ong Manuka', 'menu3_icon_8.jpg', 2, 'Mật Ong Manuka'),
-- ('3094d169-be66-4934-a61e-77f72196bfad', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'bot-cac-loai', 'Các Loại Bột', 'menu10_icon_8.jpg', 2, 'Bột Các Loại'),

-- Level 2: Danh mục con của Hoa, Cây Xanh
('62c18a82-2fd0-4a6e-87ff-890d00c03776', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'hoa', 'Hoa', 'menu13_icon_1.jpg', 2, 'Hoa'),
('65467847-3ccf-4ca2-8b8f-77d542cd4abb', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cay-xanh', 'Cây Xanh', 'menu13_icon_2.jpg', 2, 'Cây Xanh'),
-- ('4e18aff3-6e8f-4e78-8258-9dffc001a01b', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'qua-tang-cay-xanh', 'Cây Xanh', 'menu2_icon_20.jpg', 2, 'Quà Tặng Cây Xanh'),
-- ('20665167-67d3-4fff-a198-94f11ce6ff64', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nen-thom-tinh-dau', 'Nến Thơm & Tinh Dầu', 'menu3_icon_12.jpg', 2, 'Nến Thơm & Tinh Dầu'),

-- Level 2: Danh mục con của Chăm Sóc Nhà Cửa, Cá Nhân
('74261346-6e41-43ed-8dc0-7dcade4de621', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 've-sinh-nha-cua', 'Chăm Sóc, Vệ Sinh Nhà Cửa', 'menu14_icon_1.jpg', 2, 'Vệ Sinh Nhà Cửa'),
('74a080e1-aeab-4299-b016-bdd2face6fb7', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cham-soc-ca-nhan', 'Chăm Sóc Cá Nhân', 'menu14_icon_2.jpg', 2, 'Chăm Sóc Cá Nhân'),
('74cbbdd6-842d-4c1c-8da3-17529d117db4', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'do-cung', 'Đồ Cúng', 'menu14_icon_3.jpg', 2, 'Đồ Cúng'),
-- ('20665167-67d3-4fff-a198-94f11ce6ff64', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'nen-thom-tinh-dau', 'Nến Thơm & Tinh Dầu', 'menu3_icon_12.jpg', 2, 'Nến Thơm & Tinh Dầu'),

-- Level 3: Danh mục con của Chăm Sóc, Vệ Sinh Nhà Cửa
('79518093-e748-4336-8c35-cdc03505c611', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'dung-cu-nha-bep', 'Dụng Cụ Nhà Bếp', NULL, 3, 'Dụng Cụ Nhà Bếp'),
('799e3d61-5af7-4fe3-b430-1855df0d367a', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 've-sinh-quan-ao', 'Vệ Sinh Áo Quần', NULL, 3, 'Vệ Sinh Quần Áo'),
('7b371139-656b-4f06-bc79-80b2f01690e9', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 've-sinh-nha-bep', 'Vệ Sinh Bếp', NULL, 3, 'Vệ Sinh Nhà Bếp'),
('7b8c46e2-84df-4785-b67e-176d3ef7490f', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 've-sinh-nha-tam-nha-cua', 'Vệ Sinh Nhà Tắm, Nhà Cửa', NULL, 3, 'Vệ Sinh Nhà Tắm, Nhà Cửa'),
('7c450317-0bbe-4098-9f41-75ad088a5b9e', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'pin-do-dung-1-lan', 'Pin, Đồ Dùng Một Lần', NULL, 3, 'Pin, Đồ Dùng 1 Lần'),

-- Level 3: Danh mục con của Chăm Sóc Cá Nhân
('779bf3c9-fc34-4141-8332-9914f5ad43a5', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cham-soc-co-the', 'Chăm Sóc Cơ Thể', NULL, 3, 'Chăm Sóc Cơ Thể'),
('77dfce3d-9ca5-48f4-ae40-94e871e65358', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cham-soc-mat', 'Chăm Sóc Mặt', NULL, 3, 'Chăm Sóc Mặt'),
('78190b49-3413-433e-bab1-60e658edce3c', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'cham-soc-rang-mieng', 'Chăm Sóc Răng Miệng', NULL, 3, 'Chăm Sóc Răng Miệng'),
('79233f62-acaf-4a05-88e3-8b7384417c33', 'admin@gmail.com', NOW(), 1, 'admin@gmail.com', NOW(), 'do-dung-ca-nhan', 'Đồ Dùng Cá Nhân', NULL, 3, 'Đồ Dùng Cá Nhân');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_parent`
--

DROP TABLE IF EXISTS `category_parent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_parent` (
  `child_id` varchar(36) NOT NULL,
  `parent_id` varchar(36) NOT NULL,
  PRIMARY KEY (`child_id`, `parent_id`),
  CONSTRAINT `FK_category_parent_child` FOREIGN KEY (`child_id`) REFERENCES `category` (`id`),
  CONSTRAINT `FK_category_parent_parent` FOREIGN KEY (`parent_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_parent`
--

LOCK TABLES `category_parent` WRITE;
/*!40000 ALTER TABLE `category_parent` DISABLE KEYS */;
INSERT INTO `category_parent` VALUES
('06b03f7c-2b25-4a4b-934a-96f5c29e2736', '030da7c9-d09e-4016-b885-c2df0ddb5260'),
('08814390-d044-43ee-a8fe-2ca385f682d1', '030da7c9-d09e-4016-b885-c2df0ddb5260'),
('0d971c5b-47f3-442b-a8d8-b5203f5ddff2', '030da7c9-d09e-4016-b885-c2df0ddb5260'),
('3094d169-be66-4934-a61e-77f72196bfad', '030da7c9-d09e-4016-b885-c2df0ddb5260'),
('02aefc7c-a1cf-49e0-ac6a-3da23e1f4131', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('0ffba7e9-8789-401c-b564-c2366ba425a2', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('36dcbb75-2988-4e4c-ae9c-fe57d3f5483f', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('48f8997a-dc5c-4f55-b32d-8a1f3e281fd8', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('4e18aff3-6e8f-4e78-8258-9dffc001a01b', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('7941d5cc-3d0d-4978-8321-8246b61fc67d', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('a20e7a76-5913-4025-9e0b-9bfcb20c45c6', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('aba8a146-dc87-4786-9768-676c813040e0', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('adcf99cd-9a49-42e1-9120-b0e5cda6614e', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('b738b69a-cb75-4382-8ce4-2ca62f92af02', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('b75bd02b-6635-4c81-b7bd-d588bd34a28b', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('bc4d7360-ba80-46f7-acb5-b48d760ff07b', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('c407c1ba-7d80-4684-b82a-db01e9017106', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('cb4b3ec0-3665-4b3e-8bc7-8cfe5626bc2e', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('d71186c0-5756-4ee8-b27d-df635fdb726a', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('d71186c3-5756-4ee8-b27d-df635fdb726a', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('dfbeb19c-21d0-4e24-bc60-091f18db6638', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('f57af8cc-bb54-4f3d-9e60-6e2f6f1bf9b1', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('fc130572-0f12-4889-a874-1ce0e6adbc4f', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('fcf06f4d-1c0e-4453-b094-6f8c87db70e4', '0edeeec4-514e-4423-a95a-9e7e49f9aed6'),
('20665167-67d3-4fff-a198-94f11ce6ff64', '0edeeec4-514e-4423-a95a-9e7e49fa9ed6'),
('4e18aff3-6e8f-4e78-8258-9dffc001a01b', '0edeeec4-514e-4423-a95a-9e7e49fa9ed6'),
('62c18a82-2fd0-4a6e-87ff-890d00c03776', '0edeeec4-514e-4423-a95a-9e7e49fa9ed6'),
('65467847-3ccf-4ca2-8b8f-77d542cd4abb', '0edeeec4-514e-4423-a95a-9e7e49fa9ed6'),
('17b4ddb9-62b3-4ae4-9cf7-ba9ce6bbfa02', '124953d7-8959-4336-a223-8f738b7d01e2'),
('187a09db-d677-4ebf-97f8-31bf8c0eee84', '124953d7-8959-4336-a223-8f738b7d01e2'),
('18b41eea-99d2-444a-b721-e41c08935f0d', '124953d7-8959-4336-a223-8f738b7d01e2'),
('06b03f7c-2b25-4a4b-934a-96f5c29e2736', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('08814390-d044-43ee-a8fe-2ca385f682d1', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('0d971c5b-47f3-442b-a8d8-b5203f5ddff2', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('0dcec000-e12e-4c14-a5a0-456daf28664a', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('0e149c35-b9e4-4af1-ba4d-b7285111ffc6', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('20665167-67d3-4fff-a198-94f11ce6ff64', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('3707cb66-e53a-4295-a5d3-845625c924b6', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('4e18aff3-6e8f-4e78-8258-9dffc001a01b', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('d459df02-7e70-4b2e-9f33-0bcd1789c813', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('dc9bdcd0-500c-4511-896e-4d828ecfc210', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('ee97933d-86ba-4e3c-8536-f9c70212fa09', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('f15405dd-ba41-4954-bad6-65232a8309ab', '12c833ab-527e-46c6-bb5e-0771a898fc36'),
('18ca3cd9-5af9-40c1-94a2-44c058e34e62', '14830a4b-d356-441b-b0ef-8c15f868547c'),
('198b1686-7f6b-4c54-9b8e-8b5db5ce71ea', '14830a4b-d356-441b-b0ef-8c15f868547c'),
('1a21d219-71d4-4458-832f-c1727c84e325', '14830a4b-d356-441b-b0ef-8c15f868547c'),
('1a32e2d7-a14d-48b6-acd6-6a6db993467c', '16c32245-d8e7-4857-9a22-217fe3fbafed'),
('1a58c062-ebe1-4d81-aafa-f597fee26781', '16c32245-d8e7-4857-9a22-217fe3fbafed'),
('1a93c040-80d6-4b95-b70d-b18e1bbd085e', '16c32245-d8e7-4857-9a22-217fe3fbafed'),
('21ac9bd9-93ea-450e-967f-30c8b6433a7e', '1aad1cfd-dffc-4ef6-91e6-25569179ec94'),
('21b32491-6aed-417f-afc1-edd0835ed2db', '1aad1cfd-dffc-4ef6-91e6-25569179ec94'),
('22347129-bba9-44c6-942c-44a18b657d19', '1acaf12c-daeb-4ccd-b9c0-9fed2f251270'),
('22ab5ef8-e2cf-48aa-bfaa-54cd172b99fc', '1acaf12c-daeb-4ccd-b9c0-9fed2f251270'),
('31f57c4c-b50c-485f-993f-4c480877b3f5', '1d2299b6-3783-46e0-b0dd-245542d26a4f'),
('43175b90-311c-4643-815c-0e9358a27825', '1d2299b6-3783-46e0-b0dd-245542d26a4f'),
('4fc28aae-8101-4b95-85ac-2c89f6a0c5b9', '1d2299b6-3783-46e0-b0dd-245542d26a4f'),
('66e4808b-cc16-40d1-8c4c-511785a8b27e', '1d2299b6-3783-46e0-b0dd-245542d26a4f'),
('48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d', '220d1e42-3ba9-475b-950a-0392668f583c'),
('49614d44-5726-4b59-a585-581ee347e965', '220d1e42-3ba9-475b-950a-0392668f583c'),
('d459df02-7e70-4b2e-9f33-0bcd1789c813', '220d1e42-3ba9-475b-950a-0392668f583c'),
('991b858e-886a-48c9-8ff4-71a368edf344', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('a060c6ea-41f0-4b45-87e5-064bb54a5328', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('a3ad1e70-a248-413b-8af1-86219b3a1c02', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('b927eeb0-927e-4642-afac-7d384e6d9e2d', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('bdcc2d5c-b204-40a3-b20f-284d8f2ea6f1', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('be2198fb-f016-48b5-b324-58b32b725882', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('c1fc8ce9-ac6f-44b5-a797-be02e16e84b7', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('d72c2816-d523-4527-8628-295919f9cb63', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('f15405dd-ba41-4954-bad6-65232a8309ab', '293ac549-db0d-458d-87f8-9ece5827e20c'),
('3539e77f-a194-4a8a-8622-5f6afc6d2af6', '2cf7dd2d-ba19-499d-9b89-28a5deeaaceb'),
('3620c767-d84a-46e4-9a5a-564359aec0ff', '2cf7dd2d-ba19-499d-9b89-28a5deeaaceb'),
('3658022c-4869-411e-bc21-1cf866ef27f6', '2cf7dd2d-ba19-499d-9b89-28a5deeaaceb'),
('3672916e-d081-4603-9d35-005d2539e944', '2cf7dd2d-ba19-499d-9b89-28a5deeaaceb'),
('38307388-f6c8-4633-a36e-c5102737082a', '2cf7dd2d-ba19-499d-9b89-28a5deeaaceb'),
('38d65aef-9d2b-416b-9ee8-c93dd4b17f87', '2cf7dd2d-ba19-499d-9b89-28a5deeaaceb'),
('390791a9-239a-452e-9b61-4ea0aa06ab2f', '2cf7dd2d-ba19-499d-9b89-28a5deeaaceb'),
('39b7e223-7744-4ec8-b824-c5e6fe6c054f', '2da0bfc6-7719-4139-ad7d-72629ad987f1'),
('3ab5f6ff-0577-484a-af10-94154a6c887b', '2da0bfc6-7719-4139-ad7d-72629ad987f1'),
('3adeed2b-ee34-48b7-8622-985e771548d3', '2e106798-1985-4bb4-a889-1e7fd0d4b9f7'),
('3de40faf-a15b-42d5-9570-b3fee921ab04', '2e106798-1985-4bb4-a889-1e7fd0d4b9f7'),
('3e8c5089-ab4c-422d-a1a5-101e531e92fd', '2e106798-1985-4bb4-a889-1e7fd0d4b9f7'),
('3f3e3ac4-d117-4dfe-860c-06769bc01bec', '2e106798-1985-4bb4-a889-1e7fd0d4b9f7'),
('3f727497-3f4d-4e87-8fce-bffdbc9056e0', '2ef83c62-41a7-417f-91c1-4013e4492c0a'),
('406641ad-f607-42e3-a5d7-82e5e0a3bae4', '2ef83c62-41a7-417f-91c1-4013e4492c0a'),
('418e9d48-2560-495c-b84b-e8419974a75a', '2ef83c62-41a7-417f-91c1-4013e4492c0a'),
('47f37a38-0972-4117-80b8-547b285b6989', '2f395712-87fc-4e4f-b21e-787ae941e71b'),
('484df3ab-c4ec-4cd3-b528-ae28cda3612e', '2f98dd45-3422-4d88-9e5b-55886e6a4030'),
('48935336-74f1-48d2-99bd-50c3d05ec91b', '2f98dd45-3422-4d88-9e5b-55886e6a4030'),
('2613ed26-3981-46f4-9ddb-a9702cc5e8d5', '31f57c4c-b50c-485f-993f-4c480877b3f5'),
('395c2954-bfe8-4fbe-a05e-ddf2c6b9de3e', '31f57c4c-b50c-485f-993f-4c480877b3f5'),
('42f5635e-8f51-485a-940b-d0b3afbddc4e', '31f57c4c-b50c-485f-993f-4c480877b3f5'),
('45c43b45-2360-4ffa-87ad-16bebafa9e9b', '31f57c4c-b50c-485f-993f-4c480877b3f5'),
('50db492a-679a-4a21-bad4-b1e45394bab2', '31f57c4c-b50c-485f-993f-4c480877b3f5'),
('512eff7d-e023-452d-97b8-dfd8e37389da', '31f57c4c-b50c-485f-993f-4c480877b3f5'),
('523e1850-7467-48b9-9457-02b4427210df', '31f57c4c-b50c-485f-993f-4c480877b3f5'),
('5acb4348-3815-4c20-94ae-0cc5d71d366e', '31f57c4c-b50c-485f-993f-4c480877b3f5'),
('20665167-67d3-4fff-a198-94f11ce6ff64', '3713c508-7713-4d9f-96e8-0e1eb36b979e'),
('74261346-6e41-43ed-8dc0-7dcade4de621', '3713c508-7713-4d9f-96e8-0e1eb36b979e'),
('74a080e1-aeab-4299-b016-bdd2face6fb7', '3713c508-7713-4d9f-96e8-0e1eb36b979e'),
('74cbbdd6-842d-4c1c-8da3-17529d117db4', '3713c508-7713-4d9f-96e8-0e1eb36b979e'),
('4d60db0c-e8e5-48a8-ada4-8f006cad3208', '48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d'),
('4e728f7f-a796-419e-b868-86e9b42f8468', '48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d'),
('4ed0f445-fc05-4fce-830a-df39ae4b8053', '48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d'),
('50215266-39b1-4ee2-a965-99099d1ea550', '48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d'),
('5084cf06-2303-42c5-bf92-a24e64104341', '48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d'),
('50f79d7d-5b03-4c9b-a4d9-68ed0ea45963', '48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d'),
('51dd7dcb-b77d-4850-9d51-e693d8fa90af', '48fc4a8c-0c7b-41d0-9d9f-74a165bcd90d'),
('5536bd74-50c3-43c0-b63d-c76d6c6eb7f1', '49614d44-5726-4b59-a585-581ee347e965'),
('5629a831-4aef-40bc-9520-d11f5c68a030', '49614d44-5726-4b59-a585-581ee347e965'),
('587ee362-4d61-424b-ae99-b2a08f2677bd', '49614d44-5726-4b59-a585-581ee347e965'),
('5920f10a-ce59-41af-ad4d-11a643b60114', '49614d44-5726-4b59-a585-581ee347e965'),
('5bae4749-e9e9-4f9a-85f3-aaa211f9e5e5', '49614d44-5726-4b59-a585-581ee347e965'),
('5cde3e6a-0219-41f0-b913-91b2023285a7', '49614d44-5726-4b59-a585-581ee347e965'),
('d9051ce0-f139-4d63-9f62-e555992045cd', '4ee24d42-77dc-43ce-960f-e06cfb713083'),
('e7747def-c7aa-4ab4-97a1-414f7c935659', '4ee24d42-77dc-43ce-960f-e06cfb713083'),
('ebc4e1cf-9331-4407-97e7-fb9d19bf41c8', '4ee24d42-77dc-43ce-960f-e06cfb713083'),
('f012f7f4-a50a-44bd-88fb-2b162df6d28c', '4ee24d42-77dc-43ce-960f-e06cfb713083'),
('5f67d4aa-e7b0-42e3-a6f8-59e5ae56c740', '66e4808b-cc16-40d1-8c4c-511785a8b27e'),
('6c59315f-836c-4434-970a-5c6e9cd9af44', '66e4808b-cc16-40d1-8c4c-511785a8b27e'),
('6fc0e39f-565d-44f9-99d4-84df16559f27', '66e4808b-cc16-40d1-8c4c-511785a8b27e'),
('8e8114eb-0b7c-4068-9c09-94c19e742353', '66e4808b-cc16-40d1-8c4c-511785a8b27e'),
('124953d7-8959-4336-a223-8f738b7d01e2', '6a768ea0-ebf9-4e85-910b-66a353e27923'),
('14830a4b-d356-441b-b0ef-8c15f868547c', '6a768ea0-ebf9-4e85-910b-66a353e27923'),
('16c32245-d8e7-4857-9a22-217fe3fbafed', '6a768ea0-ebf9-4e85-910b-66a353e27923'),
('c2d7a358-14c3-4107-bac6-3eb564fa4b43', '6a768ea0-ebf9-4e85-910b-66a353e27923'),
('1aad1cfd-dffc-4ef6-91e6-25569179ec94', '6dd4379e-e7b7-4a8f-9649-0328a0a61d8a'),
('1acaf12c-daeb-4ccd-b9c0-9fed2f251270', '6dd4379e-e7b7-4a8f-9649-0328a0a61d8a'),
('1bf6c6fd-f7c1-48bb-82ed-cb9d9e63b341', '6dd4379e-e7b7-4a8f-9649-0328a0a61d8a'),
('1d6b1cba-5850-41e6-a7e9-6cec5f093b31', '6dd4379e-e7b7-4a8f-9649-0328a0a61d8a'),
('1e0cb2be-15b9-44fa-ba22-d1a28e73b642', '6dd4379e-e7b7-4a8f-9649-0328a0a61d8a'),
('1e168207-456c-4990-beda-b86446adf1e2', '6dd4379e-e7b7-4a8f-9649-0328a0a61d8a'),
('79518093-e748-4336-8c35-cdc03505c611', '74261346-6e41-43ed-8dc0-7dcade4de621'),
('799e3d61-5af7-4fe3-b430-1855df0d367a', '74261346-6e41-43ed-8dc0-7dcade4de621'),
('7b371139-656b-4f06-bc79-80b2f01690e9', '74261346-6e41-43ed-8dc0-7dcade4de621'),
('7b8c46e2-84df-4785-b67e-176d3ef7490f', '74261346-6e41-43ed-8dc0-7dcade4de621'),
('7c450317-0bbe-4098-9f41-75ad088a5b9e', '74261346-6e41-43ed-8dc0-7dcade4de621'),
('779bf3c9-fc34-4141-8332-9914f5ad43a5', '74a080e1-aeab-4299-b016-bdd2face6fb7'),
('77dfce3d-9ca5-48f4-ae40-94e871e65358', '74a080e1-aeab-4299-b016-bdd2face6fb7'),
('78190b49-3413-433e-bab1-60e658edce3c', '74a080e1-aeab-4299-b016-bdd2face6fb7'),
('79233f62-acaf-4a05-88e3-8b7384417c33', '74a080e1-aeab-4299-b016-bdd2face6fb7'),
('23bbeb27-3424-40fb-b9d1-97555e34c03b', '8af78245-0016-4e78-8424-82232802e656'),
('25ffe83b-c805-4c58-9cbd-94ac4123b35e', '8af78245-0016-4e78-8424-82232802e656'),
('2672e100-23b8-4ca1-bf9c-a95ba912399e', '8af78245-0016-4e78-8424-82232802e656'),
('276f5dfc-9b59-4e6a-8c0b-516c786b250a', '8af78245-0016-4e78-8424-82232802e656'),
('28f7ea42-2653-4323-978b-bea258f0f0d7', '8af78245-0016-4e78-8424-82232802e656'),
('291116e6-6190-4161-a656-0cb82196830d', '8af78245-0016-4e78-8424-82232802e656'),
('291c4f60-cbd8-49de-99b0-a4d49936c569', '8af78245-0016-4e78-8424-82232802e656'),
('2949d540-8d9e-4807-b1ea-45cdc977cfa1', '8af78245-0016-4e78-8424-82232802e656'),
('2cc38516-7883-4846-98cd-777f16afb16d', '8af78245-0016-4e78-8424-82232802e656'),
('276f5dfc-9b59-4e6a-8c0b-516c786b250a', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('2cf7dd2d-ba19-499d-9b89-28a5deeaaceb', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('2da0bfc6-7719-4139-ad7d-72629ad987f1', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('2e106798-1985-4bb4-a889-1e7fd0d4b9f7', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('2ef83c62-41a7-417f-91c1-4013e4492c0a', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('2f395712-87fc-4e4f-b21e-787ae941e71b', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('2f98dd45-3422-4d88-9e5b-55886e6a4030', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('3094d169-be66-4934-a61e-77f72196bfad', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('30f1a08e-64ec-45ef-8c91-a6d433157518', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('33256a9f-b631-4472-8e36-98f52ad54124', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('3392c0a2-2bdc-4eb4-b01b-9c07d1877cb3', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('340fd0f8-3385-4dfe-8754-763bc1476b44', '967602fb-2e2b-4aeb-9eb8-5897ae55c619'),
('7fa5946b-e27b-4098-9c88-b5e11aeb9dee', 'c2d7a358-14c3-4107-bac6-3eb564fa4b43'),
('7c65169a-f152-4c51-b247-523dde58254d', 'd9051ce0-f139-4d63-9f62-e555992045cd'),
('7d7581be-a4e8-4d6b-8d6b-db9ab99e44a0', 'd9051ce0-f139-4d63-9f62-e555992045cd'),
('7d7581be-aff6-488e-b2f5-cbde4eaeabd4', 'd9051ce0-f139-4d63-9f62-e555992045cd'),
('fc124dfc-aff6-488e-b2f5-cbde4eaeabd4', 'd9051ce0-f139-4d63-9f62-e555992045cd'),
('fc124bfc-a4e8-488e-b2f5-cbde4eaeabd4', 'e7747def-c7aa-4ab4-97a1-414f7c935659'),
('fc124bfc-aff6-488e-88fb-cbde4eaeabd4', 'e7747def-c7aa-4ab4-97a1-414f7c935659'),
('fc124bfc-aff6-88fb-b2f5-2b162df6d28c', 'e7747def-c7aa-4ab4-97a1-414f7c935659'),
('7eb01433-b25a-42f7-804b-5791d54ab501', 'ebc4e1cf-9331-4407-97e7-fb9d19bf41c8'),
('7f4de4fa-3a46-4974-9bf0-f80ed077a445', 'ebc4e1cf-9331-4407-97e7-fb9d19bf41c8');
/*!40000 ALTER TABLE `category_parent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount`
--

DROP TABLE IF EXISTS `discount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount` (
  `id` varchar(36) NOT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `createddate` datetime(6) DEFAULT NULL,
  `is_active` tinyint NOT NULL,
  `modifiedby` varchar(255) DEFAULT NULL,
  `modifieddate` datetime(6) DEFAULT NULL,
  `end_date` date NOT NULL,
  `name` varchar(255) NOT NULL,
  `percent` double NOT NULL,
  `start_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount`
--

LOCK TABLES `discount` WRITE;
/*!40000 ALTER TABLE `discount` DISABLE KEYS */;
INSERT INTO `discount` VALUES 
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 1%', 1, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 2%', 2, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 3%', 3, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 4%', 4, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 5%', 5, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 6%', 6, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 7%', 7, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 8%', 8, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 9%', 9, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 10%', 10, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 11%', 11, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 12%', 12, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 13%', 13, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 14%', 14, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 15%', 15, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 16%', 16, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 17%', 17, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 18%', 18, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 19%', 19, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 20%', 20, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 21%', 21, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 22%', 22, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 23%', 23, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 24%', 24, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 25%', 25, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 26%', 26, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 27%', 27, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 28%', 28, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 29%', 29, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 30%', 30, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 31%', 31, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 32%', 32, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 33%', 33, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 34%', 34, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 35%', 35, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 36%', 36, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 37%', 37, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 38%', 38, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 39%', 39, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 40%', 40, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 41%', 41, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 42%', 42, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 43%', 43, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 44%', 44, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 45%', 45, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 46%', 46, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 47%', 47, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 48%', 48, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 49%', 49, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 50%', 50, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 51%', 51, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 52%', 52, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 53%', 53, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 54%', 54, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 55%', 55, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 56%', 56, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 57%', 57, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 58%', 58, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 59%', 59, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 60%', 60, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 61%', 61, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 62%', 62, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 63%', 63, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 64%', 64, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 65%', 65, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 66%', 66, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 67%', 67, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 68%', 68, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 69%', 69, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 70%', 70, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 71%', 71, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 72%', 72, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 73%', 73, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 74%', 74, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 75%', 75, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 76%', 76, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 77%', 77, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 78%', 78, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 79%', 79, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 80%', 80, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 81%', 81, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 82%', 82, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 83%', 83, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 84%', 84, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 85%', 85, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 86%', 86, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 87%', 87, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 88%', 88, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 89%', 89, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 90%', 90, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 91%', 91, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 92%', 92, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 93%', 93, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 94%', 94, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 95%', 95, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 96%', 96, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 97%', 97, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 98%', 98, '2030-01-01'),
(UUID(), NULL, NULL, 1, 'admin@gmail.com', NOW(), '2025-12-31', 'Mã giảm giá 99%', 99, '2030-01-01');
/*!40000 ALTER TABLE `discount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `id` varchar(36) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL,
  `createddate` datetime(6) DEFAULT NULL,
  `modifieddate` datetime(6) DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `modifiedby` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKa7ujv987la0i7a0o91ueevchc` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES ('004ed0bc-77f0-4f93-a0a2-a3fde7876a45','CUD_CATEGORY_SUPPLIER','Thêm, sửa, xóa danh mục, nhà cung cấp',1,NULL,NULL,NULL,NULL,3),
('135e804e-96d8-4277-b4db-6e80a5aac2d8','CUD_DISCOUNT','Thêm mã giảm giá cho sản phẩm',1,NULL,NULL,NULL,NULL,5),
('32467d71-c742-4635-a534-e7697ec8273d','RUD_ORDER','Xem, sửa, hủy order',1,NULL,NULL,NULL,NULL,7),
('5ffc3ccb-e554-4793-b308-f7efef403bbb','CUD_PRODUCT','Thêm, sửa, xóa sản phẩm',1,NULL,NULL,NULL,NULL,4),
('7c6ef485-d953-48c1-9d64-3187b1dff00d','RU_USER','Xem, sửa tài khoản',1,NULL,NULL,NULL,NULL,1),
('aa9e9619-1e50-46ed-9a57-707ac83a052e','RUD_ADDRESS','Xem, sửa, xóa address',1,NULL,NULL,NULL,NULL,2),
('d6b15258-983f-47b7-ba9b-8400adfd6184','RU_CONTACT','Đọc contact',1,NULL,NULL,NULL,NULL,8),
('f15f8989-6cd5-4f89-95c3-778b7f790bcf','CRU_RECEIPT','Xem, thêm, sửa nhập kho phiếu',1,NULL,NULL,NULL,NULL,6);
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `roleid` varchar(36) NOT NULL,
  `permissionid` varchar(36) NOT NULL,
  PRIMARY KEY (`roleid`,`permissionid`),
  KEY `permissionid` (`permissionid`),
  CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`roleid`) REFERENCES `role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permissionid`) REFERENCES `permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES ('4f213730-ede7-4709-ac08-ab849fc779de','004ed0bc-77f0-4f93-a0a2-a3fde7876a45'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','004ed0bc-77f0-4f93-a0a2-a3fde7876a45'),
('844a29ca-5087-44dc-ab67-1b95628fcd4d','135e804e-96d8-4277-b4db-6e80a5aac2d8'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','135e804e-96d8-4277-b4db-6e80a5aac2d8'),
('844a29ca-5087-44dc-ab67-1b95628fcd4d','32467d71-c742-4635-a534-e7697ec8273d'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','32467d71-c742-4635-a534-e7697ec8273d'),
('4f213730-ede7-4709-ac08-ab849fc779de','5ffc3ccb-e554-4793-b308-f7efef403bbb'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','5ffc3ccb-e554-4793-b308-f7efef403bbb'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','7c6ef485-d953-48c1-9d64-3187b1dff00d'),
('d05f2583-888c-4c8a-bea4-cb5b76154684','7c6ef485-d953-48c1-9d64-3187b1dff00d'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','aa9e9619-1e50-46ed-9a57-707ac83a052e'),
('d05f2583-888c-4c8a-bea4-cb5b76154684','aa9e9619-1e50-46ed-9a57-707ac83a052e'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','d6b15258-983f-47b7-ba9b-8400adfd6184'),
('d05f2583-888c-4c8a-bea4-cb5b76154684','d6b15258-983f-47b7-ba9b-8400adfd6184'),
('4f213730-ede7-4709-ac08-ab849fc779de','f15f8989-6cd5-4f89-95c3-778b7f790bcf'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','f15f8989-6cd5-4f89-95c3-778b7f790bcf');
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` varchar(36) NOT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `createddate` datetime(6) DEFAULT NULL,
  `is_active` tinyint NOT NULL,
  `modifiedby` varchar(255) DEFAULT NULL,
  `modifieddate` datetime(6) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKu0lh6hby20ok7au7646wrewl` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES 
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d','dotuandat2004nd@gmail.com','2025-02-17 01:13:18.125767',1,'dotuandat2004nd@gmail.com','2025-02-17 01:13:18.125767','dalat-greens','Dalat Greens'),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e','pesmobile5404@gmail.com','2025-02-16 12:42:29.960038',1,'pesmobile5404@gmail.com','2025-02-16 12:42:29.960038','organic-farm_vn','Organic Farm VN'),
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f','dotuandat2004nd@gmail.com','2025-02-15 10:29:30.935135',1,'dotuandat2004nd@gmail.com','2025-02-15 10:30:00.798146','vissan','Vissan'),
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a','dotuandat2004nd@gmail.com','2025-02-17 00:45:04.278391',1,'dotuandat2004nd@gmail.com','2025-02-17 00:45:04.278391','cp-foods','CP Foods'),
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b','dotuandat2004nd@gmail.com','2025-02-16 22:18:52.334828',1,'dotuandat2004nd@gmail.com','2025-02-16 22:18:52.334828','fruit-import-co','Fruit Import Co.'),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c','admin@gmail.com','2025-02-09 14:36:02.314080',1,'dotuandat2004nd@gmail.com','2025-02-09 18:00:16.006165','global-fresh','Global Fresh'),
('a7b8c9d0-e1f2-4a3b-5c6d-7e8f9a0b1c2d','dotuandat2004nd@gmail.com','2025-02-17 01:07:52.077248',1,'dotuandat2004nd@gmail.com','2025-02-17 01:07:52.077248','green-clean','Green Clean'),
('b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e','dotuandat2004nd@gmail.com','2025-02-17 00:48:49.595649',1,'dotuandat2004nd@gmail.com','2025-02-17 00:48:49.595649','eco-wash','Eco Wash'),
('c9d0e1f2-a3b4-4c5d-6e7f-9a0b1c2d3e4f','dotuandat2004nd@gmail.com','2025-02-17 00:52:32.863783',1,'dotuandat2004nd@gmail.com','2025-02-17 00:52:32.863783','natural-farm','Natural Farm'),
('d0e1f2a3-b4c5-4d6e-7f8a-0b1c2d3e4f5a','dotuandat2004nd@gmail.com','2025-02-17 00:50:46.530388',1,'dotuandat2004nd@gmail.com','2025-02-17 00:50:46.530388','fresh-garden','Fresh Garden'),
('e1f2a3b4-c5d6-4e7f-8a9b-1c2d3e4f5a6b','pesmobile5404@gmail.com','2025-02-16 12:38:39.609488',1,'pesmobile5404@gmail.com','2025-02-16 12:38:39.609488','vinamilk','Vinamilk'),
('f2a3b4c5-d6e7-4f8a-9b0c-2d3e4f5a6b7c','dotuandat2004nd@gmail.com','2025-02-16 22:19:03.888171',1,'dotuandat2004nd@gmail.com','2025-02-16 22:19:03.888171','th-true-milk','TH True Milk'),
('a3b4c5d6-e7f8-4a9b-0c1d-3e4f5a6b7c8d','dotuandat2004nd@gmail.com','2025-02-17 01:09:25.645923',1,'dotuandat2004nd@gmail.com','2025-02-17 01:09:25.645923','asia-foods','Asia Foods'),
('b4c5d6e7-f8a9-4b0c-1d2e-4f5a6b7c8d9e','dotuandat2004nd@gmail.com','2025-02-17 00:42:59.045731',1,'dotuandat2004nd@gmail.com','2025-02-17 00:42:59.045731','hanoi-organics','Hanoi Organics'),
('c5d6e7f8-a9b0-4c1d-2e3f-5a6b7c8d9e0f','dotuandat2004nd@gmail.com','2025-02-17 01:06:26.181220',1,'dotuandat2004nd@gmail.com','2025-02-17 01:06:26.181220','saigon-fresh','Saigon Fresh'),
('d6e7f8a9-b0c1-4d2e-3f4a-6b7c8d9e0f1a','pesmobile5404@gmail.com','2025-02-16 12:34:57.623047',1,'pesmobile5404@gmail.com','2025-02-16 12:34:57.623047','bac-tom','Bac Tom'),
('e7f8a9b0-c1d2-4e3f-4a5b-7c8d9e0f1a2b','dotuandat2004nd@gmail.com','2025-02-16 22:19:21.715377',1,'dotuandat2004nd@gmail.com','2025-02-16 22:19:21.715377','dalat-farm','Dalat Farm'),
('f8a9b0c1-d2e3-4f4a-5b6c-8d9e0f1a2b3c','dotuandat2004nd@gmail.com','2025-02-16 22:18:41.115223',1,'dotuandat2004nd@gmail.com','2025-02-16 22:18:41.115223','mekong-foods','Mekong Foods'),
('a9b0c1d2-e3f4-4a5b-6c7d-9e0f1a2b3c4d','dotuandat2004nd@gmail.com','2025-02-16 22:19:14.771816',1,'dotuandat2004nd@gmail.com','2025-02-16 22:19:14.771816','green-fields','Green Fields'),
('b0c1d2e3-f4a5-4b6c-7d8e-0f1a2b3c4d5e','dotuandat2004nd@gmail.com','2025-02-09 15:01:20.509410',1,'dotuandat2004nd@gmail.com','2025-03-22 12:31:31.982161','tropical-fruit','Tropical Fruit'),
('c1d2e3f4-a5b6-4c7d-8e9f-1a2b3c4d5e6f','dotuandat2004nd@gmail.com','2025-02-17 00:47:22.071397',1,'dotuandat2004nd@gmail.com','2025-02-17 00:47:22.071397','pure-organics','Pure Organics');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `gender` varchar(5) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `is_active` tinyint NOT NULL,
  `createddate` datetime(6) DEFAULT NULL,
  `modifieddate` datetime(6) DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `modifiedby` varchar(255) DEFAULT NULL,
  `is_guest` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('024317a8-9e55-419d-bb9e-ed4cb104d020','$2a$10$nvzSPO26RCFUoI1sPu64Zei3dpudtd4pOBqnZ807VjFHPOh00e44q','Huy Quần Hoa','0205671231','huyquanhoa@gmail.com',NULL,NULL,1,'2025-03-07 15:11:38.852707','2025-03-08 18:31:01.333989','anonymousUser','anonymousUser',0),
('0a262bfd-d8c9-426f-a2f7-abaec3b0039c','$2a$10$hSOGrZdNvIIo7PIFdV5CKeSKxN5kXFfHpJRFP8DE5lC0k.uvRe8um','Đoàn Thị Trang','0893472345','doanthitrang@gmail.com',NULL,NULL,1,'2025-03-09 23:34:26.082386','2025-03-10 15:13:17.721624','anonymousUser','anonymousUser',0),
('0e285053-f2fd-485d-9f2f-4ea8d6951d17','$2a$10$7shHrWWWmRyW4I44fbS9auOQM2DQC/ohlM3EhcdiwOBinD2Kc2pL6','Đặng Văn Lâm','0953849748','dvlam@gmail.com',NULL,'1995-08-30',1,'2025-01-12 23:52:38.178518','2025-02-09 15:10:46.450580','anonymousUser','dotuandat2004nd@gmail.com',0),
('16763e4f-8c7f-4d78-b90f-3f52ff0227b2','$2a$10$.xdZoTjASteid/OtDb0H5uwrxsqLjQZSvgCFsdoGrTHMD.4pPm/QK','Bùi Trí Dũng','0205671231','btdung@gmail.com',NULL,'2000-08-19',1,'2025-03-12 17:17:55.961214','2025-03-12 17:20:38.244474','anonymousUser','admin@gmail.com',0),
('17d14953-7765-4d41-a2a0-d278aab024ba','$2a$10$Oe9LIFd5PCDoCW3YCBD4duACevlUYn12TjAYCeWZboIHa9IKC7pQi','Selena Gomez','0777777777','selenagz@gmail.com',NULL,'1999-01-01',0,'2025-01-07 00:42:26.250821',NULL,NULL,NULL,0),
('17f6dcdd-dc2d-42f6-9361-34cc1e3b5c53','$2a$10$Uv6JuPdKNCA9E7BxOAfYxeoNopbRCyReRyMP9X.Sj7Y3KuJk3jJkG','Nguyễn Trọng Hoàng','0987656789','nthoang@gmail.com',NULL,'1990-12-31',1,'2025-01-12 15:50:28.623016','2025-01-12 15:50:28.623016','anonymousUser','anonymousUser',0),
('1e92be5e-320c-4606-854e-27bc0814b803','$2a$10$BSxhR5l1pEarkx2nFJ4qFOj68qZ2f3c30J0JIKEr8oLAymkOPKrtO','Mai Thị Hồng','0983247594','mthong@gmail.com',NULL,NULL,1,'2025-03-10 00:01:54.484068','2025-03-10 00:01:54.484068','anonymousUser','anonymousUser',0),
('1ffca06b-0ee6-45ff-8d52-dbdba8440c75',NULL,'Jame','0205671231','jame2@gmail.com',NULL,NULL,1,'2025-03-25 19:16:38.174879','2025-03-25 19:16:38.174879','anonymousUser','anonymousUser',1),
('20731af4-0523-4f77-8e17-f800af2bb718','$2a$10$eXcMGPNnoAN/s9Mwjqnudu0g57pQZq.rXa9cP3oi36cA/uQlM1ONu','QWERTY','0944761755','qwerty@gmail.com',NULL,NULL,1,'2025-03-17 01:23:57.505444','2025-03-17 01:26:01.571851','anonymousUser','anonymousUser',0),
('2172f496-dfaf-4450-9148-f3fecc0a40f8','$2a$10$1TSqtce81lsmacqIU4u/7.kRLSTQFciyWyu04BmFcKtTeWuHFQLmi','Huy','0348975394','huy90@gmail.com',NULL,NULL,1,'2025-03-07 13:55:27.777813','2025-03-07 13:57:11.786232','anonymousUser','anonymousUser',0),
('21aeec38-45d8-4a94-bb93-e57e12a8e226','$2a$10$BRT/QAvQ6MGsGvlqqQ.G8uJiF7bDsABdHAxeAMgE.HRBNO2inrPNy','TEST & TEST','0975434543','testtest@gmail.com',NULL,'1997-09-23',1,'2025-03-10 00:02:48.935669','2025-03-10 00:28:46.407099','anonymousUser','dotuandat2004nd@gmail.com',0),
('3625139c-5bcd-4cca-bbec-0d33d5005d2c','$2a$10$cgT0gllby0NNwhYLPLY36e1/Jnama1SOgB0C7.YrMDjU8qS65wHd6','Đạt Đỗ Tuấn','0686868686','dotuandat932004@gmail.com',NULL,NULL,1,'2025-01-07 00:42:26.250821','2025-02-07 23:21:06.437333',NULL,'dotuandat2004nd@gmail.com',0),
('3c2ba82a-f421-406d-8e65-2546ff28298e','$2a$10$o6CiA0E3iWZjbFLk50QuGe.BHk7NbPaEsFrUZpWlrf0FzBxytbbJa','Super Hero',NULL,'superhero@gmail.com',NULL,'1999-01-01',0,'2025-01-07 00:42:26.250821','2025-01-10 22:10:20.995613',NULL,'dotuandat2004nd@gmail.com',0),
('58d37bb6-ce0c-4edc-bbf3-e9b7b6c4af02','$2a$10$cgT0gllby0NNwhYLPLY36e1/Jnama1SOgB0C7.YrMDjU8qS65wHd6','Đỗ Tuấn Đạt','0944761755','dotuandat2004nd@gmail.com',NULL,'2004-04-05',1,'2025-01-07 00:42:26.250821','2025-03-12 20:52:36.655578',NULL,'dotuandat2004nd@gmail.com',0),
('5d337705-f5f9-47c4-9a0a-591be82ba00f','$2a$10$Y578lRcWG735QijT1cU6BO1nkPPFDbJszbfiSSmx.ZqRgsF9.BM.W','Phạm Văn An','0987654123','phamvanan@gmail.com',NULL,NULL,1,'2025-01-07 00:42:26.250821',NULL,NULL,NULL,0),
('5f169d55-675f-4825-99e4-fe902635ad6a','$2a$10$AkMWApaTBWqPdqRvd0RIau7WUw14FFZu55Qp//uyl41Q8.HquQ2R.','Test Test','0123456789','test001@gmail.com',NULL,NULL,0,'2025-02-22 12:00:21.536476','2025-02-22 12:01:18.748334','anonymousUser','dotuandat2004nd@gmail.com',0),
('637dab9b-00b7-436f-bc54-06fa3ecfd289','$2a$10$4STghHz.TW55.ekDpaN0FuLIecxuUQENwDyXSBHVWbWTodnHX8uK2','John David','0686868686','david123@gmail.com',NULL,'1999-01-01',1,'2025-01-07 00:42:26.250821','2025-02-16 00:06:53.360690',NULL,'dotuandat2004nd@gmail.com',0),
('65041e99-64d4-4f5a-9d8c-576719adec9d','$2a$10$QBV6abH3.FGYiUy6Gnb4z.EViObKRXvQEAteOYgyK9fzCt2rFVoOK','Nguyễn Công Bằng','0932845893','ncbang@gmail.com',NULL,'2010-11-29',1,'2025-03-12 19:01:50.603936','2025-03-15 10:22:12.963485','anonymousUser','admin@gmail.com',0),
('715e5eaf-60ac-4554-b00b-16f58ce23c3c',NULL,'Phạm Xuân Mạnh','0000000000','guest@gmail.com',NULL,NULL,1,'2025-01-11 11:05:01.546609','2025-03-09 23:21:32.625377','anonymousUser','dotuandat2004nd@gmail.com',1),
('7241e571-1d3a-47e8-b1d9-6dc8942b2f3e',NULL,'TEST & TEST','0000000000','test002@gmail.com',NULL,NULL,1,'2025-03-04 19:50:02.404156','2025-03-09 23:21:23.597028','anonymousUser','dotuandat2004nd@gmail.com',1),
('8491c9bb-e3a3-4436-abd8-c3d74216d422',NULL,'Elon Musk','0888888888','richchoi@gmail.com',NULL,NULL,1,'2025-03-04 22:16:38.390149','2025-03-09 23:20:15.095635','anonymousUser','dotuandat2004nd@gmail.com',1),
('8b7d2186-6c43-4365-aab7-c957075b68f5',NULL,'nhiên nguyễn',NULL,'nhienn750@gmail.com',NULL,NULL,1,'2025-01-07 00:42:26.250821',NULL,NULL,NULL,0),
('8de76534-51ca-48e5-b776-6dffb98f3835',NULL,'Phong T1','0348952893','phongt1@gmail.com',NULL,NULL,1,'2025-03-17 11:44:23.219707','2025-03-17 11:44:23.219707','anonymousUser','anonymousUser',1),
('93c1c628-da91-4834-a776-4e3c9d7220b6',NULL,'Phong Đoàn','0328923235','dtphong@gmail.com',NULL,NULL,1,'2025-03-04 22:09:46.210816','2025-03-09 23:20:36.285629','anonymousUser','dotuandat2004nd@gmail.com',1),
('a6664967-a0da-4b31-b893-1b4241881672','$2a$10$E5Dxt/YSg8gwMabWZj9SD.Zg3hlEU.g7uIipL1mkpWIbBW.RttVGO','Jame','0342734587','jame4@gmail.com',NULL,NULL,1,'2025-03-25 19:40:23.347366','2025-03-25 19:45:38.212187','anonymousUser','anonymousUser',0),
('a7ddd32e-f737-4ff4-af59-18144fc9a432','$2a$10$jU0uL44cuIeROxWyJ20vAu2LNglQXtAexczchPvdvfKSg7GA6ksGC','ADMIN','0999999999','admin@gmail.com',NULL,'2004-04-05',1,'2025-01-07 00:42:26.250821','2025-03-17 11:32:59.961049',NULL,'admin@gmail.com',0),
('a83217e6-4591-4d14-b822-d7de6b728454',NULL,'TEST & TEST','0000000000','test003@gmail.com',NULL,NULL,1,'2025-03-04 21:05:56.372617','2025-03-09 23:21:12.633892','anonymousUser','dotuandat2004nd@gmail.com',1),
('a90533bf-ce4b-4187-8c5e-77046b70c03e','$2a$10$Z3ZuJWPYxVybY5eN0044i.W1F3qxDVSo1llo9cg9q7vVMlz.gw0qm','Hào Sữa','0987654321','haosua@gmail.com',NULL,NULL,1,'2025-03-15 10:18:28.235157','2025-03-15 10:23:17.485208','anonymousUser','admin@gmail.com',0),
('afff85d7-53e8-40f9-9271-440bde54b151','$2a$10$qbfMnnYS3U40pQk5scrdeu2om0iuvwq6ZGxhryr2W6Z6cipcgdgcu','Đoàn Thị Yến','0987654567','dtyen@gmail.com',NULL,'2000-07-24',1,'2025-01-07 00:42:26.250821',NULL,NULL,NULL,0),
('b3e71cdf-5efa-4d05-a164-23b46b60750d','$2a$10$enQ3ulE/hrujJXntBqB69eAkL0tJLMRprAqv6ugdxApRKTcOER3N.','TTP. Tuấn','0205671231','j97@gmail.com',NULL,'1997-08-19',1,'2025-03-05 21:18:11.660036','2025-03-05 22:28:58.279243','anonymousUser','dotuandat2004nd@gmail.com',0),
('b4efe810-eec2-4fe0-93cf-85f38748aa16',NULL,'Trần Đình Trọng','0123456987','guest123@gmail.com',NULL,'1990-10-10',1,'2025-01-12 14:07:22.773356','2025-01-12 15:48:31.535607','anonymousUser','anonymousUser',1),
('bc2b20c0-49d8-4f5a-83eb-600cb8086d92',NULL,'Jame','0342734587','jame5@gamil.com',NULL,NULL,1,'2025-03-25 19:47:12.747791','2025-03-25 19:47:12.747791','anonymousUser','anonymousUser',1),
('c2672bf7-d02f-4a99-aefd-6042bbfc374b',NULL,'Vũ Thịnh','0350934875','vuthinh13@gmail.com',NULL,NULL,1,'2025-03-17 11:47:48.240324','2025-03-17 11:47:48.240324','anonymousUser','anonymousUser',1),
('c4f58d63-22e7-45c2-b99f-94471ba74dac','$2a$10$30u8o1lYlmCsnpBMAnceB.FTjNsUeyYttiDz1V7Cobx/rrRADwKN2','Timber','0955996933','timber1234@gmail.com',NULL,'1999-04-15',1,'2025-01-07 00:42:26.250821','2025-01-11 00:40:33.845887',NULL,'dotuandat2004nd@gmail.com',0),
('c6182f9b-e889-43b0-b30e-2802c7ff73c9','$2a$10$0O.2Of8fA82/40ZaEsZxKeaAGtyGd5YgMcz0ijyZzcT4Ze4P8JhcK','Ngô Thu Thảo','0832943759','ntthao@gmail.com',NULL,NULL,1,'2025-03-17 12:35:45.255429','2025-03-17 12:35:45.255429','anonymousUser','anonymousUser',0),
('c68506d2-7c97-4f6e-b51a-826f467dbd4e',NULL,'Vũ Văn Abc','0345345435','abc@gmail.com',NULL,NULL,1,'2025-03-09 00:40:22.950004','2025-03-09 23:19:28.329552','anonymousUser','dotuandat2004nd@gmail.com',1),
('ce43ca27-1e60-4713-affb-81d91fe04994','$2a$10$HQY3sZ6tYwt9hzmFoXxEku4cm1Znj3ifm64GR72x3zeg8LvOI0ndu','Mark','0348572748','mark123@gmail.com',NULL,'1999-01-01',1,'2025-01-07 00:42:26.250821',NULL,NULL,NULL,0),
('cfdae048-449a-4e64-aabc-1422eb3c0f2b',NULL,'Lê Bảo Bình','0359679235','lbbinh@gmail.com',NULL,NULL,1,'2025-03-15 10:10:16.190615','2025-03-15 10:10:16.190615','anonymousUser','anonymousUser',1),
('d0a11fcf-b08f-4116-86e7-ffc7e978246e','$2a$10$I/suujbs434ive0uIXUcfupYS/0qvRys.2CChGgAT8ev8eCVNTyN2','Đinh Thanh Bình','0325385098','dtbinh@gmail.com',NULL,NULL,1,'2025-01-13 00:13:00.396646','2025-01-13 00:15:28.570544','anonymousUser','dotuandat2004nd@gmail.com',0),
('d0abf087-be2a-4a40-b002-bfff337c026f','$2a$10$9e0hfWIpRbMWuioMG9Fl2eG4FCC3UTSjX4MTJb2.q8YkNgDBQlX.S','Nguyễn Quang Hải','0955996933','nqhai@gmail.com',NULL,'1997-04-12',1,'2025-01-08 23:25:57.468101','2025-03-11 11:04:43.750720','anonymousUser','nqhai@gmail.com',0),
('d435d2b6-34f2-4226-85d4-1149f12c4761','$2a$10$RWwle5LA6sUbRtfaWWuzz.stSmys3KK3OtexU9s4h6tiuE95KVKL6','Đạt Đỗ Tuấn','0987654321','pesmobile5404@gmail.com',NULL,NULL,1,'2025-01-07 00:42:26.250821','2025-02-12 23:29:14.336779',NULL,'dotuandat2004nd@gmail.com',0),
('dc4cb5e8-00b7-4c85-bed7-85a9e96de897',NULL,'Jame','0205671231','jame3@gmail.com',NULL,NULL,1,'2025-03-25 19:32:00.016974','2025-03-25 19:32:00.016974','anonymousUser','anonymousUser',1),
('dc73d495-715f-4795-97dd-bd05b73e9668','$2a$10$WEJShM.ACjMwOB2dnof1KuBlTTomnzSfAwa4w7kmhqMJ3a9v8zydO','Vũ Văn Lâm','0205671231','vvlam@gmail.com',NULL,'2002-12-18',1,'2025-01-07 00:42:26.250821','2025-03-13 22:24:19.473639','anonymousUser','vvlam@gmail.com',0),
('dcecb39a-f6a8-4c92-b0d3-e42e6579bee3','$2a$10$v7vzTo7Z7M.ww2j.cNYbIuswnAmXIaebK68xhRtwhl2t9XNTJQmSy','Phan Sơn Tùng',NULL,'xiaolingamingxg@gmail.com',NULL,NULL,1,'2025-01-07 00:42:26.250821',NULL,NULL,NULL,0),
('decd643b-2bce-411c-8b04-ffaf9681ac10','$2a$10$HrzsPxYBbsg1MGR6urp0weWHjGcChrH7iLguKPdqz8QHHwmlcDCJ2','Bùi Mạnh','0342958973','bmanh005@gmail.com',NULL,NULL,1,'2025-03-16 00:05:02.131335','2025-03-16 18:03:18.664632','anonymousUser','dotuandat2004nd@gmail.com',0),
('df365c04-5060-4315-9222-7c2f007a44d3','$2a$10$cgT0gllby0NNwhYLPLY36e1/Jnama1SOgB0C7.YrMDjU8qS65wHd6','Đỗ Tuấn Đạt','0944761755','dtdat@gmail.com',NULL,NULL,1,'2025-03-04 22:06:56.671096','2025-03-10 00:09:23.943658','anonymousUser','dotuandat2004nd@gmail.com',0),
('e2579cb8-b240-4405-a3ba-e52b55831a33','$2a$10$f3.dOcys9Hoz9/sTcpAGYebXGuEicUtWf500YDi4psSC2ovhhJCgi','Lục Văn Hải','0955996933','lvhai@gmail.com',NULL,'1999-04-15',1,'2025-01-07 00:42:26.250821','2025-01-10 19:28:57.189776',NULL,'admin@gmail.com',0),
('ed35d4f7-3105-4473-9882-12ca5539d083','$2a$10$1YfFj6kR6cLmZfl5STHZNe3I/nCfivAwk.fdAEnWD0ddjb9tQZJCy','Serena','0222222222','serena@gmail.com',NULL,'1999-01-01',1,'2025-01-07 00:42:26.250821','2025-01-11 12:01:49.066582',NULL,'dotuandat2004nd@gmail.com',0),
('ef72e64a-4ba2-41cf-8b49-5be97968f3ad','$2a$10$Mu5A0bjxAUnBm3K/UAXrXOrR91gV62lpsEtXPMxH.Qs11noSVA.U2','Nguyễn Công Phượng','0555555555','ncphuong@gmail.com',NULL,'1997-04-15',1,'2025-01-08 23:13:49.893515','2025-01-12 23:28:43.315004','anonymousUser','admin@gmail.com',0),
('f8057ca0-5b23-466d-ac36-c85ef413e83b','$2a$10$TAmtn7V37Dt7ckPfu0pGWeGjO3LXXRlLbppOjpgEVjk.R.85jyVq.','John Doe','0131313131','johndoe123@gmail.com',NULL,NULL,0,'2025-01-07 00:42:26.250821','2025-01-10 20:02:12.655859',NULL,'dotuandat2004nd@gmail.com',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `roleid` varchar(36) NOT NULL,
  `userid` varchar(36) NOT NULL,
  PRIMARY KEY (`roleid`,`userid`),
  KEY `userid` (`userid`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`roleid`) REFERENCES `role` (`id`),
  CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`userid`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES ('5376954e-d221-40cb-afa4-35a196ac6769','024317a8-9e55-419d-bb9e-ed4cb104d020'),
('5376954e-d221-40cb-afa4-35a196ac6769','0a262bfd-d8c9-426f-a2f7-abaec3b0039c'),
('5376954e-d221-40cb-afa4-35a196ac6769','0e285053-f2fd-485d-9f2f-4ea8d6951d17'),
('5376954e-d221-40cb-afa4-35a196ac6769','16763e4f-8c7f-4d78-b90f-3f52ff0227b2'),
('5376954e-d221-40cb-afa4-35a196ac6769','17d14953-7765-4d41-a2a0-d278aab024ba'),
('5376954e-d221-40cb-afa4-35a196ac6769','17f6dcdd-dc2d-42f6-9361-34cc1e3b5c53'),
('844a29ca-5087-44dc-ab67-1b95628fcd4d','1e92be5e-320c-4606-854e-27bc0814b803'),
('5376954e-d221-40cb-afa4-35a196ac6769','1ffca06b-0ee6-45ff-8d52-dbdba8440c75'),
('5376954e-d221-40cb-afa4-35a196ac6769','20731af4-0523-4f77-8e17-f800af2bb718'),
('5376954e-d221-40cb-afa4-35a196ac6769','2172f496-dfaf-4450-9148-f3fecc0a40f8'),
('5376954e-d221-40cb-afa4-35a196ac6769','21aeec38-45d8-4a94-bb93-e57e12a8e226'),
('d05f2583-888c-4c8a-bea4-cb5b76154684','21aeec38-45d8-4a94-bb93-e57e12a8e226'),
('5376954e-d221-40cb-afa4-35a196ac6769','3625139c-5bcd-4cca-bbec-0d33d5005d2c'),
('d05f2583-888c-4c8a-bea4-cb5b76154684','3625139c-5bcd-4cca-bbec-0d33d5005d2c'),
('5376954e-d221-40cb-afa4-35a196ac6769','3c2ba82a-f421-406d-8e65-2546ff28298e'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','58d37bb6-ce0c-4edc-bbf3-e9b7b6c4af02'),
('5376954e-d221-40cb-afa4-35a196ac6769','5d337705-f5f9-47c4-9a0a-591be82ba00f'),
('5376954e-d221-40cb-afa4-35a196ac6769','5f169d55-675f-4825-99e4-fe902635ad6a'),
('5376954e-d221-40cb-afa4-35a196ac6769','637dab9b-00b7-436f-bc54-06fa3ecfd289'),
('5376954e-d221-40cb-afa4-35a196ac6769','65041e99-64d4-4f5a-9d8c-576719adec9d'),
('5376954e-d221-40cb-afa4-35a196ac6769','715e5eaf-60ac-4554-b00b-16f58ce23c3c'),
('5376954e-d221-40cb-afa4-35a196ac6769','7241e571-1d3a-47e8-b1d9-6dc8942b2f3e'),
('5376954e-d221-40cb-afa4-35a196ac6769','8491c9bb-e3a3-4436-abd8-c3d74216d422'),
('5376954e-d221-40cb-afa4-35a196ac6769','8b7d2186-6c43-4365-aab7-c957075b68f5'),
('844a29ca-5087-44dc-ab67-1b95628fcd4d','8b7d2186-6c43-4365-aab7-c957075b68f5'),
('5376954e-d221-40cb-afa4-35a196ac6769','8de76534-51ca-48e5-b776-6dffb98f3835'),
('5376954e-d221-40cb-afa4-35a196ac6769','93c1c628-da91-4834-a776-4e3c9d7220b6'),
('5376954e-d221-40cb-afa4-35a196ac6769','a6664967-a0da-4b31-b893-1b4241881672'),
('b2251a4c-b2f5-48ee-add4-bbd55c543d75','a7ddd32e-f737-4ff4-af59-18144fc9a432'),
('5376954e-d221-40cb-afa4-35a196ac6769','a83217e6-4591-4d14-b822-d7de6b728454'),
('5376954e-d221-40cb-afa4-35a196ac6769','a90533bf-ce4b-4187-8c5e-77046b70c03e'),
('5376954e-d221-40cb-afa4-35a196ac6769','afff85d7-53e8-40f9-9271-440bde54b151'),
('5376954e-d221-40cb-afa4-35a196ac6769','b3e71cdf-5efa-4d05-a164-23b46b60750d'),
('5376954e-d221-40cb-afa4-35a196ac6769','b4efe810-eec2-4fe0-93cf-85f38748aa16'),
('5376954e-d221-40cb-afa4-35a196ac6769','bc2b20c0-49d8-4f5a-83eb-600cb8086d92'),
('5376954e-d221-40cb-afa4-35a196ac6769','c2672bf7-d02f-4a99-aefd-6042bbfc374b'),
('5376954e-d221-40cb-afa4-35a196ac6769','c4f58d63-22e7-45c2-b99f-94471ba74dac'),
('5376954e-d221-40cb-afa4-35a196ac6769','c6182f9b-e889-43b0-b30e-2802c7ff73c9'),
('5376954e-d221-40cb-afa4-35a196ac6769','c68506d2-7c97-4f6e-b51a-826f467dbd4e'),
('5376954e-d221-40cb-afa4-35a196ac6769','ce43ca27-1e60-4713-affb-81d91fe04994'),
('5376954e-d221-40cb-afa4-35a196ac6769','cfdae048-449a-4e64-aabc-1422eb3c0f2b'),
('5376954e-d221-40cb-afa4-35a196ac6769','d0a11fcf-b08f-4116-86e7-ffc7e978246e'),
('5376954e-d221-40cb-afa4-35a196ac6769','d0abf087-be2a-4a40-b002-bfff337c026f'),
('4f213730-ede7-4709-ac08-ab849fc779de','d435d2b6-34f2-4226-85d4-1149f12c4761'),
('5376954e-d221-40cb-afa4-35a196ac6769','d435d2b6-34f2-4226-85d4-1149f12c4761'),
('5376954e-d221-40cb-afa4-35a196ac6769','dc4cb5e8-00b7-4c85-bed7-85a9e96de897'),
('5376954e-d221-40cb-afa4-35a196ac6769','dc73d495-715f-4795-97dd-bd05b73e9668'),
('5376954e-d221-40cb-afa4-35a196ac6769','dcecb39a-f6a8-4c92-b0d3-e42e6579bee3'),
('844a29ca-5087-44dc-ab67-1b95628fcd4d','dcecb39a-f6a8-4c92-b0d3-e42e6579bee3'),
('5376954e-d221-40cb-afa4-35a196ac6769','decd643b-2bce-411c-8b04-ffaf9681ac10'),
('5376954e-d221-40cb-afa4-35a196ac6769','df365c04-5060-4315-9222-7c2f007a44d3'),
('5376954e-d221-40cb-afa4-35a196ac6769','e2579cb8-b240-4405-a3ba-e52b55831a33'),
('5376954e-d221-40cb-afa4-35a196ac6769','ed35d4f7-3105-4473-9882-12ca5539d083'),
('5376954e-d221-40cb-afa4-35a196ac6769','ef72e64a-4ba2-41cf-8b49-5be97968f3ad'),
('5376954e-d221-40cb-afa4-35a196ac6769','f8057ca0-5b23-466d-ac36-c85ef413e83b');
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;