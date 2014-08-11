// create original data struture to save the data
function populateResults(testResults) {
  //create an array to save each contributor with his/her
  //testCase and testSuite
  //arr[i].contr, arr[i].testCases, arr[i].testSuites
  var arr = new Array();
  for(var testSuite in testResults) {
    var testSuiteData = testResults[testSuite];
    for(var testCase in testSuiteData["test_cases"]) {
      testCaseFull = testSuite + '.' + testCase; // the whole name of test case
      var testCaseData = testSuiteData["test_cases"][testCase];
      for(var i=0; i<testCaseData["contributors"].length; i++) {
        var testCaseContr = testCaseData["contributors"][i];
        var flag = 0;
        for(var j=0; j<arr.length; j++) {
          if(arr[j].contr == testCaseContr) {
            flag = 1;
            arr[j].testCases.push(testCaseFull);
            if((arr[j].testSuites)[arr[j].testSuites.length-1] != testSuite) {
              arr[j].testSuites.push(testSuite);
            }
            break;
          }
        }
        if(flag == 0) {
          var obj = new Object();
          obj.contr = testCaseContr;
          var newTestCases = [testCaseFull];
          obj.testCases = newTestCases;
          var newTestSuites = [testSuite];
          obj.testSuites = newTestSuites;
          arr.push(obj);
        }
      } // contributor, i
    } // testCase
  } // testSuite

  // count the number of each contributor
  for(var j=0; j<arr.length; j++) {
    arr[j].testCaseCount = (arr[j].testCases).length;
    arr[j].testSuiteCount = (arr[j].testSuites).length;
  }

  // construct a level data structure
  // arr = [ { 
  //   "contr" : "yhua@twitter.com", 
  //   "levelCase": {[{suite:"x", case:["x1", "x2", ...]}, {suite:"y", case:["y1", "y2"]}, ...]}
  //   },
  //   {
  //   "contr" : "yyyy@twitter.com", 
  //   "levelCase": {[{suite:"x", case:["x1", "x3", ...]}, {suite:"y", case:["y2", "y4"]}, ...]}
  //   },
  //   ...
  // ]
  for(var j=0; j<arr.length; j++) {
    var arrSuite = new Array();
    for(var i=0; i<arr[j].testSuiteCount; i++) {
      var obj = new Object();
      var tmpSuite = (arr[j].testSuites)[i];
      obj.suite = tmpSuite;
      var arrayCase = new Array();
      for(var k=0; k<arr[j].testCaseCount; k++) {
        var tmpCase = (arr[j].testCases)[k];
        if(tmpCase.indexOf(tmpSuite) > -1) {
          arrayCase.push(tmpCase);
        }
      }
      obj.case = arrayCase;
      arrSuite.push(obj);
    }
    arr[j].levelCase = arrSuite;
  }

  return arr;
}


// create a comparator to sort the arr[] by test case count
function compare(propertyName) {
  return function (object1, object2) {
    var value1 = object1[propertyName];
    var value2 = object2[propertyName];
    if (value2 < value1) {
      return -1;
    }
    else if (value2 > value1) {
      return 1;
    }
    else {
      return 0;
    }
  }
}

// sort data regarding certain property
function sort(arr, propertyName) {
  var res = arr.sort(compare(propertyName));
  return res;
}

// reconstruct for chart -- create new data structure
function createChart(arr, indx) {
  var barChartData = {
    labels : [],
    datasets : [
      {
        label: "My First dataset",
        fillColor : "rgba(220,220,220,0.2)",
        strokeColor : "rgba(220,220,220,1)",
        pointColor : "rgba(220,220,220,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(220,220,220,1)",
        data : []
      },
      {
        label: "My Second dataset",
        fillColor : "rgba(151,187,205,0.2)",
        strokeColor : "rgba(151,187,205,1)",
        pointColor : "rgba(151,187,205,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(151,187,205,1)",
        data : []
      }
    ]
  }

  if(indx == 100) {
    for(var j=0; j<20; j++) {
      barChartData.labels.push(arr[j].contr);
      (barChartData.datasets)[0].data.push(arr[j].testCaseCount);
      (barChartData.datasets)[1].data.push(arr[j].testSuiteCount);
    }
  }
  else {
    arr = sort(arr, "testSuiteCount");
    for(var j=indx; j<(20+indx) && j<arr.length; j++) {
      barChartData.labels.push(arr[j].contr);
      (barChartData.datasets)[0].data.push(arr[j].testCaseCount);
      (barChartData.datasets)[1].data.push(arr[j].testSuiteCount);
    }
  }
  return barChartData;
}

// reconstruct for tree -- create new data structure
function createRoot(arr, contr, root) {
  var indx = 0;
  window.location.href = window.location.pathname + "#" + contr;
  root.name = contr;
  var testSuite = new Array();
  for(var j=0; j<arr.length; j++) {
    if(arr[j].contr == contr) {
      indx = j;
      for(var i=0; i<arr[j].testSuiteCount; i++) {
        var childRoot = new Object();
        var lenSuite = ((arr[j].levelCase)[i].suite).length - 1;
        childRoot.name = ((arr[j].levelCase)[i].suite).substr(29, lenSuite);
        var testCase = new Array();
        for(var k=0; k<((arr[j].levelCase)[i].case).length; k++) {
          var grandChildRoot = new Object();
          var lenCase = (((arr[j].levelCase)[i].case)[k]).length - 1;
          grandChildRoot.name = (((arr[j].levelCase)[i].case)[k]).substr(lenSuite+2,lenCase);
          testCase.push(grandChildRoot);
        }
        childRoot.children = testCase;
        testSuite.push(childRoot);
      }
    }
  }
  root.children = testSuite;
  root.x0 = h / 2;
  root.y0 = 0;

  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }
  // Initialize the display to show a few nodes.
  root.children.forEach(toggleAll);
  toggle(root.children[0]);
  return indx;
}

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}
