/**
 * v1.0.0 by chenfeng
 * https://github.com/fengxxc/calendar-school/
*/
;(function($){
	$.fn.caleScho = function() {
		function joinTableStr() {
			var htmlStrArr = [];
			htmlStrArr.push('<table>');
			// join thead
			if (showWeekNum === true) {
				htmlStrArr.push('<thead><tr><th></th><th></th><th colspan="5">'+ initYear +'年</th><th></th><tr><th class="weeknum">周次</th>');
			} else {
				htmlStrArr.push('<thead><tr><th></th><th colspan="5">'+ initYear +'年</th><th></th><tr>');
			}
			var weekArr = ['日', '一', '二', '三', '四', '五', '六'];
			for (var i = 0, iDay = weekStart; i < 7; i++) {
				htmlStrArr.push('<th>'+weekArr[iDay]+'</th>');
				(iDay+1) >= 7 ? iDay=0 : iDay+=1;
			}
			htmlStrArr.push('</tr></thead>');

			// join tbody
			htmlStrArr.push('<tbody>');
			// 第几周，从1开始
			var weekNum = 1;
			// 第一天前面空多少格
			var spanNum = startDay-weekStart;
			// 视图上的起始日
			var vStartD = new Date(initYear, startMonth-1, startDate.getDate()-spanNum);
			var iDate = vStartD;
			// 初始化CalendarConverter对象
			var cc = new CalendarConverter;
			var lunar = null;
			// join tbody>tr>td for eveyday
			var endDate = new Date(initYear, endMonth, 1);
			// 结束日期是星期几
			var endDay = endDate.getDay() == 0? 7 : endDate.getDay();
			var vEndD = new Date(initYear, endMonth, 1+(7-(endDay-weekStart)));
			while (iDate < vEndD) {
				var className = '';
				
				
				if (iDate.getFullYear() == initYear) {
					className = iDate.getMonth() %2 ==0 ? 'even day' : 'odd day';
					// 高亮今天
					(iDate.getDate() == new Date().getDate() && iDate.getMonth() == new Date().getMonth())? className+=' today' : null;
				} else {
					// 非当前年灰化
					iDate.getFullYear() == initYear? null : className+=' unObjYear';
				}
				// 如果这一天是这周的第一天，那就另起一行
				if (iDate.getDay() == weekStart) {
					// 周次
					var wn = (weekNum-weekNumStart+1) < 1? "":(weekNum-weekNumStart+1);
					// 每行的note
					// htmlStrArr.push('<td class="note" data-weeknum="' + wn + '"></td>');
					// 是否显示周次
					if (showWeekNum === true) {
						htmlStrArr.push('<tr><td class="weeknum">'+ wn +'</td>');
					} else {
						htmlStrArr.push('<tr>');
					}
					weekNum += 1;
				}
				// lunar: 这天的农历对象
				/* 格式=>
				 *  {
					      cDay: "戊戌"
				        , cMonth: "丁未"
				        , cYear: "壬辰"
				        , isLeap: false             // 该月是否为闰月
				        , lDay: 18
				        , lMonth: 6
				        , lYear: 2012
				        , lunarDay: "十八"
				        , lunarFestival: ""
				        , lunarMonth: "六"
				        , lunarYear: "龙"
				        , sDay: 5
				        , sMonth: 8
				        , sYear: 2012
				        , solarFestival: ""         // 节日
				        , solarTerms: ""            // 节气
				        , week: "日"                // 周几
				    }
				 *  
				 */
				lunar = cc.solar2lunar(iDate);
				// td for eveyday
				if (opts.beforeShowDay && typeof opts.beforeShowDay == 'function') {
					// var bsdResult =  opts.beforeShowDay.call($self, iDate);
					var bsdResult =  opts.beforeShowDay.call($self, iDate, lunar);
					if (bsdResult && 'class' in bsdResult) className += ' ' + bsdResult.class;
				}
				// 公历字符串：2017-01-01
				var caleStr = iDate.getFullYear() + '-' + (iDate.getMonth()+1) + '-' + iDate.getDate();
				htmlStrArr.push('<td class="' + className + '" data-cale="' + caleStr + '">');
				
				// 如果这天是1日，就加上月份
				if (iDate.getDate() == 1) 
					htmlStrArr.push('<strong class="month">' + (iDate.getMonth()+1) + '</strong>/');
				htmlStrArr.push(iDate.getDate());
				
				// htmlStrArr.push(lunar.lunarMonth + "月"); // 农历月份
				// 如果是农历节日，就显示农历节日
				var lnInfo = '';
				if (lunar.lunarFestival) {
					lnInfo = lunar.lunarFestival;
				} else {
					// 如果是农历一日，就显示农历月
					if (lunar.lDay == 1) {
						lnInfo = lunar.lunarMonth + "月";
					} else {
						lnInfo = lunar.lunarDay;
					}
				}
				// var lnInfo = lunar.lunarFestival? lunar.lunarFestival : lunar.lunarDay;
				htmlStrArr.push('<div class="lunarInfo">' + lnInfo + '</div>');
				htmlStrArr.push('</td>');
				iDate = new Date(iDate.getFullYear(), iDate.getMonth(), iDate.getDate()+1);
			}
			// htmlStrArr.push '<td class="note"></td></tr></tbody>';
			htmlStrArr.push('</tr></tbody>');
			var modelStrArr = 	['<div id="caleSchoModel" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel">',
								'<div class="modal-dialog modal-sm" role="document">',
									'<div class="modal-content">',
										'<div class="modal-header">',
											'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>',
											'<h4 class="modal-title" id="">编辑事件</h4>',
										'</div>',
										'<div class="modal-body">',
											'<form class="form-horizontal" role="form">',
												'<div class="form-group">',
													'<label class="col-md-3 control-label">时间</label>',
													'<div class="col-md-8"><input type="text" class="form-control" readOnly id="caleScho_rangeTime" value=""/></div>',
												'</div>',
												'<div class="form-group">',
													'<label class="col-md-3 control-label">事件名称</label>',
													'<div class="col-md-8"><input type="text" class="form-control"  placeholder="事件名称"  id=""/></div>',
												'</div>',
												'<div class="form-group">',
													'<label class="col-md-3 control-label">事件类型</label>',
													'<div class="col-md-8">',
														'<select class="form-control" id = "" name="">',
															'<option value="">请选择</option>',
														'</select>',
													'</div>',
												'</div>',
												'<div class="form-group">',
													'<label class="col-md-3 control-label">备注</label>',
													'<div class="col-md-8"><textarea class="form-control" name="" id="" cols="30" rows="4"></textarea></div>',
												'</div>',
												'<div class="form-group">',
													'<div class="col-md-8 col-md-offset-3">',
														'<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>&emsp;<button type="button" class="btn btn-primary">提交</button>',
													'</div>',
												'</div>',
											'</form>',
										'</div>',
											/*'<div class="modal-footer">',
												'<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button><button type="button" class="btn btn-primary">提交</button>',
											'</div>',*/
										
									'</div>', 
								'</div>', 
							'</div>'];
			htmlStrArr.push('<tfoot></tfoot>');
			htmlStrArr.push('</table>');
			htmlStrArr.push(modelStrArr.join(''))
			return htmlStrArr.join('');
		}
		console.time();
		
		var $self = $(this);
		// arguments[0] is 'options'
		if (!arguments.length || typeof arguments[0] == 'object') {

			var opts = arguments[0] || {};
			
			// 初始年，默认为当前年
			var initYear = opts.initYear? parseInt(opts.initYear) : new Date().getFullYear();
			// 起始月，默认为1月
			var startMonth = opts.monthRange? parseInt(opts.monthRange[0]) : 1;
			// 起始日，默认为1月1日
			var startDate = new Date(initYear, startMonth-1, 1); // 2017-?-1
			// 结束月，默认为12月
			var endMonth = opts.monthRange? parseInt(opts.monthRange[1]) : 12;
			// 这年的1月1日星期几？如果是星期天（0），则返回7
			var startDay = startDate.getDay() == 0? 7 : startDate.getDay();
			// 设置一周从哪天开始，星期天为0，星期一为1，以此类推，默认星期一 
			// var weekStart = parseInt(opts.weekStart) || 1;
			var weekStart = opts.weekStart !=null && (typeof opts.weekStart=='number'||typeof opts.weekStart=='string')? parseInt(opts.weekStart) : 1;
			// 设置是否显示周次，默认显示
			var showWeekNum = opts.showWeekNum || true;
			// 设置周次从第几周开始，默认从第一周开始
			var weekNumStart = opts.weekNumStart || 1;

			var oStr = joinTableStr();
			// 渲染dom前的回调函数，参数为该dom的jQuery对象
			opts.bDrawCallback && typeof opts.bDrawCallback=='function'? opts.bDrawCallback.call($self, $(oStr)) :null;
			$self.html(oStr);

			// bind event
			$('body').on('click', function (e) {
				$self.find('.active').removeClass('active');
				$self.find('.caleScho_edit').remove();
			});
			$('.day').on('click', function (e) {
				e.stopPropagation();
				// 如果点的是'edit'
				if (e.target.tagName == 'A' || e.target.tagName == 'I') {
					var valArr = [];
					$self.find('.active').each(function () {
						// valStr += $(this).data('cale');
						valArr.push($(this).data('cale'));
					});
					var valStr = valArr.join(',')
					$('#caleScho_rangeTime').val(valStr);
					// $('#caleScho_rangeTime').text(valStr);
					$('#caleSchoModel').modal('show');
				} else {
					// var editBtn = '<a href="" class="caleScho_edit btn btn-success btn-xs"><i class="glyphicon glyphicon-edit"></i></a>';
					var editBtn = '<a href="javascript:void(0);" class="caleScho_edit"><i></i></a>';
					$self.find('.caleScho_edit').remove();
					$(this).toggleClass('active');
					$self.find('.active')? $self.find('.active:last').prepend(editBtn) : null;
					// $self.find('.active')? $self.find('.active:last').after(editBtn) : null;

				}
			})
			$('.caleScho_edit').on('click', function (e) {
				e.stopPropagation();
				e.preventDefault();
				return false;
			});
			// 取消edit模态框冒泡
			$('#caleSchoModel').on('click', function (e) {
				e.stopPropagation();
			});
		} else if (typeof arguments[0] == 'string' && arguments[0] != '') {
			switch (arguments[0]) {
				case 'show':
					$self.show(); break;
				case 'hidden': case 'hide':
					$self.hide(); break;
				case 'distory':
					$self.remove();
			}
		}
		console.timeEnd();
		return {
			/*options: function (newopts) {
				if (newopts && typeof newopts=='object') {
					opts = newopts;
				} else {
					return opts;
				}
			}*/
		}
	};
}(jQuery));