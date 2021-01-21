var express = require('express');
var router = express.Router();
var http = require('https'); //使用https模块
var fs = require('fs');//文件读写
var cheerio = require('cheerio');//jquery写法获取所得页面dom元素
var request = require('request');//发送request请求
var { queryArgs, query } = require('../mysql/index');
var utils = require('../utils/utils');
const superagent = require("superagent");
var url = "https://movie.douban.com/review/best/";

class Main {
	constructor() {
		this.interVal(this.init,0)
		this.intervalId = null;
	}
	async init() {
		this.fetchPage(url, (html) => {
			var $ = cheerio.load(html);
			$('#nowplaying ul>.list-item').each((index, item) => {
				 let cover = $(item).find('.ticket-btn>img').attr('src');
				 let sql = `insert into hoting_movie(id, score, star, showtime, duration, region, director, actors, category, votecount, subject, cover, title) values (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
				 queryArgs(sql, [item.attribs['id'], item.attribs['data-score'], item.attribs['data-star'],item.attribs['data-release'],item.attribs['data-duration'], item.attribs['data-region'],item.attribs['data-director'], item.attribs['data-actors'], item.attribs['data-category'], item.attribs['data-votecount'], item.attribs['data-subject'], cover, item.attribs['data-title']],
				 (err, rows) => {
					 if(err) {
						 console.log(err);
					 }
					 if(rows) {
					 }
				 })
				 console.log(sql);
			})
			$('#upcoming ul>.list-item').each((index, item) => {
				let cover = $(item).find('.ticket-btn>img').attr('src');
				let sql = `insert into hoting_movie(id, score, star, showtime, duration, region, director, actors, category, votecount, subject, cover, title) values (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
				queryArgs(sql, [item.attribs['id'], item.attribs['data-score'], item.attribs['data-star'],new Date().getFullYear(),item.attribs['data-duration'], item.attribs['data-region'],item.attribs['data-director'], item.attribs['data-actors'], item.attribs['data-category'], item.attribs['data-votecount'], item.attribs['data-subject'], cover, item.attribs['data-title']],
				(err, rows) => {
					if(err) {
						console.log(err);
					}
					if(rows) {
					}
				})
				console.log(sql);
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
