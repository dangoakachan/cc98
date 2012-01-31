// ==UserScript==
// @id             reply_improved
// @name           Reply Improved
// @version        0.6
// @namespace      http://www.cc98.org
// @author         tuantuan <dangoakachan@foxmail.com>
// @include        http://localhost/cc98/*
// @include        http://www.cc98.org/dispbbs.asp*
// @include        http://10.10.98.98/dispbbs.asp*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @run-at         document-end
// ==/UserScript==

(function() {

/* 用户设置开始 */

var ShowTitle = false;            // 回复框是否显示标题
var ReplyTransp = 1;              // 回复框透明度
var BackgroundColor = '#F4F9FB';  // 回复框背景色
var ReplyPopupWidth = '56%';      // 回复框宽度
var TextInputHeight = '250px';    // 文本框高度
var AnimateSpeed = 500;           // 动画速度
var OpenInNewtab = false;         // 链接是否在新标签页打开
var PromptColor = "green";        // 查看原帖提示颜色
var PromptString = "|查看原帖|";  // 查看提示文字
var RemoveMultiQuote = true;      // 删除多重引用的内容(仅保留最后一重)
var AutoSaveInterval = 30000;     // 自动保存数据间隔(毫秒)
var KeepTime = 3000;              // 状态显示保持时间
var ErrorStatusColor = 'red';     // 错误状态颜色
var NormStatusColor = 'black';    // 正常状态颜色
var UserStatusBoxStyle = {        // 状态框自定义样式
    opacity: 0.6,                 // 状态框透明度
    padding: '2px 4px',           // 状态框内边距
    borderRadius: '4px',          // 状态框圆角
    backgroundColor: '#e4e8ef',   // 状态框背景色
    border: '1px solid #cccccc'   // 状态框边框
};

/* 用户设置结束 */

/* 文本区别的最大输入长度 */
var MaxTextareaLength = 16240;

/* 全局定时器 */
var StatusKeepTimer = -1;
var AutoSaveTimer = -1;

/* 图片按钮地址 (普通地址或者Base64编码)*/
var ImageURLs = {
    /* 快速回复按钮Base64编码 */
    reply: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNC8xMS8wOGGVBZQAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzQGstOgAAACSUlEQVQ4jdWPv08TYRjHP3e9X71eLR4ltZgAElIwRk3o4OLE4MBgnF0cTEyd+Bd0YPIvcHYxDgwurjiQwFAlRAZjQZpKoBQptNcf1/d6r4sktNakJC4+yZO8yZvv5/l8FS43+tOXdzLpaft1s9m81/GFZph64MRja3bMfFLaOywqfYEEMAWMDIAZmXn35sPcxCtVU4yJqXHiVxwaXpPdbyWA1ljq6lw/8K7v+5v9JCEER0dHvPm4hBeWuD0/A0DKuUXZ2yYMQ7Y3d7Gi5qralx1RFIWzs7OeLZfL7OzscNoukhp36QifUSvDg5kXjFoZgq4gNT6CV2ve7wcCoKpqzwZBQKvVotPpYMUUxuxZFueWAVicW2bMnkW3VIQQ2kCgoig9CxCGIbqhUat57J1ssLK1BMDK1hJ7JxvUax4RTQ20QTBV7b0TiUTQNI0rxnWOD0roVozvx+u8+/ycUvUTUkoqBx6arq4PZWiaJo7jMG09QnY19gse9apP4XCDetXnR8FDhvilr41nfxieAy9ONBollUrRbreRMkcxeM9ppUQQdFFVJQxDufllrZpbfVsuDFXZNE2SySSKomDbNtcaN+h2u9i2zcLCQg74ABxLKcVQhhctE4kEvu8jpcSyLIB9oCylFABDAwEMw8AwjB5zoAGI88xQlf82gw5fynCY+Q8N/wkwm82OAvFisZi4bOVkMpmYnJycAur5fP7nuWEHwHXdSjqdfiyEcIYB6rruua5bucgY2C2bzcZ/PyNAtO+7BXQB8vl8vT/7C2ss4WrplFZOAAAAAElFTkSuQmCC',
    /* 快速引用按钮Base64编码 */
    quote: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARFJREFUeNqkU03OREAQbXwRseAYnMy3sJO4BJYsuJQlFm4h/unp10kLZiY6mUqeblX9XlWXolBKyS/2JzZZluVs8SAoRM+rgK7rhe/7/4cCnGma0rquqYzhHM4fidhLLksWVlUVRHIIqOzhOY4jdV8QhmEgruuSrus8+FTZJq7rSvq+5wIfm3jPtG3bhTzPM8eyLFeBewX7vpNpmjhJiGEPInD2v1WA4DiOh4DoNPYAqjIM44jxHmiaVjRNw4m4I8AadAF8iJumSWzbJm3bEsuyisc5KMvycQ4UUQomkZXuiesEQcDXOI55XwQBmd8m8Y4kSXi2KIrop/gZ6rfPiMxhGCpP8/FVQIYMU379nV8CDADQEaUK/jLo9wAAAABJRU5ErkJggg%3D%3D',
    /* 群发信息 */
    send: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAQwAAAEMBuP1yoAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAIdEVYdFRpdGxlAGF02E9UTwAAABN0RVh0QXV0aG9yAEJlYXRlIEthc3Bhcg7DR0QAAAB1dEVYdERlc2NyaXB0aW9uAGRlcml2ZWQgZnJvbSA8aHR0cDovL3dlYmN2cy5mcmVlZGVza3RvcC5vcmcvdGFuZ28vdGFuZ28taWNvbi10aGVtZS9zY2FsYWJsZS9hY3Rpb25zL2FkZHJlc3MtYm9vay1uZXcuc3ZnPvXu/YcAAAAbdEVYdENyZWF0aW9uIFRpbWUATm92ZW1iZXIgMjAwOF2vEzAAAABSdEVYdENvcHlyaWdodABDQyBBdHRyaWJ1dGlvbi1TaGFyZUFsaWtlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzMuMC9eg1q8AAADLUlEQVQ4jXWTbUxTZxTH/8/tvbeltVxaBtcyKxaBouILY+qWDDU6lxkhGogvbDIxWYwuc4tplizEYPZlyZJtMW6CugG+hU0TzSL74Iz7shiMYiFCGFqWQUlRbMXactvbe+/TPvsymunkSc635/zyyzn/QxhjmOtVNrZLHM9XgrG+wQv79Zf9IS8Cluz8vtBb4vraLIqr9TRbKPDELPCmqK7TAMeR3y9+Udc6J2D7ZxcPuOY7j6gafRiJKpceReK30ul0SC7I27SgUKrJtYo7Eqp+bWA0vPvuj00UAPjZ5rc/Pr+1vLTom3g8eflCa90HL5h2AujcdbSnp8ztbK/muEsA6rMG3oZj+fXvVPVPTSu3u1q27lze2GYrL3d/KeXaXucInkYi8Z/c83M/9I9MHfEU5a3wLnR8+9ud8eretsYRDgDeWOnxGZTNu3nnfhMArKkqO1exuKhJ5E1BsyCgotR13OmU1nEcMd0fj5wyaGbG63Y2AAAHAHZbzmsGpf7RX3zaqj3tskt2bBgLTrWe/HT9eycO1dRpBr2h6mmTYdDx/s69TFGNWKEjx5UFWC1CaSql3waA6uWeZkJABobGOmYHkExoARNHkoZBw28e7PbITlvxg4moPwtQknrSYhYkAJiYnB7OsYiSJNkrZwFWq2W1blBl4Mw+bVWZ7JtJGtHJJ8rl/2yBTTPG3AAQDIWvx2KJx2urSr7bcfTqlcICx7KCPFtNXFFnDrf9cW2BLL0VCEZ8faffj2UNUrreZ7dZN67Z98PSwJXD+tCDUGtCNWyv5Ds+0XTqHhmd/JUAKUoznH9ksvZsy5ZTzwWppPYrbtvm6nuqnlZ6B/7eNth9MAwAy3a3keGfP2Ir9pwWCMcxnhfm+Tv3PntpEmt93esXvVrQkTIy/KNw7ETo8bPrlNJhs8VcXiTn1cn59mZkMg87Pn9305xR9jYcy61aWtwuiMIGEJOcUPWoKPIO3kSeUIP2BCaetvR3NUf+ByCE5AAoA7AEgAcgxSbRWiGIZpeuJRMZQwsBLAQgCGAMwJ8A/mKMac8ZEEJEAPZ/ywbACoABUAEoAGYAKIyx7Gn/A9zvY9t9CpUgAAAAAElFTkSuQmCC',
    /* 关闭按钮Base64编码 */
    close: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABJQTFRFAAAA////AAAAAAAAAAAAAAAA/h6U3wAAAAV0Uk5TAAAQn88jT+w1AAAAiUlEQVQoz32RwQ3AIAwDIyaAzsAAXYIJEPuv0sQxn1gqn1rXCwRioyzr1uwuTwHme4EnB23tK3hyMM+hEmnYs87ZFDwlSMWFAB1fClHSG5X8gWORyNEYIisDpMJCACjcGgAKD0+QCtpLkMr7A6SkbirH1sak9Xo5uX59IHlCeWQZgw6qjlKmX8EHWERHvlmYfrYAAAAASUVORK5CYII%3D',
    /* 文件上传按钮Base64编码 */
    upload: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUUlEQVQ4jY2Sz0tUURTHP/fe5+iY5ZvU/IWNmqVFyfQnWBtpU9CmNmEL97ayhSBY2yhauGoVbiOCNBDqQdDuQdI6yMnSnObND3+M87zv3ddinMFBiw5cOAfO93N+XcFfLP1q1CbwHYRcRTXcT97+UjguTxwrXhqzMfuOlKQAjGEFGRtL3nCOQI4A0u9v2pjAkUqmzgx1A5D5uoEJzQrSGktef1MHkXXi5XEbox0g1dqVINbUgNVg0dqVAEhhtJNeHrcPa6y68oHvICpt59MlTja3o0uafLpYzUgR4QBXj4zguu5TYAoAP0OHN8fZwRjlckRmXfPZPMT3/ep7Njk5+aAGcF23Xyn17fy5Syil2N9eI/fpLj29jfi+wctqEtc+oHVAqbTL28XX7OxsD0xPT69WdzDbdroDpRSWJVBKoMuKQkax7Sl0WRFrtIjHY1hWjL6+fkql0iyAcF3XVkrlq9XXN37R1uLzc3Gi/jq9T4g3SS4MDbC1vcXCwguKxWLCAqZaTpxCKQVAT3cXAIN3HKIoIooijDH0GoPWAfv7mlhDjM7OHrLZ7JRwXTcfhJEthUAIUdnKgcgYQxiGhCbEhAd+LQ7J5/MFS2ttX74yihACATXIsV8U2NSbaKVJxpPMP5+3rVwuB8DSu49IJVFSVmDiAHbo2hdHkjz+MQft8Hj4EZ7nYXmeB0Dmd46R4SRKSaSUSFnpiAMYwN7eHjvlXdZ2vhOakFwuVwE0x5uYuHfrv0ZYGHpZcQxorREzMzP5IAjsIAgIgqC2KGNM7Qr/sMIfkR8a8weYdtgAAAAASUVORK5CYII%3D',
    /* 心情按钮 */
    expression: 'face/face7.gif',
    /* 表情按钮 */
    emotion: 'emot/simpleemot/emot88.gif',
    /* 不存在 */
    nonexist: ''
}

/* 返回相对地址 */
function getRelativeURL(url)
{
    return url.replace(/http:\/\/www\.cc98\.org\/([a-z])/g, '$1');
}

/* 返回原帖地址 */
function getOrigURL(url)
{
    return getRelativeURL(url .replace(/reannounce/, "dispbbs")
        .replace(/reply.*?&/g, "").replace(/&bm=/, "#"));
}

/* 返回版块ID */
function getBoardID()
{
    var boardID = location.search.match(/boardid=(\d+)/i);
    return boardID ? boardID[1] : '39';
}

/* 返回帖子ID */
function getTopicID()
{
    var topicID = location.search.match(/&id=(\d+)/i);
    return topicID ? topicID[1] : '0';
}

/* 函数类扩展：周期执行某个函数 (参考 Moontools)*/
Function.prototype.periodical = function(periodical, bind, args) {
    var self = this;

    return setInterval(function() {
        self.apply(bind, args || []);
    }, periodical);
}

/* Storage操作函数 */
function setValue(key, val) { window.sessionStorage.setItem(key, val); }
function getValue(key, def) { return window.sessionStorage.getItem(key, def); }
function delValue(key) { window.sessionStorage.removeItem(key); }

/* 添加自定义的样式 */
function addCustomizedCSS()
{
    /* 添加到Head节点 */
    $('<style type="text/css"></style>').appendTo('head').html('\
        .reply_button img, #reply_type img, .panel img {\
            width: 15px;\
            height: 15px;\
            border: none;\
            cursor: pointer;\
            vertical-align: middle;\
        }\
        .btn_reply { margin-left: 5px; }\
        .btn_quote, .btn_send { margin-left: 8px; }\
        #reply_container {\
            display: none;\
            position: fixed;\
            font-size: 1em;\
            border-radius: 5px;\
            border: 5px solid transparent;\
            box-shadow: 0 0 18px rgba(0, 0, 0, 0.4);\
            font-family: Verdana, Arial, Helvetica, sans-serif;\
        }\
        #reply_header_container { margin: 0 5px; }\
        #reply_titlebar {\
            position: relative;\
            margin-top: 5px;\
            display: none;\
        }\
        #reply_title {\
            font-weight: bold;\
            font-size: 1.1em;\
        }\
        .btn_close {\
            position: absolute;\
            right: 0px;\
            top: 0px;\
        }\
        .btn_close img { opacity: 0.3; }\
        #reply_subjectbar {\
            height: 27px;\
            margin: 5px 0 10px;\
            position: relative;\
        }\
        #reply_subject {\
            width: 100%;\
            height: 27px;\
            padding: 4px;\
            background-color: #fefefe;\
            border: 1px solid #ccc;\
        }\
        #reply_type {\
            left: 0px;\
            top: 0px;\
            padding: 5px;\
            position: absolute;\
            background-color: #eee;\
            border: 1px solid #ccc;\
        }\
        #reply_panel_button {\
            top: 0px;\
            right: 0px;\
            padding: 5px;\
            position: absolute;\
        }\
        #reply_panel_button .reply_button { margin: 0 3px; }\
        #reply_panel_container { margin: 0 5px; }\
        .panel img { margin-right: 5px; }\
        .panel .label { margin-right: 5px; float: left; }\
        #reply_content_container {\
            position: relative;\
            margin: 10px 5px 5px;\
        }\
        #reply_content {\
            width: 100%;\
            padding: 0.4em;\
            line-height: 1.2em;\
            border: 1px solid #ccc;\
            background-color: #fefefe;\
        }\
        #reply_footer_container { \
            margin: 5px 5px 0px;\
            text-align: right;\
            display: none;\
            height: 25px;\
        }\
        .reply_action {\
            cursor: pointer;\
            font-size: 1em;\
            font-weight: bold;\
            border-radius: 5px;\
            margin-left: 10px;\
            padding: 2px 12px;\
            border: 1px solid #c4c4c4;\
            font-family: Verdana,Arial,Helvetica,sans-serif;\
        }\
        .reply_action:hover {\
            border-radius: 3px;\
            border: 1px solid #c8c8c8;\
            box-shadow: 0 0 3px rgba(120, 80, 100, 0.4);\
        }\
        .asv_action {\
            float: left;\
            cursor: pointer;\
            font-size: 0.9em;\
            padding: 2px 8px;\
        }\
        #btn_save {\
            border-right: 1px solid #999;\
            padding-left: 0px;\
        }\
        #reply_status_box,\
        #reply_cnt_box {\
            display: none;\
            position: absolute;\
        }\
        .hidden { display: none; }\
    ');
}

/* 返回指定按钮的名称 */
function getButtonName(ele)
{
    /* 获取按钮对象 */
    var $btn = (ele.tagName.toLowerCase() == 'a') ? 
        $(ele) : $(ele).parent('a');
    var name = $btn.attr('id') || $btn.attr('class');

    /* 获取按钮名称 */
    if (name.indexOf('btn_') != -1)
        return name.match(/btn_(.*?)(?:\s|$)/)[1];
    else
        return 'nonexist';
}

/* 返回指定按钮的图片地址 */
function getButtonURL(ele)
{
    return ImageURLs[getButtonName(ele)];
}

/* 创建快速回复以及快速引用按钮 */
function createReplyButtons()
{
    $('img[src$="message.gif"]').closest('td')  // 查找插入位置
        .append(function(index) {
            return [
                '<a class="reply_button btn_reply" title="快速回复">',  // 快速回复按钮
                '<img alt="快速回复" src=""/>',
                '</a>',

                '<a class="reply_button btn_quote" title="快速引用">',  // 快速引用按钮
                '<img alt="快速引用" src=""/>',
                '</a>',

                '<a class="reply_button btn_send" title="快速群发">',   // 群发信息
                '<img alt="快速群发" src=""/>',
                '</a>'
            ].join('');
        })
        .find('.reply_button img').attr('src', function() {  // 设定按钮的地址
            return getButtonURL(this); 
        });
}

/* 创建快速回复弹出窗口 */
function createReplyPopup()
{
    /* 尝试查找回复框容器 */
    var $replyContainer = $('#reply_container');

    /* 若已经添加到文档中 */
    if ($replyContainer.length != 0)
        return $replyContainer;

    /* 创建回复框容器DIV */
    $replyContainer = $('<div id="reply_container"/>').appendTo('body');

    /* 填充回复框界面骨架 */
    $replyContainer.html([
        '<div id="reply_header_container">',   // 回复框头部

        '<div id="reply_titlebar">',  // 回复框标题栏
        '<span id="reply_title"/>',  // 回复框标题
        '<a class="reply_button btn_close" title="关闭">',  // 回复框关闭按钮
        '<img alt="关闭"/>',
        '</a>',
        '</div>',

        '<div id="reply_subjectbar">',  // 回复框主题栏
        '<input type="text" id="reply_subject" name="reply_subject"/>',  // 回复框主题
        '<span id="reply_type"/>',  // 回复类型
        '<span id="reply_panel_button">',  // 回复面板按钮
        '<a class="reply_button btn_expression" title="发帖心情">',  // 发帖心情按钮
        '<img alt="发帖心情"/>',
        '</a>',
        '<a class="reply_button btn_emotion" title="插入表情">',  // 插入表情按钮
        '<img alt="插入表情"/>',
        '</a>',
        '<a class="reply_button btn_upload" title="插入表情">',  // 上传文件按钮
        '<img alt="上传文件"/>',
        '</a>',
        '</span>',
        '</div>',

        '</div>',

        '<div id="reply_panel_container">',  // 回复框面板
        '<div class="panel hidden" id="expression_panel"/>',  // 心情面板
        '<div class="panel hidden" id="emotion_panel"/>',  // 表情面板
        '<div class="panel hidden" id="upload_panel"/>',  // 上传面板
        '</div>',

        '<div id="reply_content_container">',  // 回复框内容
        '<textarea id="reply_content" name="reply_content"/>',  // 文本输入框
        '<span id="reply_cnt_box"/>',  // 字数统计
        '<span id="reply_status_box"/>',  // 字数统计
        '</div>',

        '<div id="reply_footer_container">',  // 回复框尾部
        '<div id="asv_actions">',
        '<span id="btn_save" class="asv_action">保存数据</span>',     // 保存数据
        '<span id="btn_recover" class="asv_action">恢复数据</span>',  // 恢复数据
        '</div>',
        '<div id="reply_actions">',
        '<button id="btn_reply" class="reply_action">回复</button>',  // 回复
        '<button id="btn_preview" class="reply_action">预览</button>',  // 预览
        '<button id="btn_cancel" class="reply_action">退出</button>',   // 退出
        '</div>',
        '</div>'
    ].join(''));


    if (ShowTitle) // 若要显示标题栏
        $replyContainer.find('#reply_titlebar').show();
    else { // 将关闭按钮迁到主题栏中
        var btnClose = $replyContainer.find('.btn_close').clone()
            .css('position', 'static');
        $replyContainer.find('#reply_panel_button').append(btnClose);
    }

    return $replyContainer;
}

/* 处理引用的内容 */
function processQuoteContent(value)
{
    /* 正则表达式定义 */
    var rmultiquote = 
        /(\[quotex?\][\s\S]*?)\[quotex?\][\s\S]*\[\/quotex?\]([\s\S]*?\[\/quotex?\])/gi;

    var rbegdupblank = /\s*\n*(\[quotex?\])\s*\n*/i;
    var renddupblank = /\s*\n*(\[\/quotex?\])\s*\n*/i;

    var remotubb = /(\[em\d{2}\])/gi;
    var rupldubb = /(\[upload=[^,]*?)(,0)?(\])/gi;

    /* 删除多余的空行 */
    value = value.replace(rbegdupblank, '$1\n').replace(renddupblank, '\n\n$1\n');

    /* 删除多重引用内容 */
    if (RemoveMultiQuote) value= value.replace(rmultiquote, '$1$2');

    /* 查找插入位置 */
    var insPos = value.indexOf('[/b]') + 4;

    /* 构造插入内容 */
    var insContent = [ 
        '[url=',
        getOrigURL(location.href),
        ',t=', 
        (OpenInNewtab?'blank':'self'), 
        '][color=',
        PromptColor, 
        '][b]', 
        PromptString, 
        '/b][/color][/url]\n'
    ].join('');

    /* 拼接内容 */
    return value.substring(0, insPos) + insContent + value.substring(insPos)
        .replace(remotubb, "[noubb]$1[/noubb]")  // 不解释 [em**] 标签
        .replace(rupldubb, "$1,1$3");  // 不自动展开图片
}

/* 动态显示回复文本框 */
function showReplyPopup(ele, name)
{
    /* 获取帖子标题 */
    var title = document.title.replace(/ » CC98论坛/, "");

    /* 尝试查找回复框容器 */
    var $replyContainer = createReplyPopup();

    /* 获取点击的按钮 */
    var $btn = $(ele);

    /* 填充页面元素 */
    $replyContainer
        .find('.reply_button img')
            .attr('src', function() { return getButtonURL(this); })  // 设定按钮地址
        .end()
        .find('#reply_title')  // 设定标题
            .text($btn.attr('title') + '帖子 "' + title + '"')
        .end()
        .find('input[name="reply_subject"]').val('Re: ' + title).end()  // 设定主题
        .find('#reply_type')
            .html($btn.find('img').clone())  // 设定回复类型指示
        .end()
        .css({  // 设定回复框的样式
            width: function () {
                var theWidth = parseFloat(ReplyPopupWidth);
                var winWidth = $(window).width();

                if (ReplyPopupWidth.slice(-1) == '%')  // 百分数据表示
                    return Math.min(theWidth / 100, 0.8) * winWidth;
                else
                    return Math.min(theWidth, 0.8 * winWidth);
            },
            opacity: ReplyTransp,
            backgroundColor: BackgroundColor,
            left: function() { 
                var theWidth = $(this).outerWidth();
                var winWidth = $(window).width();

                if (theWidth < winWidth / 2)
                    return winWidth / 2;
                else
                    return 3.0 / 4 * (winWidth - theWidth);
            },
            top: function() {
                var theHeight = $(this).outerHeight();
                var winHeight = $(window).height();

                if (theHeight < winHeight / 2)
                    return winHeight / 4;
                else
                    return 3.0 / 4 * (winHeight - theHeight);
            }
        });

    /* 获取具体的回复框 */
    var $replyContent = $replyContainer.find('#reply_content')
        .css('height', TextInputHeight)
        .attr('placeholder', '请输入回复');

    /* 临时函数 */
    var callback = function() {
        /* 显示回复框 */
        $replyContainer.slideDown(AnimateSpeed, function() {
            $replyContainer.find('#reply_subject')
                .css('paddingLeft', function(index, oldValue) {    // 微调回复主题框
                    var offset = $replyContainer.find('#reply_type').outerWidth();
                    var preOffset = parseFloat(oldValue) || 0;
                    
                    return (preOffset > offset) ? preOffset : preOffset + offset;
                });
        });
    };

    /* 执行该函数 */
    callback();

    /* 如果是快速引用类型 */
    if (name == 'quote') {
        var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        var replyURL = $btn.siblings().filter('a[href*="reannounce.asp"]')
            .attr('href');

        /* 如果找不到引用回复地址 */
        if (replyURL === undefined)
            return $replyContainer;

        /* 获取引用的内容 */
        $.get(replyURL, function(data) {
            var value = $('<div>').append(data.replace(rscript, ''))
                .find('textarea#content').val();

            $replyContent.val(function() { 
                return processQuoteContent(value); 
            });
        });
    }

    return $replyContainer;
}

/* 隐藏快速回复框 */
function hideReplyPopup()
{
    var $replyContainer = $('#reply_container');

    /* 清除旧的定时器 */
    clearIntervalTimer();
    /* 退出前备份数据 */
    saveData($replyContainer.find('#reply_content'));

    if ($replyContainer.is(':visible')) {
        $replyContainer
            .find('#reply_footer_container')
                .slideUp(AnimateSpeed)
            .end()
        .slideUp(AnimateSpeed);
    }
}

/* 创建表情面板 */
function createEmotPanel()
{
    var arr = new Array();
    var html = '<img src="emot/simpleemot/emot%n%.gif" alt="[em%n%]">';

    arr.push('<span class="label">插入表情: </span>');

    for (var i = 0; i <= 90; i++) {
        if (i >= 38 && i <= 70)   // 过滤不常用表情
            continue; 

        arr.push(html.replace(/%n%/g,  (('0' + i).slice(-2))));
    }

    return arr.join('');
} 

/* 创建心情面板 */
function createExprPanel()
{
    var arr = new Array();
    var html = '<img src="face/face%n%.gif" alt="face%n%">';

    arr.push('<span class="label">选择心情:</span>');

    for (var i = 1; i <= 22; i++)
        arr.push(html.replace(/%n%/g, i));

    return arr.join('');
}

/* 创建上传文件面板 */
function createUpldPanel()
{
    return [
        '<iframe width="100%" scrolling="no" height="24" frameborder="0" ',
        'id="uploadframe" src="saveannounce_upload.asp?boardid=',
        getBoardID(),
        '" name="uploadframe"></iframe>'
    ].join('');
}

/* 创建快速回复框面板 */
function createReplyPanel(panelName)
{
    var htmlFrag;

    switch (panelName) {
        case 'emotion_panel':
            htmlFrag = createEmotPanel();
            break;
        case 'expression_panel':
            htmlFrag = createExprPanel();
            break;
        case 'upload_panel':
            htmlFrag = createUpldPanel();
            break;
        default:
            htmlFrag = '面板创建失败';
    }

    return htmlFrag;
}

/* 切换显示快速回复框面板 */
function toggleReplyPanel(name)
{
    /* 获取待显示的面板对象 */
    var panelName = name + '_panel';
    var $panel = $('#' + panelName);

    /* 若面板未创建则填充面板元素 */
    if ($panel.is(':empty'))
        $panel.html(createReplyPanel(panelName));

    /* 控制面板的显示与隐藏 */
    $panel.siblings().addClass('hidden');
    $panel.toggleClass('hidden');
}

/* 获取存储Key值 */
function getKey() { return 'cc98bbscontent_tid' + getTopicID(); }

/* 显示状态信息 */
function notifyStatus(statusText, notifyWhere, style, keepTime)
{
    if (!(notifyWhere instanceof jQuery))
        notifyWhere = $(notifyWhere);

    /* 设定样式和填充内容 */
    style = $.extend({}, style, UserStatusBoxStyle);
    notifyWhere.html(function(index, oldValue) {
        return statusText ? statusText : oldValue;
    }).css(style);

    /* 展开状态信息 */
    notifyWhere.fadeTo(AnimateSpeed, style.opacity, function() {
        /* 如果设定，则保持时间为keepTime值 */
        if (keepTime) {
            /* 如果存在定时器，则先清除并重置 */
            clearTimeout(StatusKeepTimer);

            StatusKeepTimer = setTimeout(function() {
                notifyWhere.fadeOut(AnimateSpeed);
            }, keepTime);
        }
    });
}

/* 设置一个页面元素相对其它元素的绝对位置 */
function setAbsPosition(target, refer, x, y)
{
    /* 位置样式 */
    var style = {
        left: 'auto',
        right: 'auto',
        top: 'auto',
        bottom: 'auto',
        position: 'absolute'
    };

    if (!(target instanceof jQuery))
        target = $(target);

    if (!(refer instanceof jQuery))
        refer = $(refer);

    /* 默认为居中 */
    x = x || 'middle';
    y = y || 'middle';

    /* 设置水平位置 */
    if (x == 'middle') {
        style['left'] = function () {
            return (refer.innerWidth() - target.outerWidth()) / 2;
        };
    } else
        style[x] = refer.css('padding-' + x);

    /* 设置垂直位置 */
    if (y == 'middle') {
        style['bottom'] = function () {
            return (refer.innerHeight() - target.outerHeight()) / 2;
        };
    } else
        style[y] = refer.css('padding-' + y);

    return style;
}

/* 动态统计文本框的剩余字数 */
function taCharCountNotify(ta, notifyWhere)
{
    /* 获取实际的jQuery对象 */
    if (!(ta instanceof jQuery))
        ta = $(ta);

    /* 统计剩余字数 */
    var remain = MaxTextareaLength - ta.val().length;

    if (notifyWhere !== undefined) { // 显示统计状态
        var style = setAbsPosition(notifyWhere, ta, 'right', 'bottom');

        style.color = remain < 0 ? ErrorStatusColor : NormStatusColor;
        notifyStatus(remain + '字', notifyWhere, style);
    }

    return remain;
}

/* 备份文本框数据 */
function saveData(ta, auto, notifyWhere)
{
    if (!(ta instanceof jQuery))
        ta = $(ta);

    var data = ta.val();
    var status = auto ? '自动: ' : '手动: ';

    if (data) { // 保存数据
        setValue(getKey(), data);
        status += '帖子内容保存于' + (new Date()).toLocaleTimeString();
    } else {
        status += '帖子内容为空, 放弃备份';
        clearIntervalTimer(AutoSaveTimer);
    }

    if (notifyWhere !== undefined) { // 显示通知
        notifyStatus(status, notifyWhere, setAbsPosition(
            notifyWhere, ta, 'left', 'bottom'
        ), KeepTime);
    }
}

/* 恢复文本框数据 */
function recoverData(ta, notifyWhere)
{
    /* 获取上次保存的数据 */
    var data = getValue(getKey(), '');
    var status;

    /* 恢复数据过程 */
    if (data && (!ta.val() || confirm('确定要恢复数据吗'))) {
        status = '成功恢复数据';

        if (!(ta instanceof jQuery))
            ta = $(ta);

        ta.val(data);
    } else
        status = data ? '放弃恢复数据' : '没有可以恢复的数据';

    if (notifyWhere !== undefined) { // 显示通知
        notifyStatus(status, notifyWhere, setAbsPosition(
            notifyWhere, ta, 'left', 'bottom'
        ), KeepTime);
    }
}

/* 清除并重置周期定时器 */
function clearIntervalTimer()
{
    if (AutoSaveTimer == -1)
        return;

    clearInterval(AutoSaveTimer);
    AutoSaveTimer = -1;
}

/* 触发按钮点击事件 */
function triggerButtonClick(ele)
{
    /* 获取按钮名称 */
    var name = getButtonName(ele);

    if (name == 'nonexist')
        return;

    if (name == 'reply' || name == 'quote' ||
        name == 'send' ) // 显示回复框 
        showReplyPopup(ele, name);
    else if (name == 'close') // 关闭回复框
        hideReplyPopup();
    else // 切换显示面板
        toggleReplyPanel(name);
}

/* Main 函数 */
function main()
{
    /* 不在frames中再次执行该脚本 */
    if (window.top != window.self)
        return;

    /* 如果未登录，直接退出 */
    if (document.cookie.indexOf('aspsky') == -1)
        return;

    /* 添加自定义的样式 */
    addCustomizedCSS();

    /* 创建快速回复以及快速引用按钮 */
    createReplyButtons();

    /* 绑定按钮点击事件 */
    $('.reply_button').live('click', function(evt) {
        /* 阻止事件默认行为以及停止向上冒泡 */
        evt.preventDefault();
        evt.stopPropagation();

        /* 激活按钮点击事件 */
        triggerButtonClick(this);
    });

    /* 点击退出按钮隐藏快速回复框 */
    $('#btn_cancel').live('click', hideReplyPopup);

    /* 点击心情面板图标更换 */
    $('#expression_panel img').live('click', function() {
        $('.btn_expression img').attr('src', this.src);
    });

    /* 点击表情插入UBB标签到文本框 */
    $('#emotion_panel img').live('click', function() {
        var insertText = this.src.replace(/(.*?emot(\d+)\.gif)/, "[em$2]");
        var $replyContent = $('#reply_content');

        $replyContent.val(function(index, oldValue) {
            var start = $(this).prop('selectionStart');

            return [
                oldValue.slice(0, start),
                insertText,
                oldValue.slice(start)
            ].join('');
        }).focus();
    });

    /* 捕获文本框的各种事件 */
    $('#reply_content')
        .live('input focus', function() {  // 动态统计文本框字数
            var $replyContent = $(this);

            /* 实时统计字数 */
            var remain = taCharCountNotify($replyContent, $('#reply_cnt_box'));

            /* 已经输入数据 */
            if (remain != MaxTextareaLength)　{
                /* 自动备份数据: 未开始自动备份 */
                if (AutoSaveTimer == -1) {
                    AutoSaveTimer = saveData.periodical(AutoSaveInterval, 
                        window, [$replyContent, true, $('#reply_status_box')]);
                }
            }

            /* 显示回复框底部 */
            $('#reply_footer_container').slideDown(AnimateSpeed);
        })
        .live('blur', function() {
            $('#reply_cnt_box').fadeOut(AnimateSpeed);    // 隐藏字数统计框 
        });

    /* 自动备份事件处理 */
    $('.asv_action').live('click', function() {
        var $replyContent = $('#reply_content');
        var $replyStatusBox = $('#reply_status_box');

        /* 清除旧的定时器 */
        clearIntervalTimer();

        if (this.id == 'btn_save')
            saveData($replyContent, false, $replyStatusBox);
        else
            recoverData($replyContent, $replyStatusBox);
    });

    /* 刷新页面之前保存帖子内容 */
    $(window).unload(function() { saveData($('#reply_content'), 0); });
}

/* 执行main函数 */
main();

})();
