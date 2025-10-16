/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 27.267041901188243, "KoPercent": 72.73295809881176};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2385240775484678, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2602249488752556, 500, 1500, "Update Contact"], "isController": false}, {"data": [0.0672182006204757, 500, 1500, "Delete User"], "isController": false}, {"data": [0.02048780487804878, 500, 1500, "Register New Account"], "isController": false}, {"data": [0.18153846153846154, 500, 1500, "Update Contact (PATCH)"], "isController": false}, {"data": [0.3306288032454361, 500, 1500, "Get Contact"], "isController": false}, {"data": [0.11752577319587629, 500, 1500, "Delete Contact"], "isController": false}, {"data": [0.4178427419354839, 500, 1500, "Add New Contact"], "isController": false}, {"data": [0.4896907216494845, 500, 1500, "Get Contact List"], "isController": false}, {"data": [0.48507462686567165, 500, 1500, "Login"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7995, 5815, 72.73295809881176, 563.247029393369, 238, 9387, 337.0, 1281.4000000000005, 1578.0, 2823.2799999999997, 38.0683468481123, 32.165974026804975, 22.186155056793023], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Update Contact", 978, 698, 71.37014314928426, 393.82004089979563, 241, 3592, 314.0, 549.0, 800.2999999999997, 1678.9300000000012, 4.7643637284799825, 4.023785358228514, 3.8657601014375906], "isController": false}, {"data": ["Delete User", 967, 895, 92.55429162357808, 386.2016546018616, 240, 2135, 306.0, 578.0, 793.7999999999997, 1682.5999999999997, 4.710524392917164, 3.5739899332026206, 2.193192353009231], "isController": false}, {"data": ["Register New Account", 1025, 959, 93.5609756097561, 1613.933658536586, 998, 9387, 1355.0, 2555.5999999999995, 3141.5999999999985, 4418.380000000001, 4.880557288219525, 3.94580687962165, 2.7722923174076386], "isController": false}, {"data": ["Update Contact (PATCH)", 975, 780, 80.0, 387.22974358974324, 239, 2416, 305.0, 547.4, 861.1999999999999, 1514.0000000000002, 4.749540877715154, 3.9049798403301788, 2.521994788901176], "isController": false}, {"data": ["Get Contact", 986, 620, 62.88032454361055, 405.11460446247486, 239, 2071, 322.0, 602.7000000000006, 872.6999999999996, 1570.7499999999995, 4.804225379563039, 4.150328767857491, 2.2173311303816097], "isController": false}, {"data": ["Delete Contact", 970, 839, 86.49484536082474, 394.82680412371144, 238, 2685, 305.0, 589.9999999999998, 842.0, 1669.4599999999973, 4.7252533125487135, 3.608186265405787, 2.3712419850326385], "isController": false}, {"data": ["Add New Contact", 992, 529, 53.32661290322581, 417.4052419354838, 240, 3175, 320.0, 609.7, 923.9999999999964, 1775.8699999999974, 4.8340724136250675, 4.30706844512938, 3.9394857706739437], "isController": false}, {"data": ["Get Contact List", 97, 41, 42.2680412371134, 473.17525773195865, 243, 3215, 346.0, 734.4000000000002, 1262.3999999999978, 3215.0, 1.375925558171863, 1.7074398387188288, 0.5535811964523816], "isController": false}, {"data": ["Login", 1005, 454, 45.17412935323383, 467.98706467661685, 248, 2938, 365.0, 686.3999999999999, 951.599999999996, 1939.2999999999915, 4.886516132796546, 4.710085512512885, 2.559737317849641], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 959, 16.491831470335338, 11.994996873045654], "isController": false}, {"data": ["401/Unauthorized", 4856, 83.50816852966466, 60.73796122576611], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7995, 5815, "401/Unauthorized", 4856, "400/Bad Request", 959, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Update Contact", 978, 698, "401/Unauthorized", 698, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete User", 967, 895, "401/Unauthorized", 895, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Register New Account", 1025, 959, "400/Bad Request", 959, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update Contact (PATCH)", 975, 780, "401/Unauthorized", 780, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Contact", 986, 620, "401/Unauthorized", 620, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Contact", 970, 839, "401/Unauthorized", 839, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add New Contact", 992, 529, "401/Unauthorized", 529, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Contact List", 97, 41, "401/Unauthorized", 41, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 1005, 454, "401/Unauthorized", 454, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
