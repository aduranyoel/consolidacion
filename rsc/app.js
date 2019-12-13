function Dlg(message, type) {
    if (type === 'error')
        $('.modal-header').css({
            'background-color': '#e74c3c',
            color: 'white'
        });
    if (type === 'warning')
        $('.modal-header').css({
            'background-color': '#ffa500',
            color: 'white'
        });

    $('#mensage').html(message);
    $('#modalMensage').modal('show');
}
Dlg.error = function(message) {
    Dlg(message, 'error');
};
Dlg.warning = function(message) {
    Dlg(message, 'warning');
};
function Upload(ele) {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById(ele);

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof FileReader != 'undefined') {
            var reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function(e) {
                    try {
                        ProcessExcel(e.target.result, ele);
                    } catch (err) {
                        Dlg.error(err.stack);
                    }
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function(e) {
                    var data = '';
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    try {
                        ProcessExcel(data, ele);
                    } catch (err) {
                        Dlg.error(err.stack);
                    }
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            Dlg.warning('Este navegador no soporta HTML5.');
        }
    } else {
        Dlg.warning('Por favor seleccione un archivo de Excel valido.');
    }
}
function ProcessExcel(datos, ele) {
    var workbook = XLSX.read(datos, {
        type: 'binary'
    });
    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    if (Array.isArray(excelRows) && excelRows.length > 0) {
        var colKeys = Object.keys(excelRows[0]);
        colKeys = colKeys.map(function(c) {
            return {
                data: c,
                title: c
            };
        });
        $('#btn_' + ele).attr('disabled', false);
        $('#tabla_' + ele)
            .closest('.container-tabla')
            .css({
                display: 'block',
                borderColor: 'rgba(0, 0, 0, 0)'
            });
        $('#tabla_' + ele).useDataTable({
            columns: colKeys,
            data: excelRows,
            scrollY: 'calc(100vh - 140px)',
            scrollX: true,
            dom: 'Bft',
            buttons: ['copy', 'excel', 'pdf', 'print'],
            initComplete: function() {
                $('#tabla_' + ele + '_filter input').attr('class', 'form-control');
                $('#tabla_' + ele).off('dblclick', 'td');
                $('#tabla_' + ele).on('dblclick', 'td', function() {
                    var currentCell = $('#tabla_' + ele)
                        .DataTable()
                        .cell(this);
                    var col = currentCell[0][0].column;
                    var row = currentCell[0][0].row;
                    var $this = $(this);
                    $this.html(
                        '<input id="tabla_' +
                            ele +
                            '_col' +
                            col +
                            '_row' +
                            row +
                            '" class="form-control" type="text" value="' +
                            currentCell.data() +
                            '"/>'
                    );

                    $('#tabla_' + ele + '_col' + col + '_row' + row).off('blur');
                    $('#tabla_' + ele + '_col' + col + '_row' + row).on('blur', function() {
                        $('#tabla_' + ele)
                            .DataTable()
                            .cell($this)
                            .data(this.value);
                        $this.html(this.value);
                    });

                    $('#tabla_' + ele + '_col' + col + '_row' + row).off('keypress');
                    $('#tabla_' + ele + '_col' + col + '_row' + row).on('keypress', function(e) {
                        if (e.keyCode === 13) {
                            $('#tabla_' + ele)
                                .DataTable()
                                .cell($this)
                                .data(this.value);
                            $this.html(this.value);
                        }
                    });

                    $('#tabla_' + ele + '_col' + col + '_row' + row).focus();
                });
            }
        });
    } else {
        Dlg.warning('No hay datos para llenar la tabla.');
    }
}
function consolidar(target, to) {
    if ($.fn.DataTable.isDataTable(target) && $.fn.DataTable.isDataTable(to)) {
        var currentDatos = $(target).useDataTable('data');
        var toDatos = $(to).useDataTable('data');

        currentDatos.forEach(function(d, i) {
            var current = i;
            var keysT = Object.keys(d);
            var filtro = toDatos.some(function(t) {
                var currentKeys = Object.keys(t);
                //if (currentKeys.length !== keysT.length) return false;
                return keysT.every(function(key) {
                    return d[key] === t[key];
                });
            });
            if (filtro) {
                $(target + ' tbody tr:eq(' + current + ')')
                    .addClass('ok')
                    .removeClass('bad');
            } else {
                $(target + ' tbody tr:eq(' + current + ')')
                    .removeClass('ok')
                    .addClass('bad');
            }
        });
    } else {
        Dlg.warning('No hay datos para consolidar');
    }
}
function expandir(exp, colap) {
    function adjustDT() {
        $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
    }
    if ($(exp)[0].style.minWidth === '') {
        $(exp).css('min-width', '100%');
        $(colap).hide();
        adjustDT();
    } else {
        $(exp).css('min-width', '');
        $(colap).show();
        adjustDT();
    }
}
