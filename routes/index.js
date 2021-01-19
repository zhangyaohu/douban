var express = require('express');
var router = express.Router();
var http = require('https'); //使用https模块
var fs = require('fs');//文件读写
var cheerio = require('cheerio');//jquery写法获取所得页面dom元素
var request = require('request');//发送request请求
var { queryArgs, query }  = require('../mysql/index');
var url = "https://movie.douban.com/j/search_subjects";
//初始url 
function fetchPage(x, cb) { //封装一层函数,方便递归调用
    return startRequest(x, cb);
}

function startRequest(x, cb) {
    //采用http模块向服务器发起一次get请求      
    http.get(x, function(res) { //get到x网址，成功执行回调函数
        var html = ''; //用来存储请求网页的整个html内容
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function(chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function() {
          cb(html);
        });

    }).on('error', function(err) { //http模块的on data,on end ,on error事件
        console.log(err);
    });

}
//存储标题函数
function savedContent($, news_title) {
    $('#link-report span').each(function(index, item) {
        var x = $(this).text();
        x = x + '\n';
        //将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
        fs.access('./data/' + news_title + '.txt', function(err) {
          if(err) {
            fs.writeFile('./data/' + news_title + '.txt', function(err){
              if(err) {
                console.log('创建失败!');
              }
            })
          }
        })
        fs.appendFile('./data/' + news_title + '.txt', x, 'utf-8', function(err) {
            if(err) {
                console.log(err);
            }
        });
    })
}
//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($, news_title) {
    $('#mainpic img').each(function(index, item) {
        var img_title = $('#content h1 span').text().trim(); //获取图片的标题
        if(img_title.length > 35 || img_title == "") { //图片标题太长
            img_title = "Null";
        }
        var img_filename = img_title + '.jpg';
        var img_src = $(this).attr('src'); //获取图片的url

        //采用request模块，向服务器发起一次请求，获取图片资源
        request.head(img_src, function(err, res, body) {
            if(err) {
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/' + img_filename));
        //通过流的方式，把图片写到本地/image目录下，并用标题和图片的标题作为图片的名称。
    })
}
async function insertTags(req, res, next) {
 await fetchPage('https://movie.douban.com/j/search_tags?type=tv&source=index', async (html) => {
  let values =  JSON.parse(html).tags.map(item => {
    return  [item];
  });
  let sql = `insert into movie_tags(tag) values ?`;
    await queryArgs(sql, [values], (err, rows) => {
      if(!err) {
        console.log(err);
      }
    })
  });
    let sql1 = `select * from movie_tags`;
    console.log(sql1);
    let resp = await query(sql1, (err, rows) => {
      console.log(rows);
       return rows;
    })
    if(resp) {
      console.log('======' + resp);
      resp.forEach( element => {
       return insertMovieTv(element.tag);
      });
    }
}

async function insertMovieTv(element) {
  console.log(`=========${url}?type=tv&tag=${element}&page_start=0&pagelimit=500`);
  return await fetchPage(`${url}?type=tv&tag=${element}&page_start=0&pagelimit=500`, (html) => {
    let values =  JSON.parse(html).subjects.map(item => {
      item['tag'] = element;
      return Object.keys(item).map( key => item[key])
    });
    let sql = `insert into movie_tv(rate, cover_x, title, url, playable, cover, id, cover_y, is_new, tag) values ?`;
    queryArgs(sql, [values], (err, rows) => {
      console.log(rows);
      if(!err) {
        return 0;
      }else {
        return 1;
      }
    })
  });
}
/* GET home page. */
router.get('/hot/tv', async function(req, res, next) {
  let result = insertTags(req, res, next);
  return res.send({
    code: '200',
    msg: result === 0 ? '插入失败' : '插入成功!'
  });
});

module.exports = router;
