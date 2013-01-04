$(document).ready(function() {
    
      $("#totalPoints").val(readCookie("totalPoints"));
      $("#sprintPointsDone").val(readCookie("sprintPointsDone"));
      $("#extraWorkPoints").val(readCookie("extraWorkPoints"));

      $("#totalPoints").change(function(){
        clearChart();
        drawChart();
        createCookie("totalPoints",$("#totalPoints").val(),31);      
      });
      $("#sprintPointsDone").change(function(){
        clearChart();
        drawChart();
        createCookie("sprintPointsDone",$("#sprintPointsDone").val(),31);
      });
      $("#extraWorkPoints").change(function(){
        clearChart();
        drawChart();
        createCookie("extraWorkPoints",$("#extraWorkPoints").val(),31);
      });
});

function clearChart() {
  $('#chartDivId').html('');
}

function drawChart() {

  var totalPoints = Number($("#totalPoints").val());

  var pointsBurned = parseInputToArray($("#sprintPointsDone").val());
    
  //extraWork is cumulative
  var extraWork    = parseInputToArray($("#extraWorkPoints").val());

  // chart data
  var dataArray = calculateDataArray(totalPoints, pointsBurned);
  var regressionDataX = createX(dataArray);
  var amountOfWork = calculateTotalWork(totalPoints, extraWork);
  var trendlineData = regression(regressionDataX ,dataArray, amountOfWork, extraWork);
  
  // x-axis ticks
  var ticks = createTicks(trendlineData);
  
  var extraWorkLine = calculateExtraWorkLinePoints(ticks, extraWork); 

  // chart rendering options
  var options = {
    title: 'Release Burndown',
    seriesDefaults: {
      renderer:$.jqplot.BarRenderer,
      shadow: true,
      barWidth: 10
    },
    series: [
            {fillToZero: true},
            {fillToZero: true},
            {
            renderer: $.jqplot.LineRenderer,
            lineWidth: 2,
            pointLabels: {
                show: false
            },
            markerOptions: {
                size: 4
            }},
            {
            renderer: $.jqplot.LineRenderer,
            lineWidth: 2,
            }
            ],
    axesDefaults: {

    },            
    axes: {
      xaxis: {
        renderer: $.jqplot.CategoryAxisRenderer,
        ticks: ticks,
        min: 0
      },
      yaxis: {
        forceTickAt0: true
        //min: 0
      }
    },
    canvasOverlay: {
      show: true,
      objects: [
        {horizontalLine: {
          y: 0,
          lineWidth: 3,
          color: 'rgb(100, 55, 124)',
          shadow: true,
          xOffset: 0
        }}
      ]
    }
  };
 
  // draw the chart
  $.jqplot('chartDivId', [dataArray, calculateExtraWorkArray(extraWork), trendlineData, extraWorkLine], options);

}

function parseInputToArray(input){
 var output = [];

 var temp = input.split(",");

 for (var i = 0; i < temp.length; i++) {
   output[i] = Number(temp[i]);
 };

 return output;
}

function calculateExtraWorkLinePoints(ticks, extraWork){
  var output = [];
  var y = (-1 * extraWork[extraWork.length-1]);
  output = [[-1,y],[(ticks.length +1), y]];

  return output;
}

function calculateExtraWorkArray(extraWork){
  var output = [0];

  for (var i = 0; i < extraWork.length; i++) {
    output[i+1] = (-1 * extraWork[i]);
  };

  return output;
}

function calculateTotalWork(totalPoints, extraWork){
  var totalWork = totalPoints + extraWork[extraWork.length-1];

  return totalWork;
}

function createX(dataArray){
  var xValues = [];

  for (var i = 0; i < dataArray.length; i++) {
    xValues[i] = i;
  };

  return xValues;
}

function createTicks(trendlineData){

    var endSprint = trendlineData[1][0];
    var numberOfsprints = endSprint + 1;

    var tickNames = ["Start"];
    for (var i = 1; i <= numberOfsprints; i++) {
         tickNames[i] = "Sprint " + (i);
         };
        
    return tickNames;
}

function calculateDataArray(totalPoints, pointsBurned) {

    var pointsLeft = totalPoints;
    var dataArray = [pointsLeft];


    for (var i = 0; i < pointsBurned.length; i++) {
        pointsLeft = pointsLeft - pointsBurned[i];
        dataArray[i+1] = pointsLeft;
    };
    
   return dataArray;
}

function regression(x, y, amountOfWork, extraWork)  {
        
        var N = x.length;
        var slope;
        var intercept;  
        var SX = 0;
        var SY = 0;
        var SXX = 0;
        var SXY = 0;
        var SYY = 0;
        var Y = y;
        var X = x;
  
        for ( var i = 0; i < N; i++) {
            SX = SX + X[i];
            SY = SY + Y[i];
            SXY = SXY + X[i]* Y[i];
            SXX = SXX + X[i]* X[i];
            SYY = SYY + Y[i]* Y[i];
        }

        slope = (N*SXY - SX*SY)/(N*SXX - SX*SX);
        intercept = (SY - slope*SX)/N;
        
        var trendPoints = calculateTrendPoints(slope,amountOfWork, extraWork);
        
        return trendPoints;
}

function calculateTrendPoints(slope,amountOfWork,extraWork){
  var begin = amountOfWork - extraWork[extraWork.length-1];
  var end = ( amountOfWork / (-1 * slope) ) + 1;
  var newZeroLine = ( -1 * extraWork[extraWork.length-1]);
  
  return [[1,begin],[end,newZeroLine]]; 
}

function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else var expires = "";
  document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}


