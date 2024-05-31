var dataTable;

var dtdatatables = [];

function exportarExcel(dtIndex) {
    const DATA_CSV = simpleDatatables.exportCSV(dtdatatables[dtIndex], {
        download: false,
        columnDelimiter: ";"
    });
    downloadElement(encodeURI(`data:text/csv;charset=utf-16,\uFEFF${DATA_CSV}`), "data_export.csv");
}


function initDataTable(selector, isReturn = false, options = {}, withExport = {
    csv: true
}) {
    if (withExport.csv) {
        if (typeof selector == "object") {
            var tabla = SELECTOR(`#` + selector.id);
        } else {
            var tabla = SELECTOR(selector);
        }
        tabla.insertAdjacentHTML("beforebegin", `<button type="button" class='btn btn-outline-success' onclick='exportarExcel(${dtdatatables.length})'><i class='fas fa-file-excel'></i></button>`)
    }

    let spanish = {
        placeholder: "Buscar",
        perPage: "Registros por pagina",
        noRows: "No se encontraron resultados",
        info: "Mostrando registros del {start} al {end} de un total de {rows} registros"
    }

    // tabla
    let aux = new simpleDatatables.DataTable(selector, Object.assign({
        fixedHeight: false,
        labels: spanish,
        contextMenu: true,
        searchQuerySeparator: ";",
        isSplitQueryWord: false,
        plugin: {
            delete: {
                enabled: true,
                all: (setDataTable = null) => {
                    if (setDataTable != null) {
                        dataTable = setDataTable;
                    }
                    dataTable.search("");
                    limite = dataTable.data.data.length;
                    let list = [];
                    for (let i = 0; i < limite; i++) {
                        list.push(i);
                    }
                    dataTable.rows.remove(list);
                },
                row: (tr, setDataTable = null) => {
                    if (setDataTable != null) {
                        dataTable = setDataTable;
                    }
                    dataTable.rows.remove(parseInt(tr.dataset.index))
                },
                row_btn: (btn, setDataTable = null) => {
                    if (setDataTable != null) {
                        dataTable = setDataTable;
                    }
                    dataTable.rows.remove(parseInt(btn.dataset.row));
                }
            }
        },
        tableRender: (_data, table, type) => {
            if (type === "print") return table;
            if (table.attributes["data-hidden-search-col"] === "true") return table;
            const tHead = table.childNodes[0]
            const filterHeaders = {
                nodeName: "TR",
                childNodes: tHead.childNodes[0].childNodes.map(
                    (_th, index) => ({
                        nodeName: "TH",
                        attributes: {
                            class: "datatable-thFiltro"
                        },
                        childNodes: [{
                            nodeName: "INPUT",
                            attributes: {
                                class: "datatable-input datatable-input-col ",
                                type: "search",
                                placeholder: "Buscar",
                                title: "Buscar en la columna: " + (typeof _th.childNodes[0].childNodes == "undefined" ? "" : _th.childNodes[0].childNodes[0].data),
                                "data-columns": `[${index}]`
                            }
                        }]
                    })
                )
            }
            tHead.childNodes.push(filterHeaders)
            return table
        }
    }, options));

    let index = dtdatatables.findIndex(dtdatatable => dtdatatable._tableAttributes.id == aux._tableAttributes.id);
    if (index == -1) {
        dtdatatables.push(aux);
    } else {
        dtdatatables[index] = aux;
    }
    if (isReturn) {
        return aux;
    }

    dataTable = aux;

}

function getDatatableFindById(id, messageError) {
    let dt = dtdatatables.find(dt => dt._tableAttributes.id == id);
    if (typeof dt == "undefined") throw messageError;
    return dt;
}

