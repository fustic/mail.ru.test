;
(function($, window, document, undefined) {
    var Calendar = {
        /**
         * Функция инициализации календаря
         * @param options объект параметрами, которые пришли от клиента
         * @param elem
         */
        init: function(options, elem) {
            var self = this;
            //сохраняем ссылку на оригинальный элемент
            self.elem = elem;
            self.$elem = $(elem);
            //это будет сам календарь
            self.$holder = null;
            //расширяем дефолтные options теми, что прислал клиент
            self.options = $.extend({}, $.fn.calendar.options, options);
            var date = new Date();
            //для внутреннего пользования создадим объект параметры
            self.params = {
                //текущая дата
                currentDate : new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                //классы для элементов, необходимые для вешания событий
                classes: {
                    //предыдущий месяц
                    prevMonth: "iPrevMonth",
                    //следующий месяц
                    nextMonth: "iNextMonth",
                    //название месяца и год
                    titleMonth: "iTitleMonth",
                    //тело календаря
                    tableBody: "iCalendarBody",
                    //каждая отдельная дата
                    tableDate: "iDate"
                }
            }
            self.initEvents();
        },
        /**
         * Функция, которая либо создаст календарь, либо покажет его
         */
        createView: function() {
            var self = this,
                $elem = self.$elem,
                options = self.options,
                classes = self.params.classes;
            //если календарь еще не был создан, то создадим его
            if(self.$holder === null ){
                var $div = $("<div/>",{"class":"calendar-holder shadow"}).hide(),
                    $month = $("<div/>",{"class":"months"}),
                    $left = $("<span/>",{"class":classes.prevMonth+" prev-month pointer small",text:"<", title:"предыдущий месяц"}),
                    $right = $("<span/>",{"class":classes.nextMonth+" next-month pointer small",text:">", title:"следующий месяц"}),
                    $title = $("<span/>",{"class":classes.titleMonth+" title-month"}),
                    $table = $("<table/>",{"class":"calendar-table"}),
                    //создание шапки таблицы с названием дней - больше не перериосывается
                    $thead = $("<thead/>",{"class":"calendar-head"}).append("<tr><th>"+options.days.join("</th><th>")+"</th></tr>"),
                    $tbody = $("<tbody/>",{"class":classes.tableBody+" calendar-body"});
                $table.append($thead).append($tbody);
                $month.append($left).append($title).append($right);
                $div.append($month).append($table);
                $div.insertAfter($elem);
                self.$holder = $div;
                self.changeMonth();
            }
            //покажем созданный календарь
            self.$holder.show("fast").css({
                left: $elem.position().left || 0
            });
        },
        hideView: function(){
            this.$holder.hide("fast");
        },
        /**
         * Функция для вешания событий на элементы
         */
        initEvents: function() {
            var self = this,
                $elem = self.$elem;
            //клик на инпут для вызова календаря
            $elem.off("click").on("click",function(){
                //вызовем создание календаря
                self.createView();
                var $holder = self.$holder,
                    classes = self.params.classes,
                    nextMonth = "."+classes.nextMonth,
                    prevMonth = "."+classes.prevMonth,
                    tableDate = "."+classes.tableDate;
                //клик на календарь в прошлый месяц
                $holder.off("click", nextMonth).on("click", nextMonth, function(){
                    self.nextMonth();
                });
                //клик на календарь в следующий месяц
                $holder.off("click", prevMonth).on("click", prevMonth,function(){
                    self.prevMonth();
                });
                //при клике на дату в календаре подставим эту дату в инпут и закроем календарь
                $holder.off("click", tableDate).on("click", tableDate,function(){
                    var $this = $(this);
                    //если у даты есть значение
                    if($this.data("date")){
                        self.setDateToView(new Date($this.data("date")));
                        self.hideView();
                    }
                });
                //если в инпут не было выставлено значение - проставим туда тукущую дату
                if(!$elem.val().length) {
                    self.setDateToView(self.params.currentDate);
                }
            });
            $(document).off("keyup").on("keyup",function(e){
                if (e.keyCode == 27) {
                    self.hideView();
                }
            });
        },
        /**
         * Перелестнуть на предыдущий месяц
         */
        prevMonth:function(){
            this.params.currentDate.setMonth(this.params.currentDate.getMonth() - 1);
            this.changeMonth();
        },
        /**
         * Перелестнуть на следующий месяц
         */
        nextMonth:function(){
            this.params.currentDate.setMonth(this.params.currentDate.getMonth() + 1);
            this.changeMonth();
        },
        /**
         * Перерисовка месяца
         */
        changeMonth:function(){
            //меняем шапку календаря
            this.updateMonthTitle();
            //перерисовываем собственно сам календарь
            this.updateMonth();
        },
        /**
         * Смена шапки календаря
         */
        updateMonthTitle: function(){
            var self = this,
                //список месяцев
                months = self.options.months || [],
                currentDate = self.params.currentDate,
                //шапка календаря с месяцем и годом
                $month = self.$holder.find("."+self.params.classes.titleMonth);
            $month.html((months[currentDate.getMonth()] || "")+ " "+ currentDate.getFullYear());
        },
        /**
         * Перерисовка самого календаря
         */
        updateMonth:function(){
            var self = this,
                //Создаем массив с днями для текущего месяца
                days = self.generateMonthsDays(self.params.currentDate),
                day = {},
                //Тело таблицы, куда помещаются даты. Находим и чистим
                $table = self.$holder.find(".iCalendarBody").empty(),
                $tr = $("<tr/>");
            //для каждого дня из массива создадим ячейку и добавим ее в таблицу в нужную строку
            for (var i = 0, daysLen = days.length; i < daysLen; i++) {
                day = days[i];
                $tr.append($("<td/>",{
                    text: day.value === null ? " " : day.value.getDate(),
                    "class": day.value === null ? "" : "hasDate iDate pointer " + (day.isToday ? "current-date" : ""),
                    "data-date": day.value
                }));
                //если переходим на новую неделю - создаем новую строку
                if(i % 7 === 0){
                    $table.append($tr);
                    $tr = $("<tr/>");
                }
            }
            //добавляем в таблицу последнюю строку
            $table.append($tr);
        },
        /**
         * получить массив с днями для месяца
         * @param currentDate
         * @returns {Array}
         */
        generateMonthsDays: function(currentDate){
            //месяц либо задан, либо будет текущий
            currentDate = currentDate || new Date();
            //дата - первое число данного месяца
            var date = new Date(currentDate.getFullYear(), currentDate.getMonth()),
                days = [], i, d;
            //заполним пустые ячейки.. это случай когда 1-е число не понедельник
            for(i = 0, d = date.getDay(); i < d; i++) {
                days.push({
                    value: null,
                    isToday: false
                });
            }
            //пока не перейдем на следующий месяц - добавляем дни в массив.. с указанием текущей даты
            while(date.getMonth() === currentDate.getMonth()) {
                days.push({
                    value: new Date(date),
                    isToday: currentDate.getTime() === date.getTime()
                });
                date.setDate(date.getDate()+1);
            }
            //и дополняем массив пустыми ячейками для случая, когда последний день не воскресенье
            for(i = date.getDay(); i > 0 && i < 7; i++) {
                days.push({
                    value: null,
                    isToday: false
                });
            }
            return days;
        },
        /**
         * Обновляем дату в инпуте
         * @param date
         */
        setDateToView: function(date){
            date = date || new Date();
            var self = this,
                $elem = self.$elem,
                dd = date.getDate() < 10 ? "0" + date.getDate() : date.getDate(),
                mm = date.getMonth() < 9 ? "0" + (date.getMonth() + 1 ) : ( date.getMonth() + 1 );
            $elem.val(dd + "." + mm + "." + date.getFullYear());
        }

    };

    $.fn.calendar = function(options) {
        return this.each(function() {
            var calendar = Object.create(Calendar);

            calendar.init(options, this);

            $.data(this, 'calendar', calendar);
        });
    };

    $.fn.calendar.options = {
        months: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
        days: ["M", "T", "W", "T", "F", "S", "S"]
    };

})(jQuery, window, document);