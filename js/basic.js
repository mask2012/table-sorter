(function(){
    var marketQuotation = {
        serverUrl:$.getAjaxHost("common"),
        fRmbHkExchangeRate:0.8,//港币和人民币汇率
        pollInterval:5000,
        scroller1:null,
        scroller2:null,
        scroller3:null,
        scroller4:null,
        scrollDomLock:false,
        stockDetailList:{},
        from:$.getQueryString("dt_from"),
        init:function(){
            var viewportHeight=document.documentElement.clientHeight;
            $.addTitleBar("市场行情");
            if(this.from == "web"){
                $("body").addClass("fix_with_title");
                $("#tabMarket").addClass("fix_with_title");
                $('#marketSwiper').height(viewportHeight-76);
                $('#scrollerHolder1,#scrollerHolder2,#scrollerHolder3,#scrollerHolder4').height(viewportHeight-76);
            }else{
                $("body").addClass("fix_without_title");
                $('#marketSwiper').height(viewportHeight-36);
                $('#scrollerHolder1,#scrollerHolder2,#scrollerHolder3,#scrollerHolder4').height(viewportHeight-36);
            }
            
            var type = $.getQueryString("type");
            type = localStorage.marketPageType;
            if(type == "A"){
                this.marketSwiper(0);
            }else if(type == "HK"){
                this.marketSwiper(1);
            }else if(type == "AH"){
                this.marketSwiper(2);
            }else if(type == "US"){
                this.marketSwiper(3);
            }else{
                this.marketSwiper(0);
            }

            this.addWeixinShare();
            this.addEvent();
        },
        addWeixinShare:function(){
            var options = {
                title:"灯塔资讯",
                desc:"行情、业绩、估值、评级核心数据尽在灯塔个股画像，帮你发现好股票。",
            };
            $.weixinSDKRegister(options);
        },
        marketSwiper:function(initIndex){
            var that=this;
            if($.os.ios==undefined){    //如果非ios,则tab只能硬切,用swiper的切换会导致原生滚动的高度不对(它会按照最大的高度来滚动，导致某些tab底部留白)
                var ifHasshow = $("#tabMarket li").eq(initIndex).attr("data-ifhasshow");
                if(initIndex==0){
                    that.openChStockPage(ifHasshow);
                    localStorage.marketPageType = "A";
                }else if(initIndex==1){
                    that.openHkStockPage(ifHasshow);
                    localStorage.marketPageType = "HK";
                }else if(initIndex==2){
                    that.openStockConnect(ifHasshow);
                    localStorage.marketPageType = "AH";
                }else if(initIndex==3){
                    that.openUSStock(ifHasshow);
                    localStorage.marketPageType = "US";
                }

                $("#tabMarket li").removeClass("on");
                $("#tabMarket li").eq(initIndex).addClass('on').attr({
                    "data-ifhasshow": 'true'
                });
                $('#marketSwiper .tab_content').addClass('none');
                $('#marketSwiper .tab_content').eq(initIndex).removeClass('none');

            }else{
                var swiper = new Swiper('#marketSwiper',{
                    // touchMoveStopPropagation:false,
                    initialSlide:initIndex,
                    threshold:30,
                    onInit:function(swiper){
                        var currentIndex=swiper.activeIndex;
                        var ifHasshow = $("#tabMarket li").eq(currentIndex).attr("data-ifhasshow");
                        if(currentIndex==0){
                            that.openChStockPage(ifHasshow);
                            localStorage.marketPageType = "A";
                        }else if(currentIndex==1){
                            that.openHkStockPage(ifHasshow);
                            localStorage.marketPageType = "HK";
                        }else if(currentIndex==2){
                            that.openStockConnect(ifHasshow);
                            localStorage.marketPageType = "AH";
                        }else if(currentIndex==3){
                            that.openUSStock(ifHasshow);
                            localStorage.marketPageType = "US";
                        }

                        $("#tabMarket li").removeClass("on");
                        $("#tabMarket li").eq(currentIndex).addClass('on').attr({
                            "data-ifhasshow": 'true'
                        });
                    },
                    onSlideChangeStart:function(swiper){
                        var currentIndex=swiper.activeIndex;
                        var ifHasshow = $("#tabMarket li").eq(currentIndex).attr("data-ifhasshow");

                        if(currentIndex==0){
                            that.openChStockPage(ifHasshow);
                            localStorage.marketPageType = "A";
                        }else if(currentIndex==1){
                            that.openHkStockPage(ifHasshow);
                            localStorage.marketPageType = "HK";
                        }else if(currentIndex==2){
                            that.openStockConnect(ifHasshow);
                            localStorage.marketPageType = "AH";
                        }else if(currentIndex==3){
                            that.openUSStock(ifHasshow);
                            localStorage.marketPageType = "US";
                        }

                        $("#tabMarket li").removeClass("on");
                        $("#tabMarket li").eq(currentIndex).addClass('on').attr({
                            "data-ifhasshow": 'true'
                        });
                    }
                });

                $('#tabMarket li').tap(function(){
                    var tabOrder=$(this).index();
                    $('#tabMarket li').removeClass('on');
                    $(this).addClass('on');
                    swiper.slideTo(tabOrder, 200);
                });
            }

        },

        initScroller1:function(){
            if($.os.ios==undefined){
                $('#marketSwiper,#scrollerHolder1,#scrollerHolder2,#scrollerHolder3,#scrollerHolder4').css({
                    "height": 'auto'
                });
                $('.topLoading').addClass('none');
                return
            }
            var that=this;
            this.scroller1=$('#scrollerHolder1').iscrollRefresh({
                useIscroll:true,
                momentum:false,
                startY:-40,
                minFreshDistance:0,
                bottomTriggerDistance:60,
                scrollStart:function(){
                  that.scrollDomLock=true;
                },
                scrollEnd:function(){
                  that.scrollDomLock=false;
                },
                loadNew:function(){
                    $('#scrollerHolder1 .topLoading span').html('正在载入...');
                    $('#scrollerHolder1 .topLoading').addClass('rotating');
                    that.createChIndex();
                    that.createCashflows();
                    that.createPopularIndustry();
                    that.createPopularTopic();
                    that.createIncreaseList();
                    that.createDeclineList();
                    that.createTurnoverRateList();
                    setTimeout(function(){
                        $('#scrollerHolder1 .topLoading span').html('下拉刷新');
                        $('#scrollerHolder1 .topLoading').removeClass('rotating');
                        that.scroller1.loadNewFinish();
                    },400);
                },
                overMinDistance:function(){
                  $('#scrollerHolder1 .topLoading span').html('释放刷新');
                }
            });
            this.setIscrollBlank();
        },
        initScroller2:function(){
            if($.os.ios==undefined){
                $('#marketSwiper,#scrollerHolder1,#scrollerHolder2,#scrollerHolder3,#scrollerHolder4').css({
                    "height": 'auto'
                });
                $('.topLoading').addClass('none');
                return
            }
            var that=this;
            this.scroller2=$('#scrollerHolder2').iscrollRefresh({
                useIscroll:true,
                startY:-40,
                minFreshDistance:0,
                bottomTriggerDistance:60,
                scrollStart:function(){
                  that.scrollDomLock=true;
                },
                scrollEnd:function(){
                  that.scrollDomLock=false;
                },
                loadNew:function(){
                    $('#scrollerHolder2 .topLoading span').html('正在载入...');
                    $('#scrollerHolder2 .topLoading').addClass('rotating');
                    that.createHkIndex();
                    that.createMainBoard();
                    that.createStartUpBoard();
                  setTimeout(function(){
                    $('#scrollerHolder2 .topLoading span').html('下拉刷新');
                    $('#scrollerHolder2 .topLoading').removeClass('rotating');
                    that.scroller2.loadNewFinish();
                  },400);
                },
                overMinDistance:function(){
                  $('#scrollerHolder2 .topLoading span').html('释放刷新');
                }
            });
            this.setIscrollBlank();
        },
        initScroller3:function(){
            if($.os.ios==undefined){
                $('#marketSwiper,#scrollerHolder1,#scrollerHolder2,#scrollerHolder3,#scrollerHolder4').css({
                    "height": 'auto'
                });
                $('.topLoading').addClass('none');
                return
            }
            var that=this;
            this.scroller3=$('#scrollerHolder3').iscrollRefresh({
            useIscroll:true,
            startY:-40,
            minFreshDistance:0,
            bottomTriggerDistance:60,
            scrollStart:function(){
              that.scrollDomLock=true;
            },
            scrollEnd:function(){
              that.scrollDomLock=false;
            },
            loadNew:function(){
                $('#scrollerHolder3 .topLoading span').html('正在载入...');
                $('#scrollerHolder3 .topLoading').addClass('rotating');
                that.createStockConnectIndex();
                that.createShanghaiStockConnect();
                that.createHongkongStockConnect();
                that.createAHStockConnect();
              setTimeout(function(){
                $('#scrollerHolder3 .topLoading span').html('下拉刷新');
                $('#scrollerHolder3 .topLoading').removeClass('rotating');
                that.scroller3.loadNewFinish();
              },400);
            },
            overMinDistance:function(){
              $('#scrollerHolder3 .topLoading span').html('释放刷新');
            }
          });
          this.setIscrollBlank();
        },
        initScroller4:function(){
            if($.os.ios==undefined){
                $('#marketSwiper,#scrollerHolder1,#scrollerHolder2,#scrollerHolder3,#scrollerHolder4').css({
                    "height": 'auto'
                });
                $('.topLoading').addClass('none');
                return
            }
            var that=this;
            this.scroller4=$('#scrollerHolder4').iscrollRefresh({
            useIscroll:true,
            startY:-40,
            minFreshDistance:0,
            bottomTriggerDistance:60,
            scrollStart:function(){
              that.scrollDomLock=true;
            },
            scrollEnd:function(){
              that.scrollDomLock=false;
            },
            loadNew:function(){
                $('#scrollerHolder4 .topLoading span').html('正在载入...');
                $('#scrollerHolder4 .topLoading').addClass('rotating');
                that.createUSIndex();
                that.createChUpRank();
                that.createChDownRank();
                that.create500DownRank();
                that.create500UpRank();
              setTimeout(function(){
                $('#scrollerHolder4 .topLoading span').html('下拉刷新');
                $('#scrollerHolder4 .topLoading').removeClass('rotating');
                that.scroller4.loadNewFinish();
              },400);
            },
            overMinDistance:function(){
              $('#scrollerHolder4 .topLoading span').html('释放刷新');
            }
          });
          this.setIscrollBlank();
        },


        openUSStock:function(ifHasshow){    //美股tab
            var that=this;

            this.uSStockAction();

            if(ifHasshow=="true"){
                return;
            }

            this.setIscrollBlank();
            this.initScroller4();

            this.createUSIndex();
            this.createChUpRank();
            this.createChDownRank();
            this.create500DownRank();
            this.create500UpRank();

        },
        uSStockAction:function(){
            this.usIndexAction         = setTimeout(this.createUSIndex.bind(this),this.pollInterval);
            this.chUpRankAction        = setTimeout(this.createChUpRank.bind(this),this.pollInterval);
            this.chDownRankAction      = setTimeout(this.createChDownRank.bind(this),this.pollInterval);
            this.u500DownRankAction    = setTimeout(this.create500DownRank.bind(this),this.pollInterval);
            this.u500UpRankAction      = setTimeout(this.create500UpRank.bind(this),this.pollInterval);
        },
        clearUSStockAction:function(){
            clearInterval(this.usIndexAction);
            clearInterval(this.chUpRankAction);
            clearInterval(this.chDownRankAction);
            clearInterval(this.u500DownRankAction);
            clearInterval(this.u500UpRankAction);
        },
        create500DownRank:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:17,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:2,
                    plateQuoteType:11
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var DownRankData = JSON.parse(data.content).vPlateQuoteDesc;

                    var dataType = "500DownRank";
                    that.stockDetailList[dataType] = DownRankData;
                    for(var i= 0,j=DownRankData.length;i<j;i++){
                        var p = DownRankData[i];
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.sSecNameFormatted = $.adjustFontSize(p.sSecName)
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#usListTemplate").html();
                    var chDownRankHtml = $.compiler(templateDOm,{"templateData":DownRankData});
                    $("#500DownRank").html(chDownRankHtml);

                    //refresh
                    that.setIscrollBlank();
                    // that.scroller4.refresh();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        create500UpRank:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:17,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:1,
                    plateQuoteType:11
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var chDownRankData = JSON.parse(data.content).vPlateQuoteDesc;

                    var dataType = "500UpRank";
                    that.stockDetailList[dataType] = chDownRankData;
                    for(var i= 0,j=chDownRankData.length;i<j;i++){
                        var p = chDownRankData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.sSecNameFormatted = $.adjustFontSize(p.sSecName);
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#usListTemplate").html();
                    var chDownRankHtml = $.compiler(templateDOm,{"templateData":chDownRankData});
                    $("#500UpRank").html(chDownRankHtml);

                    //refresh
                    that.setIscrollBlank();
                    // that.scroller4.refresh();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        createChDownRank:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:17,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:2,
                    plateQuoteType:10
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var chDownRankData = JSON.parse(data.content).vPlateQuoteDesc;

                    var dataType = "chDownRank";
                    that.stockDetailList[dataType] = chDownRankData;
                    for(var i= 0,j=chDownRankData.length;i<j;i++){
                        var p = chDownRankData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.sSecNameFormatted = $.adjustFontSize(p.sSecName);
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#usListTemplate").html();
                    var chDownRankHtml = $.compiler(templateDOm,{"templateData":chDownRankData});
                    $("#chDownRank").html(chDownRankHtml);

                    //refresh
                    that.setIscrollBlank();
                    // that.scroller4.refresh();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        createChUpRank:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:17,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:1,
                    plateQuoteType:10
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var chUpRankData = JSON.parse(data.content).vPlateQuoteDesc;
                    var dataType = "chUpRank";
                    that.stockDetailList[dataType] = chUpRankData;
                    for(var i= 0,j=chUpRankData.length;i<j;i++){
                        var p = chUpRankData[i];
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.sSecNameFormatted = $.adjustFontSize(p.sSecName);
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#usListTemplate").html();
                    var chUpRankHtml = $.compiler(templateDOm,{"templateData":chUpRankData});
                    $("#chUpRank").html(chUpRankHtml);

                    //refresh
                    that.setIscrollBlank();
                    // that.scroller4.refresh();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        createUSIndex:function(){
            var options = {
                url:this.serverUrl+'getSecInfo',
                data:{
                    action:'quote',
                    seccode:"1705DJI|1705IXIC|1705SPX"
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var indexData = JSON.parse(data.content).vSecQuote;

                    var dataType = "USIndex";
                    that.stockDetailList[dataType] = indexData;
                    for(var i= 0,j=indexData.length;i<j;i++){
                        var p = indexData[i];
                        if(p.sSecName == ""){
                            if(i==0){
                                p.sSecName = "道琼斯指";
                            }else if(i==1){
                                p.sSecName = "纳斯达克";
                            }else if(i==2){
                                p.sSecName = "标普500";
                            }
                        }


                        var indexChangeDom = p.fClose> p.fNow?'<div class="item_info2 num_fall"><span>-'
                        +(p.fClose-p.fNow).toFixed(2)+'</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>':
                        '<div class="item_info2 num_rise"><span>+'
                        +(p.fNow-p.fClose).toFixed(2)+'</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>';

                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        var indexNowDom = p.fClose> p.fNow?'<div class="item_info1 num_fall arrow_down">'+p.fNow+'</div>':
                        '<div class="item_info1 num_rise arrow_up">'+p.fNow+'</div>';
                        p.indexNowDom = indexNowDom;
                        p.indexChangeDom = indexChangeDom;
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#indexTemplate").html();
                    var indexHtml = $.compiler(templateDOm,{"templateData":indexData});
                    $("#usIndexList").html(indexHtml);
                    //refresh
                    that.setIscrollBlank();
                    // that.scroller4.refresh();
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        openStockConnect:function(ifHasshow){   //沪港通
            var that=this;

            this.stockConnectAction();

            if(ifHasshow=="true"){
                return;
            }

            this.setIscrollBlank();
            this.initScroller3();

            this.createStockConnectIndex();
            this.createShanghaiStockConnect();
            this.createHongkongStockConnect();
            this.createAHStockConnect();
        },
        stockConnectAction:function(){
            this.stockConnectIndexAction         = setInterval(this.createStockConnectIndex.bind(this),this.pollInterval);
            this.shanghaiStockConnectAction      = setInterval(this.createShanghaiStockConnect.bind(this),this.pollInterval);
            this.hongkongStockConnectAction      = setInterval(this.createHongkongStockConnect.bind(this),this.pollInterval);
            this.AHStockConnectAction            = setInterval(this.createAHStockConnect.bind(this),this.pollInterval);
        },
        clearStockConnectAction:function(){
            clearInterval(this.stockConnectIndexAction);
            clearInterval(this.shanghaiStockConnectAction);
            clearInterval(this.hongkongStockConnectAction);
            clearInterval(this.AHStockConnectAction);
        },
        createAHStockConnect:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'AHQuote',
                    colType:120,
                    start:0,
                    count:10,
                    sortType:2
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }

                    var AHStockConnectData = JSON.parse(data.content).vAHPlateDesc;

                    var dataType = "AHStockConnect";
                    for(var i= 0,j=AHStockConnectData.length;i<j;i++){
                        var p = AHStockConnectData[i];
                        p.hStockDom  = that.createAhUpdownDom(p.fHKNow, p.fHKIncrease);
                        p.aStockDom  = that.createAhUpdownDom(p.fANow, p.fAIncrease*100);
                        p.haStockDom = that.upsAndDownSDomCreate(p.fANow, p.fHKNow*that.fRmbHkExchangeRate,true);
                        p.dataType = dataType;
                        p.sHKFontSizeSecName = $.adjustFontSize(p.sHKSecName,0.3)
                        p.sDtSecCode = p.sHKDtSecCode;
                        p.sSecName   = p.sHKSecName;
                    }
                    that.stockDetailList[dataType] = AHStockConnectData;
                    var templateDOm = $("#AHStockConnectTemplate").html();
                    var HongkongStockConnectHtml = $.compiler(templateDOm,{"templateData":AHStockConnectData});

                    var AHTitle = '<li class="table_title bdb">\
                        <div>名称</div>\
                        <div>H股(延)</div>\
                        <div>A股</div>\
                        <div>溢价(H/A)</div>\
                        </li>';
                    $("#AHStockConnect").html(AHTitle+HongkongStockConnectHtml);
                    
                    //refresh
                    that.setIscrollBlank();
                    // that.scroller3.refresh();
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        createAhUpdownDom:function(now,increase){
            if(now == "0"){
                return '<b class="num_stop">--</b><b class="num_stop">--</b>';
            }
            if(increase>0){
                return '<b class="num_rise">'+now.toFixed(2)+'</b><b class="num_rise">+'+increase.toFixed(2)+'%</b>';
            }else if(increase==0){
                return '<b class="num_stop">'+now.toFixed(2)+'</b><b class="num_stop">'+increase.toFixed(2)+'%</b>';
            }else{
                return '<b class="num_fall">'+now.toFixed(2)+'</b><b class="num_fall">'+increase.toFixed(2)+'%</b>';
            }
        },
        createShanghaiStockConnect:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:2,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:1,
                    plateQuoteType:12
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var ShanghaiStockConnectData = JSON.parse(data.content).vPlateQuoteDesc;

                    var dataType = "ShanghaiStockConnect";
                    that.stockDetailList[dataType] = ShanghaiStockConnectData;
                    for(var i= 0,j=ShanghaiStockConnectData.length;i<j;i++){
                        var p = ShanghaiStockConnectData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.fNowPrecised=p.fNow;
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.dataType = dataType;
                    }
                    var templateDOm = $("#increaseListTemplate").html();
                    var ShanghaiStockConnectHtml = $.compiler(templateDOm,{"templateData":ShanghaiStockConnectData});
                    $("#ShanghaiStockConnectList").html(ShanghaiStockConnectHtml);
                    
                    //refresh
                    that.setIscrollBlank();
                    // that.scroller3.refresh();
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        createHongkongStockConnect:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:2,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:1,
                    plateQuoteType:8
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var HongkongStockConnectData = JSON.parse(data.content).vPlateQuoteDesc;

                    var dataType = "HongkongStockConnect";
                    that.stockDetailList[dataType] = HongkongStockConnectData;
                    for(var i= 0,j=HongkongStockConnectData.length;i<j;i++){
                        var p = HongkongStockConnectData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.fNowPrecised=p.fNow;
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.sSecNameFormatted = $.adjustFontSize(p.sSecName);
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#mainBoardTemplate").html();
                    var HongkongStockConnectHtml = $.compiler(templateDOm,{"templateData":HongkongStockConnectData});
                    $("#HongkongStockConnectList").html(HongkongStockConnectHtml);
                    
                    //refresh
                    that.setIscrollBlank();
                    // that.scroller3.refresh();
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        createStockConnectIndex:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'AHBalance'
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var stockConnectIndexData = JSON.parse(data.content).stAHExtendInfo;
                    that.fRmbHkExchangeRate = stockConnectIndexData.fRmbHkExchangeRate;
                    localStorage.fRmbHkExchangeRate = that.fRmbHkExchangeRate;
                    var stockConnectIndexHtml = '<li><strong><b>'+stockConnectIndexData.fSHHKFlowInto+'</b>亿</strong><span>沪股通当日剩余额度</span></li>\
                                                 <li><strong><b>'+stockConnectIndexData.fHKSHFlowInto+'</b>亿</strong><span>港股通当日剩余额度</span></li>';
                    $("#stockConnectIndex").html(stockConnectIndexHtml);
                    
                    //refresh
                    that.setIscrollBlank();
                    // that.scroller3.refresh();
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        openHkStockPage:function(ifHasshow){    //港股tab
            var that=this;

            this.hkStockActions();

            if(ifHasshow=="true"){
                return;
            }

            this.setIscrollBlank();
            this.initScroller2();

            this.createHkIndex();
            this.createMainBoard();
            this.createStartUpBoard();
        },
        hkStockActions:function(){
            this.hkIndexAction         = setInterval(this.createHkIndex.bind(this),this.pollInterval);
            this.mainBoardAction       = setInterval(this.createMainBoard.bind(this),this.pollInterval);
            this.startUpBoardAction    = setInterval(this.createStartUpBoard.bind(this),this.pollInterval);
        },
        clearHkStockActions:function(){
            clearInterval(this.hkIndexAction);
            clearInterval(this.mainBoardAction);
            clearInterval(this.startUpBoardAction);
        },
        createStartUpBoard:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:2,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:1,
                    plateQuoteType:7
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var startUpBoardData = JSON.parse(data.content).vPlateQuoteDesc;

                    var dataType = "startUpBoard";
                    that.stockDetailList[dataType] = startUpBoardData;
                    for(var i= 0,j=startUpBoardData.length;i<j;i++){
                        var p = startUpBoardData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.fNowPrecised=p.fNow;
                        p.sSecNameFormatted = $.adjustFontSize(p.sSecName);
                        p.dataType = dataType;
                    }
                    var templateDOm = $("#mainBoardTemplate").html();
                    var mainBoardHtml = $.compiler(templateDOm,{"templateData":startUpBoardData});
                    $("#startUpBoardList").html(mainBoardHtml);

                    //refresh
                    that.setIscrollBlank();
                    // that.scroller2.refresh();
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        createMainBoard:function(){
            var that=this;
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:2,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:1,
                    plateQuoteType:6
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var mainBoardData = JSON.parse(data.content).vPlateQuoteDesc;

                    var dataType = "mainBoard";
                    that.stockDetailList[dataType] = mainBoardData;
                    for(var i= 0,j=mainBoardData.length;i<j;i++){
                        var p = mainBoardData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.fNowPrecised=p.fNow;
                        p.sSecNameFormatted = $.adjustFontSize(p.sSecName);
                        p.dataType=dataType;
                    }
                    var templateDOm = $("#mainBoardTemplate").html();
                    var mainBoardHtml = $.compiler(templateDOm,{"templateData":mainBoardData});
                    $("#mainBoardList").html(mainBoardHtml);

                    //refresh
                    that.setIscrollBlank();
                    // that.scroller2.refresh();
                    
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        createHkIndex:function(){
            var options = {
                url:this.serverUrl+'getSecInfo',
                data:{
                    action:'quote',
                    seccode:"1605HSI|1605HSCEI|1605HSCCI"
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var indexData = JSON.parse(data.content).vSecQuote;

                    var dataType = "HKIndex";
                    that.stockDetailList[dataType] = indexData;
                    for(var i= 0,j=indexData.length;i<j;i++){
                        var p = indexData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        if(p.fNow == '--'){
                            var indexNowDom = p.fClose> p.fNow?'<div class="item_info1">'+p.fNow+'</div>':
                            '<div class="item_info1">'+p.fNow+'</div>';
                        }else{
                            var indexNowDom = p.fClose> p.fNow?'<div class="item_info1 num_fall arrow_down">'+p.fNow+'</div>':
                            '<div class="item_info1 num_rise arrow_up">'+p.fNow+'</div>';
                        }

                        if(p.fNow == '--'){
                            var indexChangeDom = '<div class="item_info2 num_stop"><span>--</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>';
                        }else{
                            var indexChangeDom = p.fClose> p.fNow?'<div class="item_info2 num_fall"><span>-'
                            +(p.fClose-p.fNow).toFixed(2)+'</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>':
                            '<div class="item_info2 num_rise"><span>+'
                            +(p.fNow-p.fClose).toFixed(2)+'</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>';
                        }

                        p.indexNowDom = indexNowDom;
                        p.indexChangeDom = indexChangeDom;
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#indexTemplate").html();
                    var indexHtml = $.compiler(templateDOm,{"templateData":indexData});
                    $("#hkIndexList").html(indexHtml);

                    //refresh
                    that.setIscrollBlank();
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        openChStockPage:function(ifHasshow){        //沪深tab
            var that=this;

            this.chStockActions();   //开始刷新动作

            if(ifHasshow=="true"){
               return;
            }

            this.setIscrollBlank();
            this.initScroller1();

            this.createChIndex();
            this.createCashflows();
            this.createPopularIndustry();
            this.createPopularTopic();
            this.createIncreaseList();
            this.createDeclineList();
            this.createTurnoverRateList();
        },
        chStockActions:function(){
            this.chIndexAction         = setInterval(this.createChIndexHtml.bind(this),this.pollInterval);
            this.cashflowsAction       = setInterval(this.createCashflows.bind(this),this.pollInterval);
            this.popularIndustryAction = setInterval(this.createPopularIndustry.bind(this),this.pollInterval);
            this.popularTopicAction    = setInterval(this.createPopularTopic.bind(this),this.pollInterval);
            this.increaseListAction    = setInterval(this.createIncreaseList.bind(this),this.pollInterval);
            this.declineListAction     = setInterval(this.createDeclineList.bind(this),this.pollInterval);
            this.turnoverRateListAction= setInterval(this.createTurnoverRateList.bind(this),this.pollInterval);
        },
        clearChStockActions:function(){
            clearInterval(this.chIndexAction);
            clearInterval(this.cashflowsAction);
            clearInterval(this.popularIndustryAction);
            clearInterval(this.popularTopicAction);
            clearInterval(this.increaseListAction);
            clearInterval(this.declineListAction);
            clearInterval(this.turnoverRateListAction);
        },
        createChIndexHtml:function(){
            var options = {
                url:this.serverUrl+'getSecInfo',
                data:{
                    action:'quote',
                    seccode:"0105000001|0005399001|0005399006|0005399005|0005399300|0105000905|0306IFLX0|0306IHLX0"
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var indexData = JSON.parse(data.content).vSecQuote;
                    var indexData1 = [];
                    var indexData2 = [];
                    var indexData3 = [];
                    for(var i= 0,j=indexData.length;i<j;i++){
                        var p = indexData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        var indexNowDom = p.fClose> p.fNow?'<div class="item_info1 num_fall arrow_down">'+p.fNow+'</div>':
                        '<div class="item_info1 num_rise arrow_up">'+p.fNow+'</div>';
                        var indexChangeDom = p.fClose> p.fNow?'<div class="item_info2 num_fall"><span>-'
                        +(p.fClose-p.fNow).toFixed(2)+'</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>':
                        '<div class="item_info2 num_rise"><span>+'
                        +(p.fNow-p.fClose).toFixed(2)+'</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>';
                        p.indexNowDom = indexNowDom;
                        p.indexChangeDom = indexChangeDom;
                        p.dataType = "CHIndex";
                        if(i>=0&&i<3){
                            indexData1.push(p);
                        }else if(i>=3&&i<6){
                            indexData2.push(p);
                        }else if(i>=6&&i<=7){
                            indexData3.push(p);
                        }
                    }

                    var templateDOm = $("#indexHtmlTemplate").html();
                    var indexHtml1 = $.compiler(templateDOm,{"templateData":indexData1});
                    var indexHtml2 = $.compiler(templateDOm,{"templateData":indexData2});
                    var indexHtml3 = $.compiler(templateDOm,{"templateData":indexData3});
                    var ulDom = $("#indexList").find("ul");
                    ulDom.eq(0).html(indexHtml1);
                    ulDom.eq(1).html(indexHtml2);
                    ulDom.eq(2).html(indexHtml3);
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        createChIndex:function(){
            var that=this;
            var options = {
                url:this.serverUrl+'getSecInfo',
                data:{
                    action:'quote',
                    seccode:"0105000001|0005399001|0005399006|0005399005|0005399300|0105000905|0306IFLX0|0306IHLX0"
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var indexData = JSON.parse(data.content).vSecQuote;
                    that.stockDetailList["CHIndex"] = indexData;

                    for(var i= 0,j=indexData.length;i<j;i++){
                        var p = indexData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        var indexNowDom = p.fClose> p.fNow?'<div class="item_info1 num_fall arrow_down">'+p.fNow+'</div>':
                            '<div class="item_info1 num_rise arrow_up">'+p.fNow+'</div>';
                        var indexChangeDom = p.fClose> p.fNow?'<div class="item_info2 num_fall"><span>-'
                                            +(p.fClose-p.fNow).toFixed(2)+'</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>':
                            '<div class="item_info2 num_rise"><span>+'
                            +(p.fNow-p.fClose).toFixed(2)+'</span><span>'+that.upsAndDownSDomCreate(p.fClose, p.fNow,false)+'</span></div>';
                        p.indexNowDom = indexNowDom;
                        p.indexChangeDom = indexChangeDom;
                        p.dataType = "CHIndex";
                    }
                    var templateDOm = $("#indexTemplate").html();
                    var indexHtml = $.compiler(templateDOm,{"templateData":indexData});
                    $("#indexList .swiper-wrapper").html(indexHtml);

                    var wapperHeight = $("#indexWapper .market_list").height();
                    $("#indexWapper").css("height",wapperHeight);

                    //开始沪深指数swiper
                    new Swiper('#indexList',{
                        onSlideChangeStart:function(swiper){
                            var currentIndex=swiper.activeIndex;
                            $('#indexSwiperPager span').removeClass('active');
                            $('#indexSwiperPager span').eq(currentIndex).addClass('active');
                        }
                    });

                    //refresh
                    that.setIscrollBlank();
                },
                error:function(data){
                }
            };

            var that = this;
            $.getData(options);
        },
        createCashflows:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'StockCapital',
                    start:0,
                    count:1,
                    seccode:"0105000001|0005399001"
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var cashData = JSON.parse(data.content).vCapitalMainFlowDesc;
                    if(cashData.length<=1){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var cashTotle = cashData[0].fZljlr+cashData[1].fZljlr;
                    var absCashTotle = Math.abs(cashTotle);
                    if(absCashTotle>100000000){
                        var cashTotleNumb = (absCashTotle/100000000).toFixed(1)+"亿";
                    }else if(cashTotle>10000){
                        var cashTotleNumb = (absCashTotle/10000).toFixed(1)+"万";
                    }else{
                        var cashTotleNumb = absCashTotle;
                    }


                    if(cashTotle>=0){
                        $("#cashflows").find("span").html(cashTotleNumb);
                        $("#cashflows").find("span").addClass("num_rise");
                    }else{
                        $("#cashflows").find("span").addClass("num_fall");
                        $("#cashflows").find("span").html("-"+cashTotleNumb);
                    }
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        createTurnoverRateList:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:0,
                    colType:36,
                    start:0,
                    count:10,
                    plateQuoteType:1,
                    sortType:1
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var turnoverRateListData = JSON.parse(data.content).vPlateQuoteDesc;

                    var dataType = "TurnoverRate";
                    that.stockDetailList[dataType] = turnoverRateListData;

                    for(var i= 0,j=turnoverRateListData.length;i<j;i++){
                        var p = turnoverRateListData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.turnoverRate = Math.round(p.fFhsl*10000)/100+"%";
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#turnoverRateListTemplate").html();
                    var turnoverRateListHtml = $.compiler(templateDOm,{"templateData":turnoverRateListData});
                    $("#turnoverRateList").html(turnoverRateListHtml);

                    //refresh
                    that.setIscrollBlank();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        createDeclineList:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:0,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:2,
                    plateQuoteType:1
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var declineListData = JSON.parse(data.content).vPlateQuoteDesc;
                    var dataType = "declineList";
                    that.stockDetailList[dataType] = declineListData;

                    for(var i= 0,j=declineListData.length;i<j;i++){
                        var p = declineListData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#declineListTemplate").html();
                    var declineListHtml = $.compiler(templateDOm,{"templateData":declineListData});
                    $("#declineList").html(declineListHtml);

                    //refresh
                    that.setIscrollBlank();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        createIncreaseList:function(){
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:0,
                    colType:14,
                    start:0,
                    count:10,
                    sortType:1,
                    plateQuoteType:1
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }

                    var increaseListData = JSON.parse(data.content).vPlateQuoteDesc;
                    var dataType = "increaseList";
                    that.stockDetailList[dataType] = increaseListData;

                    for(var i= 0,j=increaseListData.length;i<j;i++){
                        var p = increaseListData[i];
                        p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.shortSeccode = p.sDtSecCode.substr(4,8);
                        p.dataType = dataType;
                    }

                    var templateDOm = $("#increaseListTemplate").html();
                    var increaseListHtml = $.compiler(templateDOm,{"templateData":increaseListData});
                    $("#increaseList").html(increaseListHtml);

                    //refresh
                    that.setIscrollBlank();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        createPopularTopic:function(){      //热门主题
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'ConcList',
                    start:0,
                    count:9
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }
                    var popularTopicData = JSON.parse(data.content).vConcQuoteDesc;
                    var dataType = "popularTopic";
                    for(var i= 0,j=popularTopicData.length;i<j;i++){
                        var p = popularTopicData[i];
                        p.fNow = p.fNow==0?'0.00':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.popularTopicUpsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.dataType = dataType;
                    }
                    var templateDOm = $("#popularTopicTemplate").html();
                    var popularTopicHtml = $.compiler(templateDOm,{"templateData":popularTopicData});
                    $("#popularTopic").html(popularTopicHtml);

                    //refresh
                    that.setIscrollBlank();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        createPopularIndustry:function(){      //热门行业
            var options = {
                url:this.serverUrl+'getMarketQuotation',
                data:{
                    action:'quote',
                    marketType:0,
                    colType:14,
                    start:0,
                    count:6,
                    sortType:1,
                    plateQuoteType:3
                },
                success:function(data){
                    if(that.scrollDomLock){ return;}
                    if(data.ret!=0||data.content == ""){
                        $.alert("数据异常，请稍后重试");
                        return;
                    }

                    var popularIndustryData = JSON.parse(data.content).vPlateQuoteDesc;
                    var dataType = "popularIndustryList";
                    for(var i= 0,j=popularIndustryData.length;i<j;i++){
                        var p = popularIndustryData[i];
                        //p.fNow = p.fNow==0?'--':p.fNow.toFixed(p.iTpFlag);
                        p.upsAndDownSDom = that.upsAndDownSDomCreate(p.fClose, p.fNow,true);
                        p.HeadUpsAndDownSDom = that.upsAndDownSDomCreate(p.fHeadClose, p.fHeadNow,false);
                        p.fHeadNow = p.fHeadNow==0?'--':p.fHeadNow.toFixed(p.iTpFlag);
                        p.dataType = dataType;
                    }
                    var templateDOm = $("#popularIndustryTemplate").html();
                    var popularIndustryHtml = $.compiler(templateDOm,{"templateData":popularIndustryData});
                    $("#popularIndustry").html(popularIndustryHtml);

                    //refresh
                    that.setIscrollBlank();
                },
                error:function(data){
                }
            };
            var that = this;
            $.getData(options);
        },
        upsAndDownSDomCreate:function(close,now,ifDom){
            if(now == 0||now=="--"||close == 0){
                return ifDom?'<div class="item_info1 num_stop">--</div>':'--';
            }else{
                if(close>now){
                    var numb ="-" + ((close-now)/close*100).toFixed(2)+"%";
                    return ifDom?'<div class="item_info1 num_fall">'+numb+'</div>':numb;
                }else if(close==now){
                    return ifDom?'<div class="item_info1 num_stop">0.00</div>':0.00;
                }else{
                    var numb ="+" + ((now-close)/close*100).toFixed(2)+"%";
                    return ifDom?'<div class="item_info1 num_rise">'+numb+'</div>':numb;
                }
            }
        },
        popularTopicUpsAndDownSDomCreate:function(close,now,ifDom){
            if(now == 0||close == 0){
                return ifDom?'<div class="item_info1 num_stop">0.00</div>':'0.00';
            }else{
                if(close>now){
                    var numb ="-" + ((close-now)/close*100).toFixed(2)+"%";
                    return ifDom?'<div class="item_info1 num_fall">'+numb+'</div>':numb;
                }else if(close==now){
                    return ifDom?'<div class="item_info1 num_stop">0.00</div>':0.00;
                }else{
                    var numb ="+" + ((now-close)/close*100).toFixed(2)+"%";
                    return ifDom?'<div class="item_info1 num_rise">'+numb+'</div>':numb;
                }
            }
        },
        clearActions:function(){
            this.clearChStockActions();
            this.clearHkStockActions();
            this.clearStockConnectAction();
            this.clearUSStockAction();
        },
        setIscrollBlank:function(){
            if($.os.ios==undefined){
                return;
            }
            var that=this,
                currentSlide=$('#tabMarket li.on').index(),
                scrollerWrapperHeight,
                scrollerContentHeight,
                lack;

            currentSlide+=1;
            
            $('#scrollerHolder'+currentSlide).find('.scroller_blank').remove();

            scrollerWrapperHeight=$('#scrollerHolder'+currentSlide).height();
            scrollerContentHeight=$('#scrollerHolder'+currentSlide).find('.scroller').height();
            lack=scrollerWrapperHeight-scrollerContentHeight;

            // $.mobileConsole(scrollerWrapperHeight,scrollerContentHeight);

            if(lack>-50){
                $('#scrollerHolder'+currentSlide).find('.scroller').append('<div class="scroller_blank" style="height:'+(lack+50)+'px;"></div>');
            }

            if(currentSlide==1 && that.scroller1!=null){
                that.scroller1.refresh();
            }else if(currentSlide==2 && that.scroller2!=null){
                that.scroller2.refresh();
            }else if(currentSlide==3 && that.scroller3!=null){
                that.scroller3.refresh();
            }else if(currentSlide==4 && that.scroller4!=null){
                that.scroller4.refresh();
            }
        },
        addEvent:function(){
            var that = this;

            if($.os.ios==undefined){    //如为非ios
                $("#tabMarket").on("tap","li",function(e){
                    var type = $(this).attr("data-type");
                    var ifHasshow = $(this).attr("data-ifhasshow");
                    var tabOrder=$(this).index();

                    that.clearActions();
                    switch (type){
                        case "chStock":
                            localStorage.marketPageType = "A";
                            that.openChStockPage(ifHasshow);
                            break;
                        case "hkStock":
                            localStorage.marketPageType = "HK";
                            that.openHkStockPage(ifHasshow);
                            break;
                        case "stockConnect":
                            localStorage.marketPageType = "AH";
                            that.openStockConnect(ifHasshow);
                            break;
                        case "usStock":
                            localStorage.marketPageType = "US";
                            that.openUSStock(ifHasshow);
                            break;
                    }
                    
                    $("#tabMarket li").removeClass("on");
                    $("#tabMarket li").eq(tabOrder).addClass('on').attr({
                        "data-ifhasshow": 'true'
                    });
                    $('#marketSwiper .tab_content').addClass('none');
                    $('#marketSwiper .tab_content').eq(tabOrder).removeClass('none');
                });
            };
            
            $.touchEvent($(".stocks_list,.market_list,.market_list_slider"),"li",function(e){
                var secCode = $(this).attr("data-seccode");
                var secName = encodeURIComponent($(this).attr("data-secname"));
                var type = $(this).attr("data-type");
                var dataType = $(this).attr("data-datatype");
                if(secCode == "null"||secName == "null"){
                    return;
                }
                switch(type){
                    case "stock":
                        $.stockDetailSkipWithData(secCode,secName,that.stockDetailList[dataType]);
                        return;
                        break;
                    case "industry":
                        var hrefUrl = $.getAjaxHost("commonHref")+"rankCommonList.html?ranktype=popularIndustryList&secName="+secName+"&secCode="+secCode+'&webviewType=commonRefreshType';
                        break;
                    case "topic":
                        if(that.from == "web"){
                            location.href = $.getAjaxHost("commonHref")+"stockDetail.html?secCode="+secCode+"&secName="+secName+"&dt_from=web"+'&webviewType=subjectType';
                        }else if(that.from == "app"){
                            location.href = $.getAjaxHost("commonHref")+"stockDetail.html?secCode="+secCode+"&secName="+secName+"&dt_from=app"+'&webviewType=subjectType';
                        }else{
                            location.href = $.getAjaxHost("commonHref")+"stockDetail.html?secCode="+secCode+"&secName="+secName+"&dt_from=app"+'&webviewType=subjectType';
                        }
                        return;
                        break;
                    case "index":
                        if(secCode == "more"){
                            var hrefUrl = $.getAjaxHost("commonHref")+"indexList.html?type=indexlist"+'&webviewType=commonRefreshType';
                        }else{
                            $.stockDetailSkipWithData(secCode,secName,that.stockDetailList[dataType]);
                            return;
                        }
                        break;
                }

                var dt_from = $.getQueryString("dt_from");
                if(dt_from == "app"){
                    location.href = hrefUrl+"&dt_from=app";
                }else if(dt_from == "web"){
                    location.href = hrefUrl+"&dt_from=web";
                }else{
                    location.href = hrefUrl+"&dt_from=app";
                }
            });

            $.touchEvent($("#cashflows"),function(){
                var dt_from = $.getQueryString("dt_from");
                var hrefUrl = $.getAjaxHost("commonHref")+"capitalflows.html";
                if(dt_from == "app"){
                    location.href = hrefUrl+"?dt_from=app"+'&webviewType=commonRefreshType';
                }else if(dt_from == "web"){
                    location.href = hrefUrl+"?dt_from=web"+'&webviewType=commonRefreshType';
                }else{
                    location.href = hrefUrl+"?dt_from=app"+'&webviewType=commonRefreshType';
                }
            })

            $.touchEvent($("body"),"a",function(){
                var dt_from = $.getQueryString("dt_from");
                var hrefType = $(this).attr("data-href");
                if(hrefType=='popularTopic'){
                    var hrefUrl = $.getAjaxHost("commonHref")+"rankCommonList.html?ranktype="+hrefType+'&webviewType=searchRefreshType';
                }else{
                    var hrefUrl = $.getAjaxHost("commonHref")+"rankCommonList.html?ranktype="+hrefType+'&webviewType=commonRefreshType';
                }
                if(dt_from == "app"){
                    location.href = hrefUrl+"&dt_from=app";
                }else if(dt_from == "web"){
                    location.href = hrefUrl+"&dt_from=web";
                }else{
                    location.href = hrefUrl+"&dt_from=app";
                }
            })

            $.touchEvent($(".accordion_title span"),function(){
                var thisDom = $(this).parent();
                var domId = thisDom.attr("data-connectDiv");
                if(thisDom.hasClass("accordion_title_on")){
                    thisDom.removeClass("accordion_title_on");
                    $("#"+domId).addClass("none");
                }else{
                    thisDom.addClass("accordion_title_on");
                    $("#"+domId).removeClass("none");
                }

                that.setIscrollBlank();
                
            })
        }
    }
    marketQuotation.init();
})();