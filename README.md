# table-sorter #
##非table结构列表下的排序

<img src="screenshot1.png" height="422" width="384" alt="">

##表格排序用法 ##
```
  $('#wave-in-similar').sortTable({
      tableTitle:$('#wave-in-similar .table_col2 .table_title'),  //表头对象，必须唯一
      tableRowClass:'sort_row',                                   //排序行的class
      relativeTable:$('#wave-in-similar .table_col1'),            //关联排序列对象
      relativeRowClass:'row_relative',                            //关联行的class
  });
```
##功能##
   可针对某一列进行数据排序，可指定排序类型为float和date


##使用需知##
  1. 依赖zepto插件,用到了选择器和tap事件
  2. 程序在输出时，必须给数据元素的标签上加上data-value=10.23 之类的数据，这样数据格式的变化不会影响排序时值的获取
  3. 程序在输出时，必须给需要排序的行加上特定class名，并作为tableRowClass参数传入
  4. 排序列的表头列需加上data-type属性，来指定此列按照什么类型排序，float为浮点，data为日期，如果不写data-type默认为string  <span class="has_filter" data-type="float">1周</span>
  5. 结构中必须给排序列表头加上class=has_filter  标明此列需要排序
  6. 升序时插件会给表头列元素加上class名 filter_ascending  降序加上class名 filter_dscending
  7. 如果某个数据不参与排序，则data-value='' 设为空即可始终处于排序队尾 
  8. 如存在联动列，需要给每个排序行加上data-order属性，值递增
		`<div data-order="0" class="table_item bdb sort_row">...</div>`






##示例html结构##

  ```
	<ul class="stocks_list" id="stocksListTitle">
	    <li class="table_title table_title_white bdb">
	          <div>名称</div>
	          <div class="has_filter" data-type="float">当前价</div>
	          <div class="has_filter filter_ascending" data-type="float">日涨幅</div>
	    </li>
	</ul>


	<ul class="stocks_list" id="stocksList">
	    <li class="sort_row bdb">
	          <div><strong>统一企业</strong><span>000789</span></div>
	          <div data-value="36.8"><b class="num">36.8</b></div>
	          <div data-value="4.25"><b class="num_rise">+4.25%</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>青岛啤酒</strong><span>000211</span></div>
	          <div data-value="28.32"><b class="num">28.32</b></div>
	          <div data-value="45.15"><b class="num_rise">+45.15%</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>华电国际</strong><span>601211</span></div>
	          <div data-value="6.33"><b class="num">6.33</b></div>
	          <div data-value="51.23"><b class="num_rise">+51.23%</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>中国联塑</strong><span>00789</span></div>
	          <div data-value="15.26"><b class="num">15.26</b></div>
	          <div data-value="31.15"><b class="num_rise">+31.15%</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>绿城中国</strong><span>00789</span></div>
	          <div data-value="17.46"><b class="num">17.46</b></div>
	          <div data-value="1.25"><b class="num_rise">+1.25%</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>中国建筑</strong><span>00789</span></div>
	          <div data-value="13.46"><b class="num">13.46</b></div>
	          <div data-value="4.45"><b class="num_rise">+4.45%</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>信义光能</strong><span>00789</span></div>
	          <div data-value="25.46"><b class="num">25.46</b></div>
	          <div data-value="-12.5"><b class="num_fall">-12.50%</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>华能国际</strong><span>00789</span></div>
	          <div data-value="34.46"><b class="num">34.46</b></div>
	          <div data-value=""><b class="num_stop">停牌</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>远洋地产</strong><span>00789</span></div>
	          <div data-value="28.46"><b class="num">28.46</b></div>
	          <div data-value="7.45"><b class="num_rise">+7.45%</b></div>
	    </li>
	    <li class="sort_row bdb">
	          <div><strong>恒大地产</strong><span>00789</span></div>
	          <div data-value="55.46"><b class="num">55.46</b></div>
	          <div data-value="9.50"><b class="num_rise">+9.50%</b></div>
	    </li>
	</ul>
  ```
