require(["/Content/scripts/config/config.js"], function () {
    require(['login.index']);
})
, define("login.index", ['jquery', 'geoCommon', 'geoDialog', 'geoDataGrid1', 'geoTree', 'geoContext', 'geoForm', 'geoSplitScreen'], function () {
    window.DataOperation = {
        //初始化
        init: function () {
            var that = this;
            that.loadTreeData();
            that.loaddataGrid("");
            var url = "api/ConstructionMachine/QueryConstructionMachinePageList";
            DataOperation.dataGrid.reloadData(DataOperation.getQuerySetting(), url);
            that.initSplitScreen();
            //var url = "/GeoMap/Home/Index?viewerType=gisViewer&amp;admin=true";
            ///// var url = "/GeoMapSite/WebContent/Apps/MapIndex/WarningInfoMap.html?viewerType=gisViewer&admin=true";  //&lineId=Id(5b1e957f8470a716b812c11c)
            //$("#WarningInfoMapFrame").attr("src", url);
            //that.showDetail = false;
            //$(window).resize(function () {
            //    // that.dataGrid.dataGrid.setGridHeight($(window).height() - 170);
            //});
        },
        //加载单位树数据
        loadTreeData: function () {
            var that = this;
            geoCommon.ajaxJson({
                postUrl: 'api/MonitorDevice/GetLineWorkUnitWorkPointTree',
                sendType: 'GET'
            }, function (data) {
                var nodeData = JSON.parse(JSON.stringify(data).replace(/Name/g, "name").replace(/Children/g, "children").replace(/Id/g, "id"));
                that.recursiveTerr(nodeData, 0, 1);
                that.geoTree = $("#tree_UnitList").geoTree({
                    data: nodeData,
                    setting: {
                        callback: {
                            onClick: that.onTreeClick,
                            onRightClick: that.onTreeRightClick,
                            params: { obj: that }
                        },
                        view: {
                            nameIsHTML: true,
                            showIcon: false,
                            showLine: false
                        }
                    },
                    //  expandAll: false
                })
                var treeObj = $.fn.zTree.getZTreeObj("tree_UnitList");
                //获取节点
                var nodes = treeObj.getNodes();
                if (nodes.length > 0) {
                    treeObj.selectNode(nodes[0]);
                }
            });
        },
        //tree点击事件
        onTreeClick: function (event, treeId, treeNode, clickFlag, params) {
            //var that = params.obj;
            //DataOperation.getFloorIdsByWpId(treeNode.Id)
            var that = this;
            var url = "api/ConstructionMachine/QueryConstructionMachinePageList";
            DataOperation.dataGrid.reloadData(DataOperation.getQuerySetting(), url);
        },
        //getFloorIdsByWpId: function (wpId) {
        //    var that = this;
        //    geoCommon.ajaxJson({
        //        postUrl: 'api/ConstructionMachine/GetConstructionMachineById=' + wpId,
        //        sendType: 'GET'
        //    }, function (data) {
        //        if (data && data.length > 0) {
        //            var obj = document.getElementById("WarningInfoMapFrame");
        //            obj.contentWindow.goFloorMap(data[0]);
        //        }
        //    });
        //},
        //递归展开数节点
        recursiveTerr: function (nodeData, nodecont, lev) {
            var that = this;
            for (var j = 0; j < nodeData.length; j++) {
                nodeData[j].open = true;
                if (lev <= nodecont) {
                    lev++;
                    that.recursiveTerr(nodeData[j].children, nodecont, lev)
                }
            }
        },
        loaddataGrid: function () {
            var that = this;
            that.dataGrid = $("#gridTable").geoDataGrid({
                height: $(window).height() - 161,
                querySettings: that.getQuerySetting(),
                autoScroll: false,
                shrinkToFit: false,
                pagination: true,
                rownumbers: true,
                rowNum: 10,
                colModel: [
                    { label: "操作", name: "operations", index: "operations", width: 80, align: "center", formatter: DataOperation.operationsFormatter, frozen: true },
                     { label: "表单类型", name: "FormType", index: "FormType", width: 120, align: "center", frozen: false, formatter: DataOperation.formTypeFormatter, sortable: true },
                    { label: "主键", name: "Id", index: "Id", hidden: true },
                    { label: "位置", name: "Location", index: "Location", width: 150, align: "center", sortable: true },
                    { label: "问题描述", name: "Description", index: "Description", width: 250, align: "center", sortable: true },
                    { label: "整改要求", name: "Rectification", index: "Rectification", width: 250, align: "center", sortable: true },
                    { label: "整改时限", name: "Deadline", index: "Deadline", width: 130, align: "center", sortable: true },
                    { label: "整改状态", name: "Status", index: "Status", width: 120, align: "center", sortable: true },
                    { label: "创建人员", name: "RealName", index: "RealName", width: 80, align: "center", sortable: true },
                    { label: "单位类型", name: "BusinessName", index: "BusinessName", width: 120, align: "center" },
                    { label: "所属角色", name: "TeamName", index: "TeamName", width: 120, align: "center" },
                    { label: "创建时间", name: "CreateDate", index: "CreateDate", width: 130, align: "center", formatter: DataOperation.formatterNull, sortable: true }
                ]
            });
            that.dataGrid.setFrozenColumns();

            $(window).resize(function () {
                DataOperation.dataGrid.dataGrid.setGridHeight($(window).height() - 161);
            });


        },
        formTypeFormatter: function (str) {
            if (str == "0") {
                return '<div style="text-align:center;">整改通知单</div>';
            } else if (str == "1") {
                return '<div style="text-align:center;">工作联系单</div>';
            } else {
                return '<div style="text-align:center;">监理工程师通知单</div>';
            }
        },
        formatterNull: function (str) {
            if (str == null) {
                return '<div style="text-align:center;"></div>';
            } else {
                return str;
            }
        },
        operationsFormatter: function (cellvalue, options, rowdata) {
            var str = '<button class="btn btn-sm btn-primary" type="button" onclick="DataOperation.showDetailInfo(\'' + rowdata.Id + '\',\'' + rowdata.FormType + '\');">详情</button>';
            return str;
        },
        showDetailInfo: function (id, formType) {
            var flan = false;
            if ($("#personInfo").is(':hidden')) {
                    $("#personInfo").show();
                    $("#personMap").css("zIndex", "-1");
                    $("#tableContent").css("width", "calc(100% - 590px)");
                    flan = true;
            }
            this.setSplitScreen(flan);
            $("#personInfo_Iframe")[0].contentWindow.DataOperation.reloadData({
                Id: id,
                FormType: formType
            });
        },
        setSplitScreen: function (flan) {
            if (flan) {
                var w = $("#personInfo").width();
                $("#rightDropHandle").show().css("right", w + 2);
            }
        },
        initSplitScreen: function () {
            var splitScreen = {
                _start: function (e) {
                    var g = this, p = this.options;
                    g.mask.show();
                    g.draggingyline.css({ left: e.pageX - g.layout.offset().left }).show();
                    g.isDraging = true;
                    $(document).bind('mouseup', function () {
                        g._stop.apply(g, arguments);
                    });
                    $(document).bind('mousemove', function () {
                        g._drag.apply(g, arguments);
                    });
                },
                _drag: function (e) {
                    var g = this, p = this.options;
                    if (g.isDraging) {
                        g.draggingyline.css({ left: e.pageX - g.layout.offset().left });
                        $('body').css('cursor', 'col-resize');
                    }
                },
                _stop: function (e) {
                    var g = this, p = this.options;
                    if (g.isDraging) {
                        g.draggingyline.hide();
                        g.mask.hide();
                        var left = parseInt(g.draggingyline.css('left').replace("px", ""));
                        g.rightDropHandle.css({ right: "calc(100% - " + (left + 5) + "px)" });
                        g.right.css({ width: "calc(100% - " + (left + 5) + "px)" });
                        g.right1.css({ width: "calc(100% - " + (left + 5) + "px)" });
                        g.center.width(left);
                        $('body').css('cursor', '');
                        setTimeout(function () {
                            g.isDraging = false;
                        }, 500);
                    }
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                    $('body').css('cursor', '');
                }
            };
            splitScreen.rightDropHandle = $('<div id="rightDropHandle" style="position: absolute;width: 5px;cursor: col-resize;z-index: 9;top: 0px;height: 100%;"></div>');
            splitScreen.draggingyline = $('<div id="draggingyline" style="position: absolute;width: 5px;height: 100%;background: #E0E4E2;display: none;z-index:10;top: 0px;"></div>');
            splitScreen.mask = $('<div id="mask" style="position: absolute;width: 100%;height: 100%;display: none;z-index:10;top: 0px;"></div>');
            splitScreen.layout = $("#layoutCenter");
            splitScreen.center = $("#tableContent");
            splitScreen.right = $("#personInfo");
            splitScreen.right1 = $("#personMap");
            splitScreen.layout.append(splitScreen.draggingyline);
            splitScreen.layout.append(splitScreen.rightDropHandle);
            splitScreen.layout.append(splitScreen.mask);
            splitScreen.rightDropHandle.mousedown(function (e) {
                splitScreen._start(e);
            });
        },
        //刷新数据
        refreshData: function () {
            var that = this;
            DataOperation.dataGrid.querySettings = that.getQueryParams();
            DataOperation.dataGrid.reloadData();
        },

        /**
		 *  单独选中根节点中第一个节点
		 */
        selectNodes: function (treeName) {
            var treeObj = $.fn.zTree.getZTreeObj(treeName);
            //获取节点
            var nodes = treeObj.getNodes();
            if (nodes.length > 0) {
                var node = treeObj.selectNode(nodes[0]);
            }
        },
        getQuerySetting: function () {
            var node = DataOperation.geoTree.getSelectedNodes();
            var lineId = "", workUnitId = "", workPointId = "";
            if (node[0]) {
                if (node[0].Extends == "线路") {
                    lineId = node[0].id;
                } else if (node[0].Extends == "分部" || node[0].Extends == "工区"|| node[0].Extends=="总包部") {
                    workUnitId = node[0].id;
                } else {
                    workPointId = node[0].id;
                }
            }
            //var parameters = [{
            //    "pageSize": 10, //默认分页显示行数
            //    "pageIndex": 1, //默认查询起始页
            //    "sidx": "",
            //    "sord": "asc",
            //    "querySettings": {
            //        "LineId": "", //线路
            //        "WorkUnitId": "", //工区分部|分区Id(5b2231498470a714a07b72b9)
            //        "WorkPointId": "", //工点
            //        "SearchKey": "", //搜索关键字
            //        "isUsing": "", //是否使用中
            //        "deviceName": "", //设备名称
            //        "brands": "", //品牌
            //        "entryModes": "", //进场方式
            //        "sources": "", //来源
            //        "deviceTypes": "", //设备类别
            //        "IsSpecial": "", //是否特种设备  0 否 1 是，其他 全部
            //        "beginDate": "", //开始日期
            //        "endDate": "" //结束日期
            //    }
            //}];
            //var parameters = [
            //        { key: "LineId", value: lineId },
            //        {key:"LineId",value:"Id(5b1e957f8470a716b812c11c)"},
            //        { key: "WorkUnitId", value: workUnitId },
            //        { key: "WorkPointId", value: workPointId }

            //];
            var parameters = [
            { key: "LineId", value: "Id(5b1e957f8470a716b812c11c)" },
            { key: "WorkUnitId", value: "" },
            { key: "WorkPointId", value:""},
            { key: "SearchKey", value:""},
            { key: "isUsing", value: ""},

            { key: "deviceName", value: "" },
            { key: "brands", value: "" },
            { key: "entryModes", value: "" },
            { key: "sources", value: "" },
            { key: "deviceTypes", value: "" }
        ];
            return parameters;
        },
        //getSplitDetail: function (code, name, updateTime) {
        //    $("#Mapdiv").css("height", "60%");
        //    $("#PmdetailDiv").show().css("height", "40%");
        //    $("#divCenter").css("overflow", "hidden");
        //    $("#Pmdetail").attr("src", "/EES/EnvironmentMonitor/DeviceInfoDetail?monitorDeviceId=" + code + "&monitorDeviceName=" + name + "&updateTime=" + updateTime);
        //    DataOperation.showDetail = true;
        //},
        //resetSplit: function () {
        //    $("#PmdetailDiv").hide();
        //    $("#Mapdiv").css("height", "100%");
        //},
    };
    DataOperation.init();
});









