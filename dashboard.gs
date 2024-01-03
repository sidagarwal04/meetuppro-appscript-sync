function createDashboards() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var latestSheet = null;
  var ugRegionsSheet = null;
  var latestDate = new Date(0); // Initialize with a date far in the past

  // Find the UG + Regions sheet and the latest data sheet
  sheets.forEach(function(sheet) {
    var sheetName = sheet.getName();
    if (sheetName === 'UG + Regions') {
      ugRegionsSheet = sheet;
    } else {
      // Improved date parsing and error handling
      try {
        var date = new Date(sheetName + " 1"); // Assuming the format is "Month Year"
        if (date > latestDate) {
          latestDate = date;
          latestSheet = sheet;
        }
      } catch (e) {
        Logger.log("Error parsing date from sheet name: " + sheetName + "; Error: " + e.message);
      }
    }
  });

  if (!ugRegionsSheet || !latestSheet) {
    Logger.log("Required sheets not found.");
    return;
  }

  var regions = ['AMER', 'APAC', 'EMEA']; //Update this if your regions are different
  regions.forEach(function(region) {
    var dashboardName = region + ' Dashboard';
    var regionalDashboardSheet = spreadsheet.getSheetByName(dashboardName);
    if (regionalDashboardSheet) {
      regionalDashboardSheet.clear(); // Clear the existing Dashboard if it exists
    } else {
      regionalDashboardSheet = spreadsheet.insertSheet(dashboardName); // Create a new Dashboard sheet
    }
    createRegionSheet(region, latestSheet, ugRegionsSheet, regionalDashboardSheet);
  });
}

function createRegionSheet(region, dataSheet, ugRegionsSheet, regionalDashboardSheet) {
  // Extract user groups and filter by region
  var userGroups = ugRegionsSheet.getRange('A2:B' + ugRegionsSheet.getLastRow()).getValues();
  var filteredGroups = userGroups.filter(function(row) {
    return row[1] === region;
  }).map(function(row) {
    return row[0];
  });

  if (filteredGroups.length === 0) {
    Logger.log("No User Groups found for " + region);
    return;
  }

  // Assuming the data starts at A1 and goes to C with headers in the first row
  var range = dataSheet.getDataRange();
  var dataValues = range.getValues();
  var filteredData = dataValues.filter(function(row) {
    return filteredGroups.includes(row[1]); // Assuming 'User Group Name' is in column B
  });

  if (filteredData.length === 0) {
    Logger.log("No Data found for " + region);
    return;
  }

  // Create or clear the regional dashboard sheet
  if (!regionalDashboardSheet) {
    regionalDashboardSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(region + ' Dashboard');
  } else {
    regionalDashboardSheet.clear(); // Clear the existing Dashboard if it exists
  }

  // Copy the headers from the latest sheet
  var headers = dataSheet.getRange('B1:J1').getValues();
  regionalDashboardSheet.getRange('A1:I1').setValues(headers);

  // Copy only the filtered data from Column B onwards to the new sheet
  var outputData = filteredData.map(function(row) {
    return [row[1], row[2],row[3] ,row[4],row[5],row[6],row[7],row[8],row[9]]; // Assuming 'User Group Name' is in column B, 'Member Count' is in column C and so on
  });
  if (outputData.length > 0) {
    regionalDashboardSheet.getRange(2, 1, outputData.length, 9).setValues(outputData);
  }
}