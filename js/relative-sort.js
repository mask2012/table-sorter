;(function(){
    var zhuti={
        secname:$.getQueryString('secName'),
        seccode:$.getQueryString('secCode'),
        serverUrl:$.getAjaxHost("common"),
        newsServerUrl:$.getAjaxHost("news"),
        from:$.getQueryString('dt_from'),
        tab1Flag:false,
        tab2Flag:false,
        stockDetailList:{},
        secCodeInfoList:[],
        init:function(){
            this.addTitleBar();
            this.bindEvents();
            this.ajaxHotDegree();
        },
        addWeixinShare:function(options){
            var time = $.dateConverter("yyyy-MM-dd hh：mm",(new Date()).getTime());
            var options = {
                title:'灯塔主题-'+$.getQueryString('secName'),
                desc:'日涨跌幅: '+options.aRise+'\n'+time
            };
            $.weixinSDKRegister(options);
        },
        addTitleBar:function(){
            $.addTitleBar($.getQueryString('secName'));
        },
        bindEvents:function(){
            var that=this;
            $('#subject-summary').tap(function(){
                $(this).toggleClass('expanded');
            });

            //主题tab切换
            $('#tab-relative li').tap(function(){
                $('#tab-relative li').removeClass('on');
                $(this).addClass('on');
                var tabOrder=$(this).index();
                $('#tab-relative-content>.tab_content').addClass('none');
                $('#tab-relative-content>.tab_content').eq(tabOrder).removeClass('none');
                if(tabOrder==0 && that.tab1Flag==false){
                    that.tab1Flag=true;
                    that.ajaxSubjectTable();
                    //that.handleAjaxSubjectTable(dataSubject);
                }else if(tabOrder==1 && that.tab2Flag==false){
                    that.tab2Flag=true;
                    that.ajaxSubjectInfo();
                    //that.handleAjaxSubjectInfo(dataSubjectInfo);
                }
            })
            //主题切换默认点击第一个
            $('#tab-relative li').eq(0).trigger('tap');

            $.touchEvent($("#subject-in-similar .table_col1"),".table_item",function(){
                var secCode = $(this).attr("data-seccode");
                var secName = encodeURI($(this).attr("data-secname"));
                $.stockDetailSkip(secCode,secName);
            });

            $.touchEvent($("#subject-in-similar .table_col2"),".table_item",function(){
                var secCode = $(this).attr("data-seccode");
                var secName = encodeURI($(this).attr("data-secname"));
                $.stockDetailSkip(secCode,secName);
            });

            $.touchEvent($("#subject-news"),"li",function(){
                var href = $(this).attr("data-href");
                if(href == undefined){
                    return;
                }
                if(that.from == "web"){
                    location.href = href+"&dt_from="+that.from+'&webviewType=newsType';
                }else{
                    location.href = href+"&dt_from=app"+'&webviewType=newsType';
                }
            });

            $.touchEvent($("#concept-news-content"),".btn_more",function(){
                var href = $(this).attr("data-href");
                if(href == undefined){
                    return;
                }
                location.href = $.getAjaxHost("newsHref")+href;
            });
        },

        //通过百分比得到带标签，到样式，带正负号，带百分比号的字符串
        getNumInfo:function(str){
            var symbol=parseFloat(str)>0?'+':'';
            var percent=symbol+parseFloat(str).toFixed(2)+'%';
            var classname=(symbol=='+')?'num_rise':'num_fall';
            if(str==0){
                return "<b class='num_stop'>停牌</b>"
            }else{
                return "<b class="+classname+">"+percent+"</b>"
            }
        },
        valid:function(value){
            if(value==undefined || value==''){
                return '--';
            }else{
                return value;
            }
        },
        //通过时间戳得到 15:50 的日期格式
        formatTime:function(timeStamp){
            var date=new Date(timeStamp*1000);
            var dateHours=parseInt(date.getHours());
            var dateMinutes=parseInt(date.getMinutes());
            dateHours<10?dateHours='0'+dateHours:dateHours;
            dateMinutes<10?dateMinutes='0'+dateMinutes:dateMinutes;
            return dateHours+':'+dateMinutes
        },

        //========================表格滑动特性==============================
        setScollerItemWidth:function(el,column){   //设定滑动表格每一列的宽度
            if(column==undefined){
                column=3;
            }
            var scrollItemWidth=$(el).find('.table_col2').width()/column;
            var itemNum=$(el).find('.table_col2 .table_title').find('span').length;
            $(el).find('.table_col2 span').css({
                width:scrollItemWidth+'px'
            });
            $(el).find('.scroller_inside').width((scrollItemWidth)*itemNum+1);
        },
        scrollTable:function(domId,column) {   //表格开始滑动
            this.setScollerItemWidth(domId,column);
            // if(!$.isIOS()){ //如果非ios设备，则不用iscroll，使用原生滑动+分档停止插件
                $(domId).find('.table_col2').tableScroller({
                    direction:'horizental',
                    snapItem:$(domId).find('.table_col2 .table_title span').eq(0),
                    scrollHint:$(domId).find('.scroll_hint')
                })
            //     return;
            // }
            // var re=/translate\(0px/g;
            // this.myScroll = new IScroll( domId+' .table_col2', {
            //     scrollX: true,
            //     eventPassthrough:'vertical',
            //     snap: 'span',
            //     scrollY: false,
            //     preventDefault: true
            // });
            // this.myScroll.on('scrollEnd', function(){
            //     var style=$(domId).find('.scroller_inside').attr('style');
            //     var flag=style.match(re);
            //     if(flag){
            //         $(domId).find('.scroll_hint').removeClass('unvisible');
            //     }else{
            //         $(domId).find('.scroll_hint').addClass('unvisible');
            //     }
            // });
        },
        //========================主题表格==============================
        ajaxSubjectTable:function(){
            $.showLoading({
                obj:$('#concept-table-content .loading_holder'),
                isBig:true
            });
            var options = {
                url:this.serverUrl+'getConceptDetail',
                data:{
                    action:'squote',
                    seccode:this.seccode
                },
                success:function(data){
                    that.handleAjaxSubjectTable(data);
                },
                error:function(data){
                    $.hideLoading($('#concept-table-content .loading_holder'));
                    $.alert('您的网速不给力啊，请稍后重试！')
                }
            }
            var that=this;
            $.getData(options);
        },
        handleAjaxSubjectTable:function(data){
            $.hideLoading($('#concept-table-content .loading_holder'));
            if(data.ret!=0 || data.content==''){
                $.alert("数据异常，请稍后再试");
                return;
            }
            var data=JSON.parse(data.content);
            function handleDesc(txt){
                console.log(txt)
                var tempArr=[];
                tempArr=txt.split('\n'.toString());
                for (var i = 0; i < tempArr.length; i++) {
                    tempArr[i]='<p>'+tempArr[i]+'</p>';
                };
                return tempArr.join('');
            }
            
            $('#subject-summary').html(handleDesc(data.sConcDesc));

            var that = this;
            var options = {
                url:this.serverUrl+'getSecInfo',
                data:{
                    action:'squote',
                    seccode:this.seccode
                },
                success:function(data){
                    if(data.ret!=0 || data.content==''){
                        $.alert("数据异常，请稍后再试");
                        return
                    }
                    var data=JSON.parse(data.content).vSecSimpleQuote[0];
                    if(that.from == "app"){
                        //给ios终端传入收藏所需要
                        var option = {data:data,type:"conceptDetail"};
                        beacon.sendInfoToNative(option,function(){});
                    }
                    var nowPrice = data.fNow;
                    var oldPrice = data.fClose;
                    var upDownRate;
                    if(nowPrice!=0){
                        upDownRate=(nowPrice-oldPrice)/oldPrice*100;
                    }else{
                        upDownRate=0;
                    }
                    upDownRate = that.getNumInfo(upDownRate);

                    var numbs = Math.round(data.fHot*10/2);
                    $(".summary_info .info_hot").addClass('info_hot'+numbs);
                    $("#up-down-today").html(upDownRate);

                    //设置分享
                    that.addWeixinShare({
                        aRise:$('#up-down-today b').html()
                    });
                },
                error:function(data){
                    $.alert('您的网速不给力啊，请稍后重试！')
                }

            };
            $.getData(options);

            var relaStockData = data.vtConcDetailRelaStock;
            var secCodeList = "";

            for (var i = 0,j=relaStockData.length; i <j; i++) {
                if(i==0){
                    secCodeList+=relaStockData[i].sDtSecCode;
                }else{
                    secCodeList+="|"+relaStockData[i].sDtSecCode;
                }
                var option = {
                    sStockName:relaStockData[i].sStockName,
                    sDtSecCode:relaStockData[i].sDtSecCode,
                    fRelaDegree:relaStockData[i].fRelaDegree
                };
                this.secCodeInfoList.push(option);

                relaStockData[i].fRelaDegree = "--";
                relaStockData[i].fNowPrice   = "--";
                relaStockData[i].upDownRate  = "--";
                relaStockData[i].fMarketValue= "--";
                relaStockData[i].fSyl        = "--";
            };


            var leftDom = $("#subject-in-similar").find(".table_col1");
            var rightDom = $("#subject-in-similar").find(".scroller_inside");

            var stockNameTemplateHtml = $("#stockNameTemplate").html();
            var stockNameData = {
                "vData":this.secCodeInfoList,
                "length":this.secCodeInfoList.length
            }
            var leftHtml =$.compiler(stockNameTemplateHtml,stockNameData);
            $(leftHtml).appendTo(leftDom);
            var secCodeInfo = {
                secCodeInfo:relaStockData,
                "length":relaStockData.length
            };
            var stockDetailTemplateHtml = $("#stockDetailTemplate").html();
            var rightHtml = $.compiler(stockDetailTemplateHtml,secCodeInfo);
            $(rightHtml).appendTo(rightDom);

            var that = this;
            var options = {
                url:this.serverUrl+'getSecInfo',
                data:{
                    action:'squote',
                    seccode:secCodeList
                },
                success:function(data){
                    that.getSecInfosAndShow(data);
                },
                error:function(data){
                    $.alert('您的网速不给力啊，请稍后重试！')
                }

            };
            $.getData(options);
        },

        getSecInfosAndShow:function(data){
            var that=this;
            if(data.ret!=0 || data.content==''){
                $.alert("数据异常，请稍后再试");
                return;
            }
            var data=JSON.parse(data.content);
            var relaStockData = data.vSecSimpleQuote;
            for (var i = 0,j=relaStockData.length; i <j; i++) {
                var secInfo = relaStockData[i];

                var nowPrice = secInfo.fNow;
                var oldPrice = secInfo.fClose;
                var upDownRateNum;
                var upDownRate;
                if(nowPrice!=0){
                    upDownRateNum=(nowPrice-oldPrice)/oldPrice*100;
                }else{
                    upDownRateNum=' ';
                }
                upDownRate = this.getNumInfo(upDownRateNum);

                if(secInfo.fSyl<0){
                    var fSyl = "--";
                }else{
                    var fSyl = secInfo.fSyl.toFixed(2);
                }

                var fMarketValue = (secInfo.fTotalmarketvalue/100000000).toFixed(2);

                relaStockData[i].fRelaDegree = this.secCodeInfoList[i].fRelaDegree;
                relaStockData[i].fNowPrice   = secInfo.fNow==0?secInfo.fClose.toFixed(2):secInfo.fNow.toFixed(2);
                relaStockData[i].upDownRate  = upDownRate;
                relaStockData[i].upDownRateNum  = upDownRateNum;
                relaStockData[i].fMarketValue   = fMarketValue==0?"<b class='num'>--</b>":fMarketValue;
                relaStockData[i].fMarketValueNum= fMarketValue==0?" ":fMarketValue;
                relaStockData[i].fSyl           = fSyl;
                relaStockData[i].fSylNum        = fSyl=='--'?' ':fSyl;
                relaStockData[i].sStockName     = this.secCodeInfoList[i].sStockName;
            };
            var rightDom = $("#subject-in-similar").find(".scroller_inside");
            rightDom.find(".bdb").remove();

            var stockDetailTemplateHtml = $("#stockDetailTemplate").html();
            var secCodeInfo = {
                secCodeInfo:relaStockData,
                "length":relaStockData.length
            };
            var rightHtml = $.compiler(stockDetailTemplateHtml,secCodeInfo);
            $(rightHtml).appendTo(rightDom);

            //得到tags标签写进表格
            var tempArr=$.getTags(relaStockData);
            $.setTags({
                data:tempArr,
                elements:$('#subject-in-similar .table_col1 .table_item'),
                showSubNew:true,
                showFaucet:false,
                showStrong:true,
                showNew:false
            });

            $('#subject-in-similar').removeClass('none');
            this.scrollTable('#subject-in-similar',2);

            $('#subject-in-similar .scroller_inside').sortTable({
                tableTitle:$('#subject-in-similar .table_col2 .table_title'),
                tableRowClass:'table_item',
                relativeTable:$('#subject-in-similar .table_col1'),            //关联排序列对象
                relativeRowClass:'table_item'
            });

        },


        //========================主题资讯列表==============================
        ajaxSubjectInfo:function(){
            $.showLoading({
                obj:$('#concept-news-content .loading_holder'),
                height:'400',
                isBig:true
            });
            var options = {
                url:this.newsServerUrl+'getNews',
                data:{
                    action:'NewsList',
                    seccode:this.seccode,
                    startid:0,
                    endid:0,
                    type:1
                },
                success:function(data){
                    that.handleAjaxSubjectInfo(data);
                },
                error:function(data){
                    $.alert('您的网速不给力啊，请稍后重试！')
                }
            }
            var that=this;
            $.getData(options);
        },
        handleAjaxSubjectInfo:function(data){
            var that=this;
            $.hideLoading($("#concept-news-content .loading_holder"));
            if(data.ret!=0 || data.content==''){
                $.alert('数据异常，请稍后再试');
                $("#concept-news-content").find('.no_data').removeClass('none');
                return
            }
            var data=JSON.parse(data.content);
            if(data.vNewsDesc.length == 0){
                $("#concept-news-content").find('.no_data').removeClass('none');
                return;
            }

            for (var i = 0; i < data.vNewsDesc.length; i++) {
                data.vNewsDesc[i].iTimeFormatted = this.timeConverter(data.vNewsDesc[i].iTime*1000);

                if(data.vNewsDesc[i].vtTagInfo.length==0){
                    data.vNewsDesc[i].attType=0;
                    data.vNewsDesc[i].tagType=0;
                }else{
                    data.vNewsDesc[i].attType=data.vNewsDesc[i].vtTagInfo[0].eAttiType;
                    data.vNewsDesc[i].attName=data.vNewsDesc[i].vtTagInfo[0].sTagName;
                    data.vNewsDesc[i].tagType=data.vNewsDesc[i].vtTagInfo[0].eTagType;
                }
            };
            if(data.vNewsDesc.length>3){    //删除第三条以上的数据
                data.vNewsDesc.splice(3,100);
            }
            var template = $("#newsTmplete").html();
            var compiledHTML = $.compiler(template, data);
            $('#subject-news').html(compiledHTML);

            if(data.vNewsDesc.length<3){
                $("#concept-news-content .btn_more").remove();
            }else{
                $("#concept-news-content .btn_more").removeClass('none').attr({
                    "data-href": 'newsList.html?seccode='+that.seccode+'&type=1&dt_from='+that.from+'&secName='+that.secname+'&webviewType=commonRefreshType'
                });
            }
        },

        timeConverter:function(timeStamp){   //timeStamp为毫秒单位。如果是去年，则显示2014-12-30;如果是今天，显示10:25;如果是昨天，显示昨天;如果是昨天前，显示03-15
            if($.dateConverter('yyyy',timeStamp)!=$.dateConverter('yyyy',new Date())){
                return $.dateConverter('yyyy-MM-dd',timeStamp);
            }else if($.dateConverter('yyyy-MM-dd',timeStamp)==$.dateConverter('yyyy-MM-dd',new Date())){
                return $.dateConverter('hh:mm',timeStamp);
            }else if($.dateConverter('yyyy-MM-dd',timeStamp)==$.dateConverter('yyyy-MM-dd',new Date()-1000*60*60*24)){
                return '昨天';
            }else{
                return $.dateConverter('MM-dd',timeStamp);
            }
        },


        //========================画热度图表==============================
        ajaxHotDegree:function(){
            var options = {
                url:this.serverUrl+'getConceptDetail',
                data:{
                    action:'HotDegreeTrend',
                    seccode:this.seccode
                },
                success:function(data){
                    that.handleAjaxHotDegree(data);
                },
                error:function(data){
                    $.alert('您的网速不给力啊，请稍后重试！')
                }
            };
            var that=this;
            $.getData(options);
        },
        handleAjaxHotDegree:function(data){
//             var data={
// "content": "{ \"vConcIndexDesc\": [ { \"fHotIndex\": 9384.46, \"lYmd\": 20160106 }, { \"fHotIndex\": 7384.46, \"lYmd\": 20160107 }, { \"fHotIndex\": 2384.46, \"lYmd\": 20160108 }, { \"fHotIndex\": 2384.46, \"lYmd\": 20160109 }, { \"fHotIndex\": 2384.46, \"lYmd\": 20160110 }] }",
// "ret": 0
// }
            if(data.ret!=0 || data.content=='' || JSON.parse(data.content).vConcIndexDesc.length<2){
                $('#graphic-hot').html('<div class="no_data display_center">暂无数据</div>');
                return
            }
            
            var data=JSON.parse(data.content);
            //画热度图表
            d3Charts.drawLine("#graphic-hot",data.vConcIndexDesc); //绘图函数，参数为一个SVG和json数据
        }
    }

    zhuti.init();
})();