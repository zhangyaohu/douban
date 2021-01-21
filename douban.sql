/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`douban` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_bin */;

USE `douban`;

/*Table structure for table `alert` */

CREATE TABLE IF NOT EXISTS `movie_tv` (
  `id` varchar(10) NOT NULL,
  `rate` varchar(32) DEFAULT NULL,
  `cover_x` int(10) DEFAULT NULL,
  `title` varchar(512) DEFAULT NULL,
  `url` varchar(512) DEFAULT NULL,
  `playable` varchar(12) DEFAULT NULL,
  `cover` varchar(512) DEFAULT NULL,
  `cover_y` int(10) DEFAULT NULL,
  `is_new` boolean DEFAULT NULL,
  `tag` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`tag`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `movie_tags` (
  `tag` varchar(10) NOT NULL,
  PRIMARY KEY (`tag`),
  KEY  (`tag`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `movie_tv_tags` (
  `tag` varchar(10) NOT NULL,
  PRIMARY KEY (`tag`),
  KEY  (`tag`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/**
cover: "https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2626308994.jpg"
cover_x: 6611
cover_y: 9435
id: "24733428"
is_new: false
playable: false
rate: "8.9"
title: "心灵奇旅"
url: "https://movie.douban.com/subject/24733428/"
*/
CREATE TABLE IF NOT EXISTS `movie` (
  `id` varchar(10) NOT NULL,
  `rate` varchar(32) DEFAULT NULL,
  `cover_x` int(10) DEFAULT NULL,
  `title` varchar(512) DEFAULT NULL,
  `url` varchar(512) DEFAULT NULL,
  `playable` varchar(12) DEFAULT NULL,
  `cover` varchar(512) DEFAULT NULL,
  `cover_y` int(10) DEFAULT NULL,
  `is_new` boolean DEFAULT NULL,
  `tag` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`tag`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `hoting_movie` (
  `id` varchar(10) NOT NULL, 
  `score` varchar(10) DEFAULT NULL, 
  `star` varchar(10) DEFAULT NULL, 
  `showtime` varchar(32) DEFAULT NULL, 
  `duration` varchar(32) DEFAULT NULL, 
  `region` varchar(32) NOT NULL, 
  `director` varchar(32) DEFAULT NULL, 
  `actors` varchar(255) DEFAULT NULL, 
  `category` varchar(32) DEFAULT NULL, 
  `votecount` varchar(32) DEFAULT NULL, 
  `subject` varchar(32) DEFAULT NULL, 
  `cover` varchar(255) DEFAULT null,
  `title` varchar(32) DEFAULT null,
  PRIMARY KEY (`id`),
  KEY `id` (`id`)
)ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

CREATE TABLE IF  NOT EXISTS `review`(
  `id` varchar(32) NOT  NULL,
  `avator` varchar(255) DEFAULT NULL,
  `name` varchar(32) DEFAULT NULL,
  `rate` float DEFAULT NULL,
  `meta` datetime DEFAULT NULL,
  `review_title`  blob DEFAULT NULL,
  `content`  blob DEFAULT NULL,
  `review-content` blob DEFAULT NULL,
  `useful_count`  int(10) DEFAULT null,
  `useless_count` int(10) DEFAULT NULL,
  `reported` varchar(32) DEFAULT NULL,
  `up` int(10) DEFAULT NULL,
  `down` int(10) DEFAULT NULL,
  `replay` int(10) DEFAULT NULL,
   PRIMARY KEY (`id`),
  KEY `id` (`id`)
)ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;