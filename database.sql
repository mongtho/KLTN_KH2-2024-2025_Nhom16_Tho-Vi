-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: ems
-- ------------------------------------------------------
-- Server version	8.0.41

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

--
-- Table structure for table `communications`
--

DROP TABLE IF EXISTS `communications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `author_name` varchar(255) DEFAULT NULL,
  `content` text,
  `created_at` datetime(6) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `published_at` datetime(6) DEFAULT NULL,
  `reject_reason` varchar(255) DEFAULT NULL,
  `shares` int DEFAULT NULL,
  `status` enum('DRAFT','PENDING','PUBLISHED','REJECTED') NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('ANNOUNCEMENT','EVENT','NEWS') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `views` int DEFAULT NULL,
  `approver_id` bigint DEFAULT NULL,
  `author_id` bigint DEFAULT NULL,
  `office_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7b5is9bfjb2miv15m2dmv5gjp` (`approver_id`),
  KEY `FKejs33powbpun8a57cfb0foqvk` (`author_id`),
  KEY `FKkfa7taehw5mx84tvuaeall0v` (`office_id`),
  CONSTRAINT `FK7b5is9bfjb2miv15m2dmv5gjp` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKejs33powbpun8a57cfb0foqvk` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKkfa7taehw5mx84tvuaeall0v` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communications`
--

