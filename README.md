# douban
1、node + express 爬取豆瓣电影热门电影，热门电视剧，影评
2、爬取豆瓣电影影评
3、将爬取到的数据保持到mysql数据库中
4、利用node-crontab库实现定时采集数据

运行
npm install 下载所需的依赖库
在package.json文件所在的目录下运行 npm run start即可启动并运行项目
注意
在/mysql/config/index.js中修改mysql的用户名跟密码
