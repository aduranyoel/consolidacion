(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) {

        define(['jquery'], function ($) {
            return factory($, window, document);
        });
    }
    else if (typeof exports === 'object') {

        module.exports = function (root, $) {

            if (!root) {
                root = window;
            }

            if (!$) {
                $ = typeof window !== 'undefined' ?
                    require('jquery') :
                    require('jquery')(root);
            }

            return factory($, root, root.document);
        };
    }
    else {

        factory(jQuery, window, document);
    }
}
    (function ($, window, document, undefined) {
        "use strict";

        var useDataTable = function (action, param, options) {

            if ($.fn.DataTable === undefined) throw new Error('NO SE ENCUENTRA "jQuery.fn.DataTable". PUEDE DESCARGARLO EN "https://datatables.net/"');
            var $this = $(this);
            action = action !== undefined ? action : undefined;
            param = param !== undefined ? param : undefined;
            options = options || {};
            if (typeof action === "object") options = action;
            if (typeof param === "object") options = param;
            var isInit = $.fn.DataTable.isDataTable($this[0]);
            var defaults = {
                "autoWidth": true,
                "info": false,
                "lengthChange": false,
                "lengthMenu": [10, 25, 50, 75, 100],
                "pageLength": 50,
                "pagingType": "numbers",
                "ordering": true,
                "searching": true,
                "serverSide": false,
                "scrollCollapse": true,
                "responsive": true,
                "colReorder": false,
                "fixedHeader": false,
                "dom": "<'usedatatable-top'>lfr<'usedatatable-header'>t<'usedatatable-footer'>ip<'usedatatable-bottom'>",
                "selection": false,
                "bPaginate": false,
                "paging": false,
                "bLengthChange": false,
                "destroy": true,
                "scrollY": true,
                "scrollX": true,
                "bAutoWidth": false,
                "order": [],
                "language": {
                    "zeroRecords": "No se encontraron registros",
                    "infoEmpty": "No se encontraron registros",
                    "search": "BUSCAR",
                    "paginate": {
                        "sFirst": "Primera",
                        "sPrevious": "Anterior",
                        "sNext": "Siguiente",
                        "sLast": "Última"
                    }
                }
            };

            var useOptions = $.extend({}, {
                selection: {
                    enabled: false,
                    type: 'click',
                    cursor: 'default',
                    color: 'none',
                    background: 'none',
                    callback: new Function
                },
                className: 'table',
                footer: false
            }, options.use ? options.use : {});

            var settings = $.extend({}, defaults, options);

            function fnAdjustColumnSizing(bRedraw) {

                var api = $this.dataTable().api(true).columns.adjust();
                var settings = api.settings()[0];
                var scroll = settings.oScroll;

                if (bRedraw === undefined || bRedraw) {
                    api.draw(false);
                }
                else if (scroll.sX !== "" || scroll.sY !== "") {
                    settings.oApi._fnScrollDraw(settings);
                }
            }
            function adjustEvent() {

                $(window).on('resize', fnAdjustColumnSizing);
            }
            function draw(settings) {

                if (useOptions.className && typeof useOptions.className === "string" && !$this.hasClass(useOptions.className)) $this.addClass(useOptions.className);
                if (useOptions.footer === true && $this[0].querySelector('tfoot') === null) {

                    var tfoot = document.createElement("tfoot");
                    var tr = document.createElement("tr");
                    for (var i = 0, len = settings.columns.length; i < len; i++) {
                        var th = document.createElement("th");
                        tr.appendChild(th);
                    }
                    tfoot.appendChild(tr);
                    $this[0].appendChild(tfoot);
                }

                $this.DataTable(settings);
                setTimeout(function () { fnAdjustColumnSizing(); }, 350);
                adjustEvent();
            }
            function redraw(complete) {

                $this.dataTable().api(true).draw(complete);
            }
            function cell(obj) {

                obj = $.isPlainObject(obj) ? obj : {};
                obj.x = obj.x || 0;
                obj.y = obj.y || 0;
                obj.data = obj.data || undefined;
                obj.draw = obj.draw === true ? true : false;
                var cell = $this.dataTable().api(true).cell(obj.x, obj.y);

                if (obj.data !== undefined) {

                    cell.data(obj.data).draw(obj.draw);
                } else {
                    return cell.data();
                }
            }
            function fnDeleteRow(target) {

                var rowtarget = Array.isArray(target) ? target : parseInt(target);
                var api = $this.dataTable().api(true);
                var rows = api.rows(rowtarget);
                rows.remove();
                api.draw();
            }
            function fnDestroy(remove) {

                $this.dataTable().api(true).destroy(remove);
            }
            function addRow(row) {

                if (Array.isArray(row) || $.isPlainObject(row)) {
                    Array.isArray(row) && (Array.isArray(row[0]) || $.isPlainObject(row[0])) ?
                        $this.DataTable().rows.add(row).draw() :
                        $this.DataTable().row.add(row).draw();
                }
            }
            function getData(id, target) {

                var val = Number.parseInt(id);
                if (isNaN(val)) {

                    var dataEleObj = target === 'row' ? $this.DataTable().rows().data()
                        : target === 'col' ? $this.DataTable().columns().data() : [];
                    var arrRes = [];
                    for (var i = 0, len = dataEleObj.length; i < len; i++) {
                        arrRes.push(dataEleObj[i]);
                    }
                    return arrRes;
                } else {
                    return target === 'row' ? $this.DataTable().row(val).data()
                        : target === 'col' ? $this.DataTable().column(val).data() : [];
                }
            }
            function suma(data) {

                var acumulador = 0;
                var target = $.isPlainObject(data) ? 'obj' : Array.isArray(data) ? 'arr' : null;
                var len = target === 'obj' ? Object.keys(data).length : target === 'arr' ? data.length : 0;

                for (var i = 0; i < len; i++) {
                    acumulador += parseFloat(data[target === 'obj' ? Object.keys(data)[i] : target === 'arr' ? i : i]) || 0;
                }
                return acumulador;
            }
            function total(id, target) {

                var val = Number.parseInt(id);
                var len = target === 'row' ? $this.DataTable().rows()[0].length
                    : target === 'col' ? $this.DataTable().columns()[0].length : 0;

                if (!Number.isNaN(val) && val < len) {

                    return Number.parseFloat(suma(target === 'row' ? $this.DataTable().rows(val).data()[0]
                        : target === 'col' ? $this.DataTable().columns(val).data()[0] : [])).toFixed(3);
                } else {

                    var arrSum = new Array;
                    for (var i = 0; i < len; i++) {
                        arrSum.push(Number.parseFloat(suma(target === 'row' ? $this.DataTable().rows(i).data()[0]
                            : target === 'col' ? $this.DataTable().columns(i).data()[0] : [])).toFixed(3));
                    }
                    return arrSum;
                }
            }
            function clear() {

                $this.DataTable().clear().draw();
            }
            function config() {
                var api = $this.dataTable().api(true);
                var settings = api.settings()[0];
                return settings;
            }

            if (useOptions.selection.enabled === true) {

                useOptions.selection.type = useOptions.selection.type || 'click';
                useOptions.selection.cursor = useOptions.selection.cursor || 'default';
                useOptions.selection.background = useOptions.selection.background || 'none';
                useOptions.selection.color = useOptions.selection.color || 'none';

                $this.on(useOptions.selection.type, 'tr', function () {

                    var row = $this.DataTable().row(this);
                    var data = row.data();
                    var index = row.index();
                    if (typeof useOptions.selection.callback === "function") useOptions.selection.callback.call(this, row, data, index);
                });
                $this.on('mouseenter', 'tr', function () {

                    this.style.cursor = useOptions.selection.cursor;
                    this.style.backgroundColor = useOptions.selection.background;
                    this.style.color = useOptions.selection.color;
                });
                $this.on('mouseleave', 'tr', function () {

                    this.style.cursor = 'default';
                    this.style.backgroundColor = '';
                    this.style.color = '';
                });
            }

            function help() {

                return '\n' +
                    'Acciones:\n\n' +
                    'help        (): Muestra esta ayuda\n' +
                    'draw        (settings?: object): Dibuja el DataTable (default)\n' +
                    'redraw      (): Redibuja el DataTable\n' +
                    'data        (idRow?: string || number): Retorna datos de la(s) fila(s)\n' +
                    'dataCol     (idCol?: string || number): Retorna datos de la(s) columna(s)\n' +
                    'cell        (obj?: object): Retorna o Asigna el data de la celda\n' +
                    'add         (row(s): array || object): Agrega fila(s)\n' +
                    'del         (idRow(s): array || string || number): Elimina la(s) fila(s)\n' +
                    'clear       (): Elimina todas las filas\n' +
                    'destroy     (): Destruye el DataTable\n' +
                    'settings    (): Retorna la configuracion del DataTable\n' +
                    'adjust      (): Ajusta la(s) columna(s)\n' +
                    'adjustEvent (): Agrega al (window.onresize) el ajuste de columnas\n' +
                    'totalCol    (idCol?: string || number): Retorna sumatoria de columna(s)\n' +
                    'totalRow    (idRow?: string || number): Retorna sumatoria de fila(s)\n\n' +
                    'Configuraciones Extra:\n' +
                    '...\n' +
                    'use: {\n' +
                    '    ...                                     // Oppciones de useDataTable\n' +
                    '}\n' +
                    '...\n\n' +
                    'selection: {\n' +
                    '    enabled: true,                          // On/Off (default: "false")\n' +
                    '    type: "click",                          // Evento? (default: "click")\n' +
                    '    cursor: "default",                      // Cursor? (default: "default")\n' +
                    '    color: "white",                         // Color? (default: "none")\n' +
                    '    background: "black",                    // Background? (default: "none")\n' +
                    '    callback: function(row, data, index){   // Accion del evento\n' +
                    '\n' +
                    '    },\n' +
                    ' className: "table-responsive wrap etc",    // Clases? (default: "table nowrap")\n' +
                    ' footer: true                               // Generar "tfoot"? (default: "false")\n\n' +
                    ' Estructura de "<div>": \n\n' +
                    ' div.usedatatable-top\n' +
                    ' div.usedatatable-header\n' +
                    '  -------\n' +
                    ' \| TABLE \|\n' +
                    '  -------\n' +
                    ' div.usedatatable-footer\n' +
                    ' div.usedatatable-bottom\n';
            }

            switch (action) {
                case "help":
                    return help();
                default:
                case "draw":
                    if (Object.keys(options).length === 0 && isInit === true) {
                        return redraw();
                    } else {
                        return draw(settings);
                    }
                case "redraw":
                    return redraw();
                case "data":
                    return getData(param, 'row');
                case "dataCol":
                    return getData(param, 'col');
                case "del":
                    return fnDeleteRow(param);
                case "add":
                    return addRow(param);
                case "totalCol":
                    return total(param, 'col');
                case "totalRow":
                    return total(param, 'row');
                case "clear":
                    return clear();
                case "adjustEvent":
                    return adjustEvent();
                case "adjust":
                    return fnAdjustColumnSizing();
                case "destroy":
                    return fnDestroy();
                case "cell":
                    return cell(param);
                case "settings":
                    return config();
            }
        };
        $.fn.useDataTable = useDataTable;
        $.fn.useDataTable.version = "1.0.14";
        return $.fn.useDataTable;
    }));