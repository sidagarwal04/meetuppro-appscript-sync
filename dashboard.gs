function createRegionalDashboards() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var latestSheet = null;
  var ugRegionsSheet = null;

  // Find the UG + Regions sheet and the latest data sheet
  sheets.forEach(function(sheet) {
    var sheetName = sheet.getName();
    if (sheetName == 'UG + Regions') {
      ugRegionsSheet = sheet;
    } else if (sheetName == (new Date().toLocaleString('en-US', { month: 'long' })) + " " +new Date().getFullYear()){
      latestSheet = sheet;
    }
  });

  if (!ugRegionsSheet || !latestSheet) {
    Logger.log("Required sheets not found.");
    return;
  }

  var regions = ['AMER', 'APAC', 'EMEA'];
  regions.forEach(function(region) {
    var dashboardName = region + ' Dashboard';
    var regionalDashboardSheet = spreadsheet.getSheetByName(dashboardName);
    if (regionalDashboardSheet) {
      regionalDashboardSheet.clear(); // Clear the existing Dashboard if it exists
    } else {
      regionalDashboardSheet = spreadsheet.insertSheet(dashboardName); // Create a new Dashboard sheet
    }
    createRegionDashboardSheet(region, latestSheet, ugRegionsSheet, regionalDashboardSheet);
  });
}

function createRegionDashboardSheet(region, dataSheet, ugRegionsSheet, regionalDashboardSheet) {
  // Extract user groups and filter by region
  var userGroups = ugRegionsSheet.getRange('A2:B' + ugRegionsSheet.getLastRow()).getValues();
  var filteredGroups = userGroups.filter(function(row) {
    return row[1] === region;
  }).map(function(row) {
    return row[0];
  });

  if (filteredGroups.length === 0) {
    Logger.log("No Groups found for " + region);
    return;
  }

  // Specify the exact data range to avoid empty rows
  var range = dataSheet.getRange('A1:J' + dataSheet.getLastRow()); // Adjust range as per your data
  var dataValues = range.getValues();

  // Filter the data based on filtered user groups
  var filteredData = dataValues.filter(function(row) {
    return filteredGroups.includes(row[1]); // Update the column index to match the 'User Group Name' column
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
  var headers = dataSheet.getRange('A1:J1').getValues();
  regionalDashboardSheet.getRange('A1:J1').setValues(headers);

  // Copy only the filtered Column B and C data to the new sheet
  var outputData = filteredData.map(function(row) {
    return row;
  });
  if (outputData.length > 0) {
    regionalDashboardSheet.getRange(2, 1, outputData.length, 10).setValues(outputData);
  }
}