function makeEditableDatatable(dt, options = {
    inputs: [],
    isAll: false
}, fun = (dt, row, rowIndex, _cellIndex) => {}) {
    var auxFun = fun;
    var auxOptions = options;
    if (!(auxOptions.isAll === true)) {
        auxOptions?.inputs.map(x => {
            if (typeof x.select == "number") x.select = [x.select];
            return x;
        });
    }
    dt.dom.ondblclick = (event) => {
        var visibleToColumnIndex = function(visibleIndex, columns) {
            let counter = 0
            let columnIndex = 0
            while (counter < (visibleIndex + 1)) {
                const columnSettings = columns[columnIndex]
                if (!columnSettings.hidden) {
                    counter += 1
                }
                columnIndex += 1
            }
            return columnIndex - 1
        };
        //Obtenemos el td y también excluir los numbers td indicados
        cell = event.target.closest("td");
        if (cell == null) {
            return;
        } else if (event.target.closest("input") != null) {
            return;
        } else {
            let dt = getDatatableFindById(event.target.closest("table").id, "No podemos iniciar la edición porque no encontramos el datatable");
            cellIndexHTML = cell.cellIndex;
            cellIndexDt = visibleToColumnIndex(cellIndexHTML, dt.columns.settings);
            if (auxOptions.isAll !== true) {
                let indexConf = auxOptions.inputs.findIndex(x => x.select.findIndex(_cellIndex => _cellIndex == cellIndexDt) != -1);
                if (indexConf == -1) return;
                conf = auxOptions.inputs[indexConf];
            } else {
                conf = {};
            }
            if(typeof conf.isCancelledBefore != "undefined"){
                if (conf.isCancelledBefore(dt, cell.parentNode.dataset.index, cellIndexDt) == true) return;
            }
        }

        var updatedCell = (input, cell) => {
            value = (input.value == "" ? input.dataset.previousValue : input.value);
            //Comprobamos si cumple con la validación
            let isValid = () => {
                switch (input.type) {
                    case "number":
                        value = parseFloat(value);
                        if (input.min !== "") {
                            if (input.min > value) return false;
                        }
                        if (input.max !== "") {
                            if (input.max < value) return false;
                        }
                        break;

                    default:
                        break;
                }
                return true;
            };
            if (!isValid()) {
                input.focus();
                alert(input.dataset.messages_invalid);
                return;
            }
            let dt = getDatatableFindById(input.dataset.idTable, "No podemos aplicar los cambios porque no encontramos el datatable");
            row = dt.data.data[input.dataset.rowIndex];
            regex = /^[0-9]+(\.[0-9]+)?$/;
            isInteger = regex.test(value);
            value = (isInteger ? parseFloat(value) : value);
            let valuesBefore = null;
            if (typeof conf.accessPathValue == "undefined") {
                valuesBefore = row.cells[input.dataset.cellIndexDt].data;
            } else {
                valuesBefore = eval("row.cells[input.dataset.cellIndexDt].data." + conf.accessPathValue.join("."));
            }
            input.parentNode.innerText = value;
            cell.innerHTML = input.dataset.valueVisible;
            let applyUpdate = () => {
                if (typeof conf.accessPathValue == "undefined") {
                    valuesBefore = row.cells[input.dataset.cellIndexDt].data;
                    row.cells[input.dataset.cellIndexDt] = value;
                } else {
                    valuesBefore = eval("row.cells[input.dataset.cellIndexDt].data." + conf.accessPathValue.join("."));
                    eval("row.cells[input.dataset.cellIndexDt].data." + conf.accessPathValue.join(".") + " = value;");
                }
                dt.rows.updateRow(input.dataset.rowIndex, row.cells);
                dt.options.makeEditable(dt, dt.data.data[input.dataset.rowIndex], parseInt(input.dataset.rowIndex), parseInt(input.dataset.cellIndexDt));
            }
            if (typeof conf.isCancelledAfter == "undefined") {
                applyUpdate();
            } else {
                if (!conf.isCancelledAfter(valuesBefore, value)) {
                    applyUpdate();
                }
            }
            input.remove();
        };

        dt.options.makeEditable = auxFun;

        if (typeof conf == "undefined") conf = {};
        if (typeof conf.nodeName == "undefined") conf.nodeName = "INPUT";
        input = document.createElement(conf.nodeName);
        input.type = "text"
        input.dataset.messages_invalid = "El valor ingresado no es permitido";
        input.dataset.valueVisible = cell.innerHTML;
        if (typeof conf != "undefined") {
            input = Object.assign(input, conf?.attributes);
            if (typeof conf.messages != "undefined") {
                Object.keys(conf.messages).forEach(key => {
                    input.dataset["messages_" + key] = conf.messages[key];
                });
            }
            if (conf.nodeName == "SELECT") {
                conf?.options.forEach(option => {
                    addOption(input, option.text, option.value)
                });
            }
        }
        if (conf.nodeName == "INPUT") {
            let value = dt.data.data[cell.parentNode.dataset.index].cells[cellIndexDt].data;
            conf.accessPathValue?.forEach(x => value = value[x]);
            input.value = value;
            input.dataset.previousValue = input.value;
        }
        input.dataset.rowIndex = cell.parentNode.dataset.index;
        input.dataset.cellIndexHTML = cellIndexHTML;
        input.dataset.cellIndexDt = cellIndexDt;
        input.dataset.idTable = dt._tableAttributes.id;
        input.addEventListener('focusout', (event) => {
            input = event.srcElement;
            updatedCell(input, cell);
        });

        input.addEventListener('keydown', evt => {
            if (evt.key === 'Escape') {
                input = evt.srcElement;
                input.value = "";
                input.blur();
            } else if (evt.key === 'Enter') {
                input.blur();
            }
        });
        input.className = "datatable-input-edit";

        cell.innerText = "";
        cell.appendChild(input);
        if (conf.nodeName == "SELECT") {
            input.value = dt.data.data[cell.parentNode.dataset.index].cells[cellIndexHTML].data;
            input.dataset.previousValue = input.value;
        }
        conf?.fun?.options?.init(input.value, input.options);
        input.focus();
    };
}

function fixColumnsDatatable(dt) {
    if (dt.data.data[0].length != dt.data.headings.length) {
        columns = [];
        for (let index = dt.data.headings.length; index < dt.data.data[0].length; index++) {
            columns.push(index);
        }
        dt.columns.hide(columns)
    }
}