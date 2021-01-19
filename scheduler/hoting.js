var express = require('express');
var router = express.Router();
var http = require('https'); //使用https模块
var fs = require('fs');//文件读写
var cheerio = require('cheerio');//jquery写法获取所得页面dom元素
var request = require('request');//发送request请求
var { queryArgs, query } = require('../mysql/index');
var utils = require('../utils/utils');
const superagent = require("superagent");
var url = "https://movie.douban.com/cinema/nowplaying/hangzhou/";

class Main {
	constructor() {
		this.init();
		this.intervalId = null;
	}
	async init() {
		this.fetchPage(url, (html) => {
			var $ = cheerio.load(html);
			$('#nowplaying ul>li').each((index, item) => {
				for(let data in item.attribs) {
				 let cover = $(item).find('.ticket-btn>img').attr('src')
				 let sql = `insert into hoting_movie(id, score, star, release, duration, region, director, actors, category, votecount, subject, cover) values ?`;
				 query(sql, [data['id'], data['data-score'], data['data-star'],data['data-release'],data['data-region'],data['data-director'], data['data-actors'], data['data-category'], data['data-votecount'], data['data-subject'], cover],
				 (err, rows) => {
					 if(err) {
						 console.log(err);
					 }
				 })
				 console.log(sql);
				}
			})
		})
	}
	//初始url 
	fetchPage(x, cb) { //封装一层函数,方便递归调用
		return this.startRequest(x, cb);
	}
  sleep(fn, options, time) {
		let ctx = this;
    setTimeout(() => {
			fn.call(ctx, options);
		}, time)
	}
	startRequest(x, cb) {
		//采用http模块向服务器发起一次get请求
		let cookie = '', _this = this;
			let clientHttp = (header) => {
				superagent.get(x)
				.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36')
				.set('Cookie', cookie)
				.end((error, res) => {
          var html = res.text; //用来存储请求网页的整个html内容
					res.setEncoding('utf-8'); //防止中文乱码
					console.log('----------')
					if(res.statusCode === 403) {
						cookie = res.header['set-cookie'][0];
						_this.sleep(clientHttp, cookie,  60 * 1000)
					}
					cb(html);
				});
			}
			clientHttp();
	}
	//存储标题函数
	savedContent($, news_title) {
		$('#link-report span').each(function (index, item) {
			var x = $(this).text();
			x = x + '\n';
			//将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
			fs.access('./data/' + news_title + '.txt', function (err) {
				if (err) {
					fs.writeFile('./data/' + news_title + '.txt', function (err) {
						if (err) {
							console.log('创建失败!');
						}
					})
				}
			})
			fs.appendFile('./data/' + news_title + '.txt', x, 'utf-8', function (err) {
				if (err) {
					console.log(err);
				}
			});
		})
	}
	//该函数的作用：在本地存储所爬取到的图片资源
	savedImg($, news_title) {
		$('#mainpic img').each(function (index, item) {
			var img_title = $('#content h1 span').text().trim(); //获取图片的标题
			if (img_title.length > 35 || img_title == "") { //图片标题太长
				img_title = "Null";
			}
			var img_filename = img_title + '.jpg';
			var img_src = $(this).attr('src'); //获取图片的url

			//采用request模块，向服务器发起一次请求，获取图片资源
			request.head(img_src, function (err, res, body) {
				if (err) {
					console.log(err);
				}
			});
			request(img_src).pipe(fs.createWriteStream('./image/' + img_filename));
			//通过流的方式，把图片写到本地/image目录下，并用标题和图片的标题作为图片的名称。
		})
	}
	/**
	 * 每隔十秒采集一次
	 * **/
	async interVal(fn, args) {
		let number = 1,
			ctx = this,
			pageSize = 50;
		this.intervalId = setInterval(() => {
			fn.call(ctx, args, (number - 1) * pageSize, pageSize);
			while ((number - 1) * pageSize >= 500) {
				if (this.intervalId) {
					clearInterval(this.intervalId);
				}
			}
			number++;
		}, 10000)
	}
}

module.exports = new Main();