LOCK TABLES `communications` WRITE;
/*!40000 ALTER TABLE `communications` DISABLE KEYS */;
INSERT INTO `communications` VALUES (7,'admin','Ngày 1/6/2023, Khoa Công nghệ Thông tin đã tiến hành đánh giá các đề tài khoá luận tốt nghiệp được thực hiện trong học kỳ II năm học 2022-2023. Đây có thể xem là một bước ngoặt quan trọng đánh dấu sự hoàn thành chặng đường đại học của các bạn sinh viên khoa Công nghệ Thông tin.\n\nKhoa Công nghệ Thông tin tự hào công bố danh sách các sinh viên đã hoàn thành thành công khoá luận tốt nghiệp. Đây là kết quả của những nỗ lực, sự chăm chỉ và sự kiên trì trong nghiên cứu và thực hiện dự án quan trọng. Các sinh viên đã thể hiện khả năng, kiến thức và kỹ năng chuyên môn đáng nể, đồng thời góp phần vào sự phát triển của lĩnh vực Công nghệ Thông tin.\nKhoá luận tốt nghiệp không chỉ là một bài kiểm tra cuối cùng mà còn là cơ hội để các bạn thể hiện tài năng, ý tưởng sáng tạo và khả năng giải quyết vấn đề. Đây cũng là một chặng đường gian nan đầy thử thách, nhưng qua đó các bạn đã trưởng thành và sẵn sàng bước vào một tương lai rộng mở với những cơ hội và thách thức mới.\n\n\n','2025-04-28 14:26:45.352711','https://i.ibb.co/hRqPtGVy/TT1-png.png','2025-04-28 14:35:58.113086',NULL,0,'PUBLISHED','Đánh giá Khóa luận tốt nghiệp - HK 2 năm học 2022-2023','NEWS','2025-04-28 14:59:06.084448',0,NULL,1,2),(8,'Nguyễn Văn An','Vào thứ Sáu, ngày 21/03/2025 vừa qua, chuỗi seminar \"Học Thuật Không Giới Hạn\" đã chính thức khai mạc với buổi đầu tiên mang chủ đề \"Nâng cao chất lượng danh sách khuyến nghị sử dụng mạng tích chập đồ thị\", do TS. Lê Thị Vĩnh Thanh, giảng viên Khoa Công nghệ Thông tin, trình bày. Chuỗi seminar được tổ chức nhằm tạo ra không gian trao đổi học thuật sôi động, kết nối và thúc đẩy tư duy nghiên cứu trong cộng đồng giảng viên.\n\nTrong kỷ nguyên số hóa với lượng dữ liệu khổng lồ ngày càng gia tăng, các hệ thống khuyến nghị (Recommender Systems) đóng vai trò quan trọng trong việc cá nhân hóa nội dung, giúp người dùng tiếp cận thông tin phù hợp một cách hiệu quả. Tại buổi seminar, TS. Lê Thị Vĩnh Thanh đã giới thiệu một phương pháp mới kết hợp cấu trúc phân cụm và mạng tích chập đồ thị (Graph Convolutional Network - GCN) nhằm cải thiện độ chính xác của hệ thống khuyến nghị, đồng thời duy trì sự cân bằng giữa độ chính xác và tính đa dạng trong danh sách đề xuất.\n\nPhương pháp này xây dựng trên nền tảng cấu trúc cây phân cấp kết hợp với khoảng cách năng lượng (Energy Distance) để nhóm người dùng và sản phẩm theo từng cụm tương đồng. Trên cơ sở đó, ba loại đồ thị được xây dựng để biểu diễn mối quan hệ giữa người dùng và sản phẩm: đồ thị quan hệ người dùng (SU-Graph) dựa trên các cụm người dùng tương tự, đồ thị quan hệ sản phẩm (SI-Graph) dựa trên các cụm sản phẩm tương tự, và đồ thị biểu diễn mối quan hệ giữa người dùng và sản phẩm dựa trên ma trận đánh giá (UI-Graph). Quá trình huấn luyện GCN trên hệ thống đồ thị giúp nâng cao độ chính xác trong dự đoán đánh giá của người dùng, đồng thời áp dụng thuật toán xếp hạng lại để đảm bảo danh sách khuyến nghị có tính đa dạng cao hơn.\n\nKết quả thực nghiệm trên các bộ dữ liệu MovieLens (100K, 1M và 10M) cho thấy phương pháp đề xuất vượt trội so với các mô hình truyền thống, chứng minh tính hiệu quả trong việc cải thiện chất lượng khuyến nghị. Buổi seminar đã giúp người tham dự nắm bắt phương pháp phân cụm người dùng - sản phẩm dựa trên khoảng cách năng lượng, quy trình xây dựng hệ thống đồ thị, cách ứng dụng GCN trong dự đoán đánh giá người dùng, và chiến lược xếp hạng lại để tối ưu sự cân bằng giữa độ chính xác và tính đa dạng.\n\nĐây là một hướng nghiên cứu tiềm năng trong lĩnh vực hệ thống khuyến nghị, tập trung vào việc ứng dụng học sâu nhằm nâng cao khả năng dự đoán, đồng thời cải thiện trải nghiệm người dùng.\n\nBuổi chia sẻ đã nhận được sự quan tâm đông đảo từ các giảng viên, với nhiều câu hỏi thảo luận sôi nổi, góp phần mở ra những góc nhìn mới trong nghiên cứu về hệ thống khuyến nghị.','2025-04-28 14:28:58.660956','https://i.ibb.co/d4yBZqs7/TT4-png.png','2025-04-28 14:36:54.295638',NULL,0,'PUBLISHED','Seminar: \"Nâng cao chất lượng danh sách khuyến nghị sử dụng mạng tích chập đồ thị\"','NEWS','2025-04-28 14:59:25.399944',0,NULL,5,2),(9,'Trương Thị Tường Vi','Ngày 15/12/2024, Khoa Công nghệ Thông tin, Trường Đại học Công nghiệp TP. Hồ Chí Minh (IUH) đã tổ chức thành công Hội thảo Sinh viên Nghiên cứu Khoa học (SSRC-2024). Sự kiện này không chỉ là dịp để sinh viên trình bày các nghiên cứu khoa học mà còn tạo cơ hội giao lưu, học hỏi kinh nghiệm từ các chuyên gia và doanh nghiệp trong lĩnh vực công nghệ thông tin\nHội thảo vinh dự nhận được sự tài trợ từ:\n\nÔng Phí Anh Tuấn - Đồng sáng lập STS, Giám đốc VTIC - CTCP Giải pháp Dệt may Bền vững (STS).\nBà Phạm Hương Thảo - Tổng Giám đốc công ty F1Security, Korea\nSSRC-2024 thu hút sự tham gia của đông đảo sinh viên với tổng số 68 bài nghiên cứu gửi về. Sau quá trình đánh giá chặt chẽ, 60 bài nghiên cứu xuất sắc nhất đã được chọn để đăng trong kỷ yếu hội thảo.','2025-04-28 14:34:26.631048','https://i.ibb.co/4nXxz3nL/TT3-png.png',NULL,NULL,0,'PENDING','Hội thảo Sinh viên Nghiên cứu Khoa học (SSRC-2024).','NEWS','2025-04-28 15:00:25.388608',0,NULL,6,2),(10,'admin','Sáng ngày 3 tháng 8 năm 2024 vừa qua Bộ môn Hệ thống thông tin đã tổ chức Seminar học thuật về chủ đề GPT builder do Cô Phan Thị Bảo Trân. Đề tài trình bày giới thiệu tổng quan về trí tuệ nhân tạo, các mô hình GPT, ChatGPT, mối liên hệ giữa chúng cũng như đưa ra những phân tích, so sánh, trải nghiệm và các ví dụ trực quan cụ thể. Buổi seminar cũng đưa ra một số chủ đề thảo luận sôi nổi nhằm làm rõ ràng hơn các khái niệm về máy học, học sâu, xử lý ngôn ngữ tự nhiên, thị giác máy tính hay hệ chuyên gia cũng như mối liên hệ hoặc sự khác biệt giữa các khái niệm.\nBuổi Seminar đã tạo điều kiện tốt nhằm trao đổi học thuật về lĩnh vực trí tuệ nhân tạo, GPT, thảo luận về các ứng dụng, đồng thời khuyến khích các hoạt động tiếp theo nhằm thích nghi với những thay đổi trong cách dạy và học sử dụng GPT./.','2025-04-28 14:42:04.705439','https://i.ibb.co/hRqPtGVy/TT1-png.png',NULL,NULL,0,'PENDING','Seminar học thuật chủ đề GPT','NEWS','2025-04-28 15:00:13.418743',0,NULL,1,2),(12,'Trương Thị Tường Vi','rteterte5erte','2025-05-08 19:57:22.603391',NULL,'2025-05-08 19:58:35.489440',NULL,0,'PUBLISHED','jhgcfadhfah','ANNOUNCEMENT','2025-05-08 19:58:35.491974',0,NULL,6,2),(13,'Nguyễn Văn An','Trần Văn Nhân, sinh viên năm 4 ngành Kỹ thuật Phần mềm, trưởng nhóm dự án, chia sẻ IUHCoder được phát triển từ nhu cầu cấp thiết của giảng viên và sinh viên. Trong quá trình học lập trình của sinh viên công nghệ thông tin, ngoài những khoảng thời gian ngắn được trao đổi với giảng viên trên lớp thì phần lớn thời gian tự học, thực hành viết code họ luôn gặp khó khăn khi kiểm tra tính đúng/sai của chương trình cũng như mức độ tối ưu của các thuật toán. Bên cạnh đó, ở phía người dạy, giảng viên cũng cho biết họ luôn trong trình trạng quá tải khi phải chấm điểm một số lượng lớn các bài thi, bài kiểm tra cũng như khả năng đánh giá chính xác năng lực của từng người học và sự công bằng giữa các bạn đồng học. Những khó khăn thường trực trong học tập đã thúc đẩy nhóm phát triển nền tảng số hóa nội dung và số hóa hoạt động đánh giá năng lực lập trình.\nNgoài việc phải học số lượng lớn kiến thức lập trình của sinh viên Công nghệ Thông tin nói chung, Trần Văn Nhân (Giải Ba Olympic Tin học sinh viên, huy chương Đồng vùng châu Á ICPC) và các bạn trong đội tuyển Olympic tin học của trường Đại học Công nghiệp Tp.HCM với những cái tên sáng giá như Phan Chí Trung (Huy chương Đồng vùng châu Á, cuộc thi lập trình quốc tế ICPC), Thái Thị Hiền (Huy chương Đồng Olympic Toán  học sinh viên Việt Nam), Đào Xuân Hoàng Tuấn (Giải Ba cuộc thi lập trình ICPC toàn quốc), Trần Quốc Trọng (Giải Ba Olympic tin học sinh viên Việt Nam) phải tự học một số lượng lớn kiến thức chuyên sâu về thiết kế giải thuật và cấu trúc dữ liệu. Toàn bộ quá trình này diễn ra với hơn 70% thời lượng là sinh viên tự học và 30% là dẫn dắt và huấn luyện (coaching) của giảng viên mentor nên việc tự động hóa chấm code các bài tập càng trở nên cấp thiết. Hơn ai hết, thấu hiểu của người học và người dạy là nguồn khởi để Nhân và cộng sự phát triển IUHCoder với tôn chỉ “Build by students for students, build by teachers for teachers” (“Xây dựng bởi người học để phục vụ người học, xây dựng bởi người dạy để phục vụ người dạy”).\n','2025-05-12 10:10:57.659426',NULL,'2025-05-12 10:12:41.715652',NULL,0,'PUBLISHED','Hội thảo sinh viên nghiên cứu khoa học (SSRC-2024)','NEWS','2025-05-12 10:12:41.716662',0,NULL,5,2);
/*!40000 ALTER TABLE `communications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `establishment_year` int DEFAULT NULL,
  `head_of_department` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKj6cwks7xecs5jov19ro8ge3qk` (`name`),
  UNIQUE KEY `UKp9ix4lqmxlm0qp4hh46d5on2l` (`contact_email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'FIT_IUH@iuh.edu.vn','0283.8940 390 (233)','Khoa Công nghệ thông tin (CNTT) được hình thành từ năm 1996, Trải qua chặng đường dài không ngừng nỗ lực hoàn thiện và phát triển, Khoa CNTT đang từng bước khẳng định uy tín của mình với phương châm “Đào tạo sinh viên vững lý thuyết, giỏi thực hành và làm chủ công nghệ mới”',1996,'Lê Nhât Duy','12 Nguyễn Văn Bảo, Q. Gò Vấp, TP. Hồ Chí Minh Khoa Công nghệ Thông tin - Lầu 1 - Nhà H','http://fit.iuh.edu.vn//','Khoa Công Nghệ Công Tin','fit.iuh.edu.vn'),(2,'infofba@iuh.edu.vn','0283.8940 390 – 158','Khoa Quản trị Kinh doanh là một trong những khoa lớn của trường Đại học Công nghiệp Thành phố Hồ Chí Minh và là một trong những khoa chủ lực của khối ngành kinh tế.',1999,'Nguyễn Thành Long','Lầu 3 Nhà D – 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, Tp. Hồ Chí MinhLầu 3 Nhà D – 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, Tp. Hồ Chí Minh','https://fba.iuh.edu.vn/vi/','Khoa Quản Trị Kinh Doanh','https://fba.iuh.edu.vn/v'),(3,'fme@iuh.edu.vn',' 0283 8940 390 - 179, 183','Khoa Công nghệ Cơ khí được thành lập năm 2005. Đến năm 2011, sáp nhập Trung tâm Cơ khí và Trung tâm Gò hàn vào Khoa Công nghệ Cơ khí. Tiền thân của Khoa Công nghệ Cơ khí là ban Máy công cụ, Nguội, Gò-Hàn-Rèn  của Trường Trung học Kỹ thuật Don Bosco từ năm 1968.',1968,'Nguyễn Đức Nam','Lầu 3 Nhà X - 12 Nguyễn Văn Bảo, Phường 1, Quận Gò Vấp, Tp. Hồ Chí Minhv','https://iuh.edu.vn/vi','Khoa Công nghệ Cơ Khí','https://iuh.edu.vn/vi/don-vi-dao-tao-fi25/khoa-cong-nghe-co-khi-a1173.html'),(4,'feet@iuh.edu.vn','(028)3 8940 390 - 175','Khoa Công nghệ Điện là một trong những Khoa được thành lập sớm nhất trong trường với tên gọi trước đây là Ban điện. Trải qua thời gian dài xây dựng và phát triển cùng với sự phát triển của Nhà trường, đến nay Khoa Công nghệ Điện vẫn luôn là một trong các khoa có thành tích giảng dạy, nghiên cứu khoa học, kết nối doanh nghiệp và đầu tư nâng cấp phòng thí nghiệm nổi bật của Nhà trường. ',1976,' Trần Thanh Ngọc','Lầu 5 nhà X - 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, Tp. Hồ Chí Minh','https://iuh.edu.vn/vi','Khoa Công Nghê Điện','https://iuh.edu.vn/vi/don-vi-dao-tao-fi25/khoa-cong-nghe-dien-a1174.html'),(5,'fhre@iuh.edu.vn','(028) 38 940 390 - 196','Khoa Công nghệ Nhiệt Lạnh cung cấp các chương trình đào tạo thực tế và hiện đại, chú trọng lý thuyết và phát triển kỹ năng thực hành ứng dụng nhằm trang bị cho sinh viên các kiến thức, kỹ năng và thái độ cần thiết để trở thành những chuyên gia, nhân viên kỹ thuật trong tương lai, đáp ứng nguồn nhân lực có trình độ cao cho các doanh nghiệp.',2008,'Bùi Trung Thành',' Lầu 6 Nhà X - 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, Tp. Hồ Chí Minh','https://iuh.edu.vn/vi','Khoa Công Nghệ Nhiệt Lanh','https://iuh.edu.vn/vi/don-vi-dao-tao-fi25/khoa-cong-nghe-nhiet-lanh-a1178.html');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_organizers`
--

DROP TABLE IF EXISTS `event_organizers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_organizers` (
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`event_id`,`user_id`),
  KEY `FK2k919dlh6g5wjor0sd75ai632` (`user_id`),
  CONSTRAINT `FK16stg4khqay3j62bjnxp8rgdb` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  CONSTRAINT `FK2k919dlh6g5wjor0sd75ai632` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_organizers`
--

LOCK TABLES `event_organizers` WRITE;
/*!40000 ALTER TABLE `event_organizers` DISABLE KEYS */;
INSERT INTO `event_organizers` VALUES (8,3),(9,3),(10,3),(11,3),(14,3),(15,3),(16,3),(17,3),(8,5),(9,5),(10,5),(11,5),(14,5),(15,5),(16,5),(8,6),(9,6),(10,6),(11,6),(14,6),(15,6),(16,6);
/*!40000 ALTER TABLE `event_organizers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_report_attachments`
--

DROP TABLE IF EXISTS `event_report_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_report_attachments` (
  `report_id` bigint NOT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  KEY `FKcxyvqqsv1w9l5hy0smgowom93` (`report_id`),
  CONSTRAINT `FKcxyvqqsv1w9l5hy0smgowom93` FOREIGN KEY (`report_id`) REFERENCES `event_reports` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_report_attachments`
--

LOCK TABLES `event_report_attachments` WRITE;
/*!40000 ALTER TABLE `event_report_attachments` DISABLE KEYS */;
INSERT INTO `event_report_attachments` VALUES (2,'TT1.png');
/*!40000 ALTER TABLE `event_report_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_reports`
--

DROP TABLE IF EXISTS `event_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `approved_date` datetime(6) DEFAULT NULL,
  `attendees` int NOT NULL,
  `challenges` text,
  `date` date NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `event_id` varchar(255) DEFAULT NULL,
  `event_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `organizer` varchar(255) NOT NULL,
  `outcomes` text,
  `recommendations` text,
  `reject_reason` text,
  `rejected_date` datetime(6) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') NOT NULL,
  `submitted_date` datetime(6) DEFAULT NULL,
  `summary` text,
  `approved_by` bigint DEFAULT NULL,
  `rejected_by` bigint DEFAULT NULL,
  `submitted_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6faf32yoyu0coj7tccmrcuj6y` (`approved_by`),
  KEY `FKpc2ateb0rnvb13l9ium007jxr` (`rejected_by`),
  KEY `FK9qfw1d4tf6vvgx52am0utw0to` (`submitted_by`),
  CONSTRAINT `FK6faf32yoyu0coj7tccmrcuj6y` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FK9qfw1d4tf6vvgx52am0utw0to` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpc2ateb0rnvb13l9ium007jxr` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_reports`
--

LOCK TABLES `event_reports` WRITE;
/*!40000 ALTER TABLE `event_reports` DISABLE KEYS */;
INSERT INTO `event_reports` VALUES (2,'2025-05-05 12:42:32.090193',100,'ng','2025-04-09',NULL,'9','Hội thảo: Chia sẻ Kỹ năng và Kiến thức cho lần đầu đi phỏng vấn','sfsfdg','Trường đại học công nghiệp Tp.HCM','ngfbnfg','gfh',NULL,NULL,'APPROVED','2025-04-30 07:11:38.366028','hfnf',1,NULL,1),(3,'2025-05-06 15:41:03.676711',123,'xvbxvb','2025-05-08',NULL,'10',' SEMINAR CHUYÊN ĐỀ: PHÁT TRIỂN SẢN PHẨM PHẦN MỀM TRONG CÔNG TY FINTECH','fsgfsv','Trường đại học công nghiệp TP.HCM','xvbvb','xvbvb',NULL,NULL,'APPROVED','2025-05-06 15:40:53.502553','dvbdfbd',5,NULL,5),(5,NULL,2442,'vfvfs','2025-05-06',NULL,'10',' SEMINAR CHUYÊN ĐỀ: PHÁT TRIỂN SẢN PHẨM PHẦN MỀM TRONG CÔNG TY FINTECH','ssfvs','Trường đại học công nghiệp TP.HCM','sfvsfv','sfvv',NULL,NULL,'PENDING','2025-05-12 10:54:31.349454','vsdv',NULL,NULL,1);
/*!40000 ALTER TABLE `event_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `capacity` int NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `organizer` varchar(255) NOT NULL,
  `organizing_committee` text,
  `registrations` int DEFAULT NULL,
  `start_date` datetime(6) NOT NULL,
  `status` enum('APPROVED','CANCELLED','COMPLETED','PENDING') NOT NULL,
  `target_audience` text,
  `title` varchar(255) NOT NULL,
  `speaker` text,
  `transportation` text,
  `travel_plan` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (8,100,'3','Công DXC Việt Nam là một trong các công ty đa quốc gia chuyên tư vấn và cung cấp các giải pháp CNTT. Bên cạnh đó, DXC cũng là công ty có nhiều sinh viên khoa CNTT đến thực tập tại doanh nghiệp cũng như làm việc sau khi ra trường. \nBộ môn Kỹ thuật phần mềm hợp tác với công ty DXC Việt Nam tổ chức một buổi tham quan công ty. Đây là chương trình giúp cho các sinh viên đang học tập hoặc chuẩn bị ra trường có một góc nhìn thực tế về môi trường làm việc tại các doanh nghiệp đa quốc gia. \n\nHình Thức : Trực Tiếp \n','2025-08-27 14:00:00.000000','https://i.ibb.co/Jwz7rz5R/SK1-png.png',' Văn phòng công ty DXC Việt Nam - Tầng 14, Etown 5, 364 Cộng Hòa, Phường 13, Quận Tân Bình, Tp. Hồ Chí Minh','Trường đại học công nghiệp TP.HCM',NULL,2,'2025-08-27 11:30:00.000000','APPROVED','- Sinh viên năm 3, 4 thuộc tất cả các ngành ở khoa CNTT\n- Tất cả các giảng viên quan tâm.\n',' [Kiến tập]: DXC Vietnam Office Tour','Anh Lê Kim Hoàng','',''),(9,100,'6','Chuẩn bị đi phỏng vấn xin việc hoặc thực tập doanh nghiệp, bạn sẽ chuẩn bị hành trang gì mang theo để có thể ghi điểm với nhà tuyển dụng? Hỗ trợ các bạn trả lời câu hỏi này, Bộ môn Kỹ thuật phần mềm thân mời các bạn sinh viên và giáo viên khoa CNTT tham dự buổi hội thảo \"Chia sẻ Kỹ năng và Kiến thức cho lần đầu đi phỏng vấn\".\n\nHình Thức : Trực tiếp \n','2025-08-16 21:30:00.000000','https://i.ibb.co/kgvmSXtj/SK2-png.png','Hội trường A7','Trường đại học công nghiệp Tp.HCM',NULL,0,'2025-08-16 18:30:00.000000','APPROVED','Dành cho tất cả các sinh viên năm 2, 3, 4 của tất cả các ngành trong khoa CNTT và các giáo viên quan tâm.  ','Hội thảo: Chia sẻ Kỹ năng và Kiến thức cho lần đầu đi phỏng vấn',' HR Team','',''),(10,100,'5','Bạn là sinh viên thuộc nhóm chuyên ngành CNTT? Bạn quan tâm đến phát triển sản phẩm phần mềm trong lĩnh vực FinTech? Đừng bỏ lỡ cơ hội tham gia Seminar chuyên đề đầy hấp dẫn này!\nCung cấp góc nhìn thực tế về quy trình phát triển sản phẩm phần mềm trong công ty FinTech.\nCập nhật những công nghệ hiện đại như CI/CD, microservices và automation testing.\nNâng cao kỹ năng nghề nghiệp và tư duy làm việc trong môi trường FinTech.\n\nHình thức: Trực tiếp \n','2025-03-05 08:00:00.000000','https://i.ibb.co/hRqPtGVy/TT1-png.png','Offline tại phòng V7.05 ','Trường đại học công nghiệp TP.HCM',NULL,1,'2025-03-04 17:30:00.000000','APPROVED','Dành cho tất cả các sinh viên năm 1, 2, 3, 4 của tất cả các ngành trong khoa CNTT và các giáo viên quan tâm.',' SEMINAR CHUYÊN ĐỀ: PHÁT TRIỂN SẢN PHẨM PHẦN MỀM TRONG CÔNG TY FINTECH','Anh Phan Tri Thức - Engineering Manager - Công ty Aspire\nAnh Kiều Văn Truyền - QA Lead - Công ty Aspire\n','',''),(11,100,'3','Mô tả: Chào các bạn sinh viên,Nhằm chia sẻ thông tin đầy đủ về công nghệ AI \"phía sau\" ứng dụng ChatGPT và định hướng giúp sinh viên khai thác và sử dụng ChatGPT một cách hiệu quả trong học tập và chuẩn bị kỹ năng số cho nghề nghiệp tương lai, trường Đại học Công nghiệp Tp.HCM phối hợp công ty Xử lý thời gian thực RTA tổ chức buổi tọa đàm \"ChatGPT: Lợi ích và Thách thức đối với Giáo dục Đại học\"\n','2025-02-24 21:30:00.000000','https://i.ibb.co/hRqPtGVy/TT1-png.png',' Hội trường A7, 12 Nguyễn Văn Bảo, P.4, Q.Gò Vấp, Tp.HCM','Trường đại học công nghiệp TP HCM',NULL,0,'2025-04-17 02:23:00.000000','CANCELLED',' Các bạn sinh viên quan tâm Thông tin và Trải nghiệm ChatGPT','Hội thảo: ChatGPT - Lợi ích và Thách thức đối với Giáo dục Đại học','TS. Nguyễn Văn Minh – Giám đốc Công ty Xử lý Thời gian Thực RTA\n (Chuyên gia trong lĩnh vực trí tuệ nhân tạo và xử lý ngôn ngữ tự nhiên, với nhiều năm kinh nghiệm triển khai ứng dụng AI trong giáo dục và doanh nghiệp)','',''),(14,100,'6','frgefgrg','2025-05-08 14:49:00.000000','https://i.ibb.co/FLD79kXb/TT1-png.png','fgfsg','rưggr',NULL,0,'2025-05-08 12:49:00.000000','APPROVED','- Giảng viên quan tâm\n- Sinh viên các ngành CNTT','sdfdsfg','fdfwefwe','ẻwerwe','ửer'),(15,100,'5','WorldQuant là công ty tài chính định lượng với hơn 1000 nhân viên hoạt động trên toàn cầu. Công ty tập trung phát triển và khai thác Alphas thông qua các nền tảng nghiên cứu độc quyền và chiến lược phát triển toàn cầu. WorldQuant cũng từng hỗ trợ các team IUH tham gia các cuộc thi trước đây. Nhằm giới thiệu về lĩnh vực tài chính định lượng cũng như cơ hội việc làm, khoa CNTT phối hợp cùng WorldQuant tổ chức chương trình tham quan học tập kinh nghiệm tại trụ sở của công ty.\n','2025-10-30 14:47:00.000000','https://i.ibb.co/zWFbTGqN/TT1-png.png','Văn phòng WorldQuant HCM – Tòa nhà Saigon Centre Tháp 2, 92 Nam Kỳ Khởi Nghĩa, P. Bến Nghé, Quận 1, TP. HCM.','Trường đại học công nghiệp TP HCM',NULL,2,'2025-10-30 11:00:00.000000','APPROVED','Dành cho tất cả các sinh viên năm 1, 2, 3, 4 của tất cả các ngành trong khoa CNTT và các giáo viên quan tâm.\n','[THAM QUAN DOANH NGHIỆP] - WorldQuant BRAIN','Ông Nguyễn Minh Tuấn – Regional Director, WorldQuant Vietnam\n (Chia sẻ về xu hướng tài chính định lượng toàn cầu, cơ hội nghề nghiệp và kỹ năng cần thiết trong lĩnh vực này)\n\n\nBà Trần Thị Hồng Nhung – Senior Research Consultant, WorldQuant\n (Chia sẻ về kinh nghiệm thực tế tham gia phát triển Alphas, bí quyết thành công trong chương trình Research Consultant)\n','',''),(16,100,'1','ggrrr','2025-05-17 19:51:00.000000','https://i.ibb.co/8LCzDTMn/TT1-png.png','grrrrwrg','rgrgrg',NULL,0,'2025-05-17 17:51:00.000000','PENDING','- Giảng viên quan tâm\n- Sinh viên các ngành CNTT','gegegg','gge','rge','gfg'),(17,100,'5','sfsff','2025-05-17 12:53:00.000000','https://i.ibb.co/8LCzDTMn/TT1-png.png','sfs','sdfsg',NULL,0,'2025-05-17 10:53:00.000000','PENDING','- Giảng viên quan tâm\n- Sinh viên các ngành CNTT','ffffffffffffff','','','');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `author_name` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offices`
--

DROP TABLE IF EXISTS `offices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `office_head` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKedjms83xmpm0fdqiqya1a6qwt` (`name`),
  UNIQUE KEY `UKrxwjvxppcbrbepeocwcrw9ftu` (`contact_email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offices`
--

LOCK TABLES `offices` WRITE;
/*!40000 ALTER TABLE `offices` DISABLE KEYS */;
INSERT INTO `offices` VALUES (1,'nhansu@iuh.edu.vn','0909123456','Quản lý tuyển dụng, đào tạo và phúc lợi','Tầng 2, Tòa nhà A - Trường Đại Học Công Nghiệp Tp. Hồ Chí Minh','https://iuh.edu.vn/logo/nhansu.png','Phòng Nhân Sự','Phòng Nhân Sự','https://iuh.edu.vn/nhansu'),(2,'cntt@iuh.edu.vn','0933556677','Hỗ trợ kỹ thuật CNTT, quản trị hệ thống','Tầng 3, Tòa nhà B- Trường Đại Học Công Nghiệp Tp. Hồ Chí Minh','https://iuh.edu.vn/logo/cntt.png','Phòng Công Nghệ Thông Tin','Dương Quốc Khánh','https://iuh.edu.vn/cntt'),(3,'tt@iuh.edu.vntt@iuh.edu.vn','09345678900934567890v','Xây dựng thương hiệu, truyền thông nội bộ và đối ngoạiXây dựng thương hiệu, truyền thông nội bộ và đối ngoại','Tầng 1, Tòa nhà D- Trường Đại Học Công Nghiệp Tp. Hồ Chí Minh','https://iuh.edu.vn/logo10.png','Phòng Truyền Thông','Giang Tấn Phát','https://iuh.edu.vn/truyenthong'),(4,'daotao@iuh.edu.vn','0967890123','Quản lý chương trình đào tạo và công tác giảng dạy','Tầng 2, Tòa nhà E - Trường Đại Học Công Nghiệp Tp. Hồ Chí Minh','https://iuh.edu.vn/logo7.png','Phòng Đào Tạo','Lê Quốc Hùng','https://iuh.edu.vn/daotao'),(5,'ctsv@iuh.edu.vn','0978901234','Chăm sóc sinh viên, tổ chức sự kiện, tư vấn học đường và nghề nghiệp','Tầng 1, Tòa nhà F - Trường Đại Học Công Nghiệp Tp. Hồ Chí Minh','https://iuh.edu.vn/logo8.png','Phòng Công Tác Sinh Viên','Nguyễn Thị Kim Ngân','https://iuh.edu.vn/ctsv');
/*!40000 ALTER TABLE `offices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attended` bit(1) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `registration_date` datetime(6) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  `event_id` bigint NOT NULL,
  `check_in_time` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKbrdl17v3ui61wtddfg4iaoktr` (`event_id`,`user_id`),
  CONSTRAINT `FK8mi58jt1s8fxmi56jnau0cxqw` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (7,_binary '',NULL,'2025-05-08 19:42:34.081653','CONFIRMED','4',8,'2025-05-08 19:36:49.544363'),(8,_binary '\0',NULL,'2025-05-08 19:45:13.335637','CONFIRMED','40',8,NULL),(9,_binary '',NULL,'2025-05-08 19:50:58.967608','CONFIRMED','40',14,'2025-05-08 19:52:30.355278'),(10,_binary '\0',NULL,'2025-05-12 10:05:19.878235','CONFIRMED','4',10,NULL),(11,_binary '\0',NULL,'2025-05-12 10:07:27.237779','CONFIRMED','4',15,NULL),(12,_binary '\0',NULL,'2025-05-12 10:08:27.686486','CONFIRMED','40',15,NULL);
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sliders`
--

DROP TABLE IF EXISTS `sliders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sliders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `display_order` int NOT NULL,
  `image` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `status` bit(1) NOT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sliders`
--

LOCK TABLES `sliders` WRITE;
/*!40000 ALTER TABLE `sliders` DISABLE KEYS */;
/*!40000 ALTER TABLE `sliders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','ORGANIZER','STAFF','USER') NOT NULL,
  `username` varchar(255) NOT NULL,
  `department_id` bigint DEFAULT NULL,
  `office_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  KEY `FKsbg59w8q63i0oo53rlgvlcnjq` (`department_id`),
  KEY `FKikayxh0uod2b6heppb3qs7t4` (`office_id`),
  CONSTRAINT `FKikayxh0uod2b6heppb3qs7t4` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`),
  CONSTRAINT `FKsbg59w8q63i0oo53rlgvlcnjq` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@gmail.com','https://randomuser.me/api/portraits/women/2.jpg','$2a$10$0A3G5kX75.8DONfA3N2Cx.exrBHL4KLlvjSB8zrRfO5aWFIfWUj9K','03371639893','ADMIN','admin',NULL,NULL),(3,'mongthodang07032002@gmail.com','https://i.ibb.co/hRqPtGVy/TT1-png.png','$2a$10$vG4huO3xSfcnM/AjnP59D.zxGOtkiffcRL/ZZxEVa.6TV6ig8DcJS','0777551500','STAFF','Đặng Thị Mộng Thơ',1,2),(4,'thanhphan.010102@gmail.com','https://i.ibb.co/hRqPtGVy/TT1-png.png','$2a$10$NYXYqET0GgsKHXc6IbQR0e8sGba1DbB7f7pl9xuyj/J4Wf4uLNdFq','0777551600','USER','Phan Nhật Thành',1,NULL),(5,'tuongvi15022002@gmail.com','https://i.ibb.co/hRqPtGVy/TT1-png.png','$2a$10$zDSvlIx4PxISQkkQZ8xvoeobkZVObgvVLYUrmBpsRuOZwYSzttTrS','0936547823','MANAGER','Nguyễn Văn An',1,2),(6,'vylinh960@gmail.com','https://i.ibb.co/hRqPtGVy/TT1-png.png','$2a$10$umDtyP3XmpFdQDeG2Ya/L.GC0D1zM0gNL51UTmPmPRDOoAZIUS1gO','0777551609','ORGANIZER','Trương Thị Tường Vi',1,2),(9,'mongtho07032002@gmail.com',NULL,'$2a$10$RoXZjnelLNbgAT2xoh50Xe9XmnVWE01Ux3qrX3WTlku3S9JfC/.Mu','0777551500','USER','Mtho',NULL,NULL),(40,'uongvi15022002@gmail.com','https://i.ibb.co/hRqPtGVy/TT1-png.png','$2a$10$wNUI2/JmZhV69bzLPTLileEKt7Hd9oVc6CEw2N4E7It4ZVEz6ofEy','0777551522','USER','Tường Vi',1,NULL),(42,'tranquynhpt2@gmail.com','https://i.ibb.co/8LCzDTMn/TT1-png.png','$2a$10$uvR/WdWJ014V.NAmXxg51u4jvB4HNb88GgNl/97wy9wZFvpyKvlz.','0777551577','ADMIN','Trần Diễm Quỳnh',NULL,NULL),(43,'hiepgachichi46@gmail.com','https://i.ibb.co/8LCzDTMn/TT1-png.png','$2a$10$suJ4xnVyupt5C324wYE40Os1EsbshB6aEC8hEhwlr4T8/Lq54nI8K','07775515788','MANAGER','Phan Hiệp',1,2);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-18  2:55:56
