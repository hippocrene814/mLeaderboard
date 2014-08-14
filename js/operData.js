// Create original data struture to save the data
function populateResults(testResults) {
  // Create an array to save each contributor with his/her
  // testCase and testSuite
  // arr[i].contr, arr[i].testCases, arr[i].testSuites
  var arr = [];
  for (var testSuite in testResults) {
    var testSuiteData = testResults[testSuite];
    for (var testCase in testSuiteData["test_cases"]) {
      testCaseFull = testSuite + '.' + testCase; // the whole name of test case
      var testCaseData = testSuiteData["test_cases"][testCase];
      for (var i = 0; i < testCaseData["contributors"].length; i++) {
        var testCaseContr = testCaseData["contributors"][i];
        var flag = 0;
        for (var j = 0; j < arr.length; j++) {
          if (arr[j].contr === testCaseContr) {
            flag = 1;
            arr[j].testCases.push(testCaseFull);
            if ((arr[j].testSuites)[arr[j].testSuites.length-1] != testSuite) {
              arr[j].testSuites.push(testSuite);
            }
            break;
          }
        }
        if (flag === 0) {
          var obj = {
            contr: testCaseContr,
            testCases: [testCaseFull],
            testSuites: [testSuite]
          };
          arr.push(obj);
        }
      } // contributor, i
    } // testCase
  } // testSuite

  // Count the number of each contributor
  arr.forEach(function(value) {
    value.testCaseCount = (value.testCases).length;
    value.testSuiteCount = (value.testSuites).length;
  });

  // Construct a level data structure
  // arr = [{
  //   "contr" : "yhua@twitter.com",
  //   "levelCase": [{suite:"x", case:["x1", "x2", ...]}, {suite:"y", case:["y1", "y2"]}, ...]
  //   },
  //   {
  //   "contr" : "jwen@twitter.com",
  //   "levelCase": [{suite:"x", case:["x1", "x3", ...]}, {suite:"y", case:["y2", "y4"]}, ...]
  //   },
  //   ...
  // ]
  arr.forEach(function(value1) {
    var arrSuite = [];
    value1.testSuites.forEach(function(value2) {
      var arrayCase = [];
      value1.testCases.forEach(function(value3){
        if (value3.indexOf(value2) > -1) {
          arrayCase.push(value3);
        }
      });
      var obj = {
        suite: value2,
        case: arrayCase
      }
      arrSuite.push(obj);
    });
    value1.levelCase = arrSuite;
  });

  return arr;
}

// Create a comparator to sort the arr[] by test case count
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