/**
 * v1.0.0 by chenfeng
 * https://github.com/fengxxc/calendar-school/
*/
;(function($){
	$.fn.caleScho = function() {
		console.time();
		
		var $self = $(this);
		// arguments[0] is 'options'
		if (!arguments.length || typeof arguments[0] == 'object') {

			var opts = arguments[0] || {};
			
			var htmlStr = '<table>';
			// 初始年，默认为当前年
			var initYear = opts.initYear? parseInt(opts.initYear) : new Date().getFullYear();
			// 起始月，默认为1月
			var startMonth = opts.monthRange? parseInt(opts.monthRange[0]) : 1;
			var startDate = new Date(initYear, startMonth-1, 1); // 2017-?-1
			// 结束月，默认为12月
			var endMonth = opts.monthRange? parseInt(opts.monthRange[1]) : 12;
			// 这年的1月1日星期几？如果是星期天（0），则返回7
			var startDay = startDate.getDay() == 0? 7 : startDate.getDay();
			// 设置一周从哪天开始，星期天为0，星期一为1，以此类推，默认星期一 
			var weekStart = parseInt(opts.weekStart) || 1;
			// 设置是否显示周次，默认显示
			var showWeekNum = opts.showWeekNum || true;
			// 设置周次从第几周开始，默认从第一周开始
			var weekNumStart = opts.weekNumStart || 1;
			
			// join thead
			if (showWeekNum === true) {
				htmlStr += '<thead><tr><th></th><th></th><th colspan="5">'+ initYear +'年</th><th></th><tr><th class="weeknum">周次</th>';
			} else {
				htmlStr += '<thead><tr><th></th><th colspan="5">'+ initYear +'年</th><th></th><tr>';
			}
			var weekArr = ['日', '一', '二', '三', '四', '五', '六'];
			for (var i = 0, iDay = weekStart; i < 7; i++) {
				htmlStr += '<th>'+weekArr[iDay]+'</th>';
				(iDay+1) >= 7 ? iDay=0 : iDay+=1;
			}
			htmlStr += '</tr></thead>';

			// join tbody
			htmlStr += '<tbody><tr>';
			// 周数
			var weekNum = 1;
			 
			// 第一天前面空多少格
			var spanNum = startDay-weekStart;
			if (spanNum != 7 && spanNum != 0) {
				if (showWeekNum === true) {
					var wn = (weekNum-weekNumStart+1) < 1? "":(weekNum-weekNumStart+1)
					htmlStr += '<td class="weeknum">'+ wn +'</td>';
					weekNum += 1;
				}
				for (var i = 0; i < spanNum; i++) {
					htmlStr += '<td> </td>';
				}
			}

			var iDate = startDate;
			var nextYear = initYear + 1;
			// 初始化CalendarConverter对象
			var cc = new CalendarConverter;
			var lunar = null;
			// join tbody>tr>td for eveyday
			while (iDate.getFullYear() < nextYear && iDate.getMonth() < endMonth) {
				var className = iDate.getMonth() %2 ==0 ? 'even day' : 'odd day';
				// 高亮今天
				(iDate.getDate() == new Date().getDate() && iDate.getMonth() == new Date().getMonth())? className+=' today' : null;
				// 如果这一天是这周的第一天，那就另起一行
				if (iDate.getDay() == weekStart) {
					if (showWeekNum === true) {
						var wn = (weekNum-weekNumStart+1) < 1? "":(weekNum-weekNumStart+1)
						htmlStr += '</tr><tr><td class="weeknum">'+ wn +'</td>';
						weekNum += 1;
					} else {
						htmlStr += '</tr><tr>';
					}
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
				htmlStr += '<td class="'+className+'">';
				
				// 如果这天是1日，就加上月份
				if (iDate.getDate() == 1) 
					htmlStr += '<strong class="month">' + (iDate.getMonth()+1) + '</strong>/';
				htmlStr += iDate.getDate();
				
				// htmlStr += lunar.lunarMonth + "月"; // 农历月份
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
				htmlStr += '<div class="lunarInfo">' + lnInfo + '</div>';
				htmlStr += '</td>'
				iDate = new Date(iDate.getFullYear(), iDate.getMonth(), iDate.getDate()+1);
			}
			htmlStr += '</tr></tbody></table>';
			// 渲染dom前的回调函数，参数为该dom的jQuery对象
			opts.bDrawCallback && typeof opts.bDrawCallback=='function'? opts.bDrawCallback.call($self, $(htmlStr)) :null;
			$self.html(htmlStr);

			// bind event
			$('body').on('click', function (e) {
				$self.find('.active').removeClass('active');
			})
			$self.on('click', 'td', function (e) {
				e.stopPropagation();
				$(this).toggleClass('active');
			})
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