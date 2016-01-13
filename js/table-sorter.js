/*
 * jquery/zepto table-sorter
 *
 * Copyright 2015 MaskFang
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

$.fn.sortTable = function(options) {
  if(this.length==0){
    console.error('未找到排序表格，请仔细检查选中其中名字是否正确！');
    return;
  }
  if(!options.tableTitle || options.tableTitle.length!=1){
    console.error('未指定表头 tableTitle, 或表头不唯一');
    return;
  }
  if(!options.tableRowClass){
    console.error('未指定排序行class名 tableRowClass');
    return;
  }
  if(options.relativeTable){
    if(!options.relativeRowClass ){
      console.error('未指定关联排序行class名 relativeRowClass');
      return;
    }
  }
  if(options.tableTitle.find('.has_filter').length==0){
    console.info('排序表头内没有指定排序项');
    return {
      refreshSort:function(){}
    }
  }
  

  var that=this,
      tableTitle=options.tableTitle,
      tableRowClass=options.tableRowClass,
      colIndex,                                     //当前排序的列index,从0开始
      currentSortOrder,
      rows=this.find('.'+tableRowClass),            //每一行的元素集合
      tempArr=[],                                   //用来排序的数组
      oldArr=[],                                    //用来保存原始顺序,暂未用到
      tableId=this.attr('id'),                      //排序table的id名
      dataType,                                     //表头排序类别
      oFragment=document.createDocumentFragment(),  //html碎片，用来收集排序好的html
      tableCellTag=tableTitle.find('*').get(0).tagName;  //表头列元素的标签名

  if(options.relativeTable){
    var relativeTable=options.relativeTable,
        relativeRowClass=options.relativeRowClass,
        relativeRows=relativeTable.find('.'+relativeRowClass);
  }

  function  generateCompareTRs(iCol, dataType,sortType) {
      var sortType = sortType;
      var vValue1,vValue2;
      var sortReverse=-1;
       return    function  compareTRs(oTR1, oTR2) {
          vValue1 = convert(oTR1.children[iCol].getAttribute('data-value'),dataType,sortType);
          vValue2 = convert(oTR2.children[iCol].getAttribute('data-value'),dataType,sortType);
          // console.log(vValue1,vValue2);
          if(sortType == "asc"){
            sortReverse=1;
          }
          if  (vValue1 < vValue2) {
             return  -1*sortReverse;
          }  else if(vValue1>vValue2) {
             return  1*sortReverse;
          }  else  {
             return  0;
          }
      };
  }
  function  convert(value, dataType, sortType) {
       switch  (dataType) {
       case   "int" :
          {
            if(value=='--'){
              return 0
            }else{
              return parseInt(value);
            }
          }
       case   "float" :
          {
            if(value=='' || value==' '){
                if(sortType=="asc"){
                    return  +10000000000;
                }else{
                    return  -10000000000;
                }
            }else{
              return parseFloat(value);
            }
          }
       case   "date" :
           return  new Date(Date.parse(value));
       default :
           return  value.toString();
      }
  }

  function sortRelative(){
    // return;
    var tempArray=[];
    var temprows=that.find('.'+tableRowClass);
    for (var i = 0; i < temprows.length; i++) {
      tempArray.push(temprows[i].getAttribute('data-order'));
    };
    for (var i = 0; i < tempArray.length; i++) {
      // console.log(relativeRows[tempArray[i]]);
      oFragment.appendChild(relativeRows[tempArray[i]]);
    };
    relativeTable.append(oFragment);
  }
  
  //收集列表每一行，为排序做准备
  for( i = 0; i<rows.length; i++) {
      tempArr.push(rows[i]);
  }


  //如果默认已经有排序，则获得默认排序所在的列数，和排序类别float/date，和排序方式
  if( $('.filter_ascending').length>0 ){
    colIndex=$('.filter_ascending').index();
    dataType=$('.filter_ascending').attr('data-type');
    currentSortOrder='asc';
  }else if( $('.filter_dscending').length>0 ){
    colIndex=$('.filter_dscending').index();
    dataType=$('.filter_dscending').attr('data-type');
    currentSortOrder='desc';
  }

  
  //点击后开始排序
  tableTitle.find(tableCellTag).tap(function(){
    if( !$(this).hasClass('has_filter') ){
      return
    }
    console.time('sort time');
    //刷新排序列index和dataType
    colIndex=$(this).index()/1;
    dataType=$(this).attr('data-type');

    //如果当前没有开始排序，就开始升序排序
    var currentElement=options.tableTitle.find(tableCellTag).eq(colIndex);
    if( !currentElement.hasClass('filter_ascending') && !currentElement.hasClass('filter_dscending') ){
      tableTitle.find(tableCellTag).removeClass('filter_ascending filter_dscending');
      tempArr.sort(generateCompareTRs(colIndex, dataType,"desc"));
      currentElement.addClass('filter_dscending');
      currentSortOrder='desc';
    //如果当前是升序，就进行降序
    }else if( currentElement.hasClass('filter_ascending') ){
      tableTitle.find(tableCellTag).removeClass('filter_ascending filter_dscending');
      tempArr.sort(generateCompareTRs(colIndex, dataType,"desc"));
      currentElement.addClass('filter_dscending');
      currentSortOrder='desc';
    //如果当前是降序，就进行升序
    }else{
      tableTitle.find(tableCellTag).removeClass('filter_ascending filter_dscending');
      tempArr.sort(generateCompareTRs(colIndex, dataType,"asc"));
      currentElement.addClass('filter_ascending');
      currentSortOrder='asc';
    }
    for  (var j = 0; j <tempArr.length; j++) { 
      oFragment.appendChild(tempArr[j]);
    }
    that.append(oFragment);

    //如果有关联表格，则排序之
    if(options.relativeTable){
      sortRelative();
    }
    console.timeEnd('sort time');

  });
  


  //数据有刷新后重新排序
  function refreshSort(){
    tempArr.sort(generateCompareTRs(colIndex, dataType, currentSortOrder));
    for  (var j = 0; j <tempArr.length; j++) {
      oFragment.appendChild(tempArr[j]);
    }
    that.append(oFragment);
    if(options.relativeTable){
      sortRelative();
    }
  }

  return {
    refreshSort:function(){
      refreshSort();
    }
  }
  

}