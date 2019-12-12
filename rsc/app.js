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
                    ProcessExcel(e.target.result, ele);
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
                    ProcessExcel(data, ele);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert('This browser does not support HTML5.');
        }
    } else {
        alert('Please upload a valid Excel file.');
    }
}
function ProcessExcel(datos, ele) {
    // Read the Excel File data.
    var workbook = XLSX.read(datos, {
        type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
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
            scrollX: true
        });
    } else {
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
        alert('NO HAY DATOS PARA CONSOLIDAR');
    }
}
function expandir(exp, colap) {
    if ($(exp)[0].style.minWidth === '') {
        $(exp).css('min-width', '100%');
        $(colap).hide();
    } else {
        $(exp).css('min-width', '');
        $(colap).show();
    }
}