<!DOCTYPE html>

<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <title>WarningInfoDisplay</title>
    <link href="~/Content/styles/geoui.css" rel="stylesheet" />
    <script src="~/Content/thirdparty/requirejs/require.min.js" data-main="/Line3EES/Content/modules/controllers/environmentMonitor/WarningInfoDisplay.js" defer></script>
    @*<script type="text/javascript">
        $(function () {
            $("#personInfo_Iframe").attr("src", "/EnvironmentMonitor/WarningInfoDetail");
            $("#personInfo_Iframe").load(function () {
                var cssLink = document.createElement("link");
                cssLink.href = "/GeoBIM.BigScreen/Content/styles/css/modules/controllers/synthesizeShow/SafetyMatterDetailController.css";
                cssLink.rel = "stylesheet";
                cssLink.type = "text/css";
                this.contentDocument.body.appendChild(cssLink);
            })
        });
    </script>*@

</head>
<body class="geoui-body">
    <div class="geoui-layout">
        <div class="geoui-layout-left" style="width:340px;top:8px;bottom:12px;height:calc(100vh-16px);overflow:auto;">
            <ul id="tree_UnitList"></ul>
        </div>
        <div id="layoutCenter" style="width:calc(100% - 285px);height:calc(100vh - 65px);top:55px;position: absolute;left: 275px;">
            <div id="tableContent" style="width:100%;height:100%;">
                <table id="gridTable"></table>
            </div>
            <div id="personInfo" style="width: 585px; height: 100%; position: absolute; top: 0px; right: 0px; border: 1px solid rgb(225, 230, 239); display:none;">
                <iframe id="personInfo_Iframe" src="/EnvironmentMonitor/WarningInfoDetail" style="width: 100%;height:100%;border:0px;"></iframe>
            </div>
        </div>
        @*<div class="geoui-layout-center" id="divCenter" style="left:344px;top:8px;bottom:8px;height:calc(100vh-16px);padding:0PX!important;border:none!important;">
            <div id="Mapdiv" style="width:calc(100%);height:100%;position: absolute;">
                <iframe id="WarningInfoMapFrame" name="WarningInfoMapFrame" style="width:100%;height:calc(100% - 5px);margin-left: 0px;margin-top:0px;" frameborder="0"></iframe>
            </div>
            <div id="PmdetailDiv" style="display:none;position: absolute;width:calc(100%);right:0px;bottom:0px">
                <iframe id="Pmdetail" name="Pmdetail" style="width:100%;height:100%;margin-left: 0px;margin-top:0;" frameborder="0"></iframe>
            </div>
        </div>*@
    </div>

</body>
</html>