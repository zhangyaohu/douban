var express = require('express');
var router = express.Router();
var http = require('https'); //使用https模块
var fs = require('fs');//文件读写
var cheerio = require('cheerio');//jquery写法获取所得页面dom元素
var request = require('request');//发送request请求
var { queryArgs, query } = require('../mysql/index');
var utils = require('../utils/utils');
var url = "https://movie.douban.com/j/search_subjects";

class Main {
	constructor() {
		this.insertTags();
		this.intervalId = null;
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
		let options = {
			followRedirect: false, 
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
			}
		}, _this = this;
			;
			let clientHttp = (header) => {
				http.get(x, header, function (res) { //get到x网址，成功执行回调函数
					var html = ''; //用来存储请求网页的整个html内容
					res.setEncoding('utf-8'); //防止中文乱码
					if(res.statusCode === 302) {
						options.headers['location']= x;
						_this.sleep(clientHttp, options, 5 * 60 * 1000)
					}
					//监听data事件，每次取一块数据
					res.on('data', function (chunk) {
						html += chunk;
					});
					//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
					res.on('end', function () {
						cb(html);
					});
		
				}).on('error', function (err) { //http模块的on data,on end ,on error事件
					console.log(err);
				});
			}
			clientHttp(options);
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
	async insertTags() {
		let sql = `delete from movie_tags`;
		await query(sql, (err, rows) => {
			if (!err) {
				console.log(err);
			}
		})
		await this.fetchPage('https://movie.douban.com/j/search_tags?type=tv&source=index', async (html) => {
			console.log('html ====' + html);
			let values = JSON.parse(html).tags.map(item => {
				return [item];
			});
			let sql = `insert into movie_tv_tags(tag) values ?`;
			await queryArgs(sql, [values], (err, rows) => {
				if (!err) {
					console.log(err);
				} else { }
				this.queryTag();
			})
		});
	}
	/**
	 * 查询标签，根据标签爬取tv
	 * **/
	async queryTag() {
		let sql = `select * from movie_tv_tags`;
		let resp = await query(sql, (err, rows) => {
			return rows;
		})
		if (resp) {
			resp.forEach(async element => {
				await this.interVal(this.insertMovieTv, element.tag);
			});
		}
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
		}, 5 * 60 * 1000)
	}
	/**
	 * 插入热门tv
	 * **/
	async insertMovieTv(element, start, limit) {
		return await this.fetchPage(`${url}?type=tv&tag=${element}&page_start=${start}&page_limit=${limit}`, async (html) => {
			let values = JSON.parse(html).subjects, args = [];
			for(let i = 0; i< values.length ; i++) {
					let sql = `select count(*) as total, tag from movie_tv where id='${values[i].id}'`;
				 query(sql, (err, rows) => {
						if (rows && utils.isEmpty(rows[0].total)) {
							values[i]['tag'] = element;
							args.push(Object.keys(values[i]).map(key => values[i][key]))
						} else {
							let tag = rows[0]['tag'];
							if(tag.indexOf(element) < 0) {
								tag += ',' + element;
								let sql = `update movie_tv set tag='${tag}' where id='${values[i].id}'`;
								query(sql, (err, rows) => {
									if (!err) {
										console.log('更新成功!');
									}
								})
							}
						}
					})
			}
			console.log(args);
			let sql = `insert into movie_tv(rate, cover_x, title, url, playable, cover, id, cover_y, is_new, tag) values ?`;
			await queryArgs(sql, [args], (err, rows) => {
				console.log(rows);
				if (!err) {
					return 0;
				} else {
					return 1;
				}
			})
		});
	}
}

module.exports = new Main();
