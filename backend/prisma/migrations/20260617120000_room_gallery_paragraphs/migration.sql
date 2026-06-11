-- Gallery tối đa 5 ảnh + đoạn mô tả bổ sung cho từng phòng vật lý
ALTER TABLE `rooms`
  ADD COLUMN `gallery_images` JSON NULL AFTER `image_url`,
  ADD COLUMN `extra_paragraphs` JSON NULL AFTER `description`;
