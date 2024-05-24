function createRegionalEventsSheet() {
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
    } else if (sheetName.indexOf('Events ') === 0 && // Check if name starts with "Events "
               sheetName.slice(7) == new Date().getFullYear()) { // Check year matches current year
      latestSheet = sheet;
    }
  });

  if (!ugRegionsSheet || !latestSheet) {
    Logger.log("Required sheets not found.");
    return;
  }

  var regions = ['AMER', 'APAC', 'EMEA'];
  regions.forEach(function(region) {
    var dashboardName = region + ' Events';
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
    Logger.log("No Data found for " + region);
    return;
  }

  // Assuming the data starts at A1 and goes to C with headers in the first row
  var range = dataSheet.getDataRange();
  var dataValues = range.getValues();
  var filteredData = dataValues.filter(function(row) {
    return filteredGroups.includes(row[4]); // Assuming 'User Group Name' is in column B
  });

  if (filteredData.length === 0) {
    Logger.log("No Data found for " + region);
    return;
  }

  // Create or clear the regional dashboard sheet
  if (!regionalDashboardSheet) {
    regionalDashboardSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(region + ' Events');
  } else {
    regionalDashboardSheet.clear(); // Clear the existing Dashboard if it exists
  }

  // Copy the headers from the latest sheet
  var headers = dataSheet.getRange('A1:H1').getValues();
  regionalDashboardSheet.getRange('A1:H1').setValues(headers);

  // Copy only the filtered Column B and C data to the new sheet
  var outputData = filteredData.map(function(row) {
    return row;
  });
  if (outputData.length > 0) {
    regionalDashboardSheet.getRange(2, 1, outputData.length, 8).setValues(outputData);
  }
}
