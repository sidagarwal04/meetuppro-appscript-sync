function createRegionalDashboards() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var latestSheet = null;
  var ugRegionsSheet = null;

  var now = new Date();
  var monthSheetName = now.toLocaleString('en-US', { month: 'long' }) + " " + now.getFullYear();

  // Find the UG + Regions sheet and the latest month data sheet
  sheets.forEach(function(sheet) {
    var sheetName = sheet.getName();
    if (sheetName === 'UG + Regions') ugRegionsSheet = sheet;
    if (sheetName === monthSheetName) latestSheet = sheet;
  });

  if (!ugRegionsSheet || !latestSheet) {
    Logger.log("Required sheets not found: " + (!ugRegionsSheet ? "UG + Regions " : "") + (!latestSheet ? monthSheetName : ""));
    return;
  }

  ['AMER', 'APAC', 'EMEA'].forEach(function(region) {
    var dashboardName = region + ' Dashboard';
    var regionalDashboardSheet = spreadsheet.getSheetByName(dashboardName);
    if (!regionalDashboardSheet) regionalDashboardSheet = spreadsheet.insertSheet(dashboardName);

    regionalDashboardSheet.clear(); // clear ONCE here
    createRegionDashboardSheet(region, latestSheet, ugRegionsSheet, regionalDashboardSheet);
  });
}

function createRegionDashboardSheet(region, dataSheet, ugRegionsSheet, regionalDashboardSheet) {
  // UG + Regions: Col A = Group Name, Col B = Region
  var userGroups = ugRegionsSheet.getRange(2, 1, ugRegionsSheet.getLastRow() - 1, 2).getValues();
  var filteredGroups = userGroups
    .filter(function(row) { return row[1] === region; })
    .map(function(row) { return row[0]; });

  if (filteredGroups.length === 0) {
    Logger.log("No Groups found for " + region);
    return;
  }

  // Read data sheet: A:J (A=Timestamp, B=User Group Name)
  var lastRow = dataSheet.getLastRow();
  if (lastRow < 2) {
    Logger.log("No data rows in " + dataSheet.getName());
    return;
  }

  var headers = dataSheet.getRange(1, 1, 1, 10).getValues(); // A1:J1
  var dataValues = dataSheet.getRange(2, 1, lastRow - 1, 10).getValues(); // A2:J

  // Filter to the region’s groups
  var regionRows = dataValues.filter(function(row) {
    return filteredGroups.indexOf(row[1]) !== -1; // column B = group name
  });

  if (regionRows.length === 0) {
    Logger.log("No Data found for " + region);
    // still write headers
    regionalDashboardSheet.getRange(1, 1, 1, 10).setValues(headers);
    return;
  }

  // DEDUPE: keep latest row per group by timestamp (col A)
  // timestamp can be Date object or string; normalize to millis safely
  var latestByGroup = {}; // groupName -> row
  regionRows.forEach(function(row) {
    var ts = row[0];
    var tsMillis =
      (ts instanceof Date) ? ts.getTime() :
      (ts ? new Date(ts).getTime() : 0);

    var groupName = row[1];

    if (!latestByGroup[groupName]) {
      latestByGroup[groupName] = { row: row, ts: tsMillis };
    } else if (tsMillis >= latestByGroup[groupName].ts) {
      latestByGroup[groupName] = { row: row, ts: tsMillis };
    }
  });

  // Convert map -> array
  var outputData = Object.keys(latestByGroup).map(function(groupName) {
    return latestByGroup[groupName].row;
  });

  // Optional: sort by Member Count descending (col C)
  outputData.sort(function(a, b) {
    var aCount = Number(a[2]) || 0;
    var bCount = Number(b[2]) || 0;
    return bCount - aCount;
  });

  // Write to dashboard
  regionalDashboardSheet.getRange(1, 1, 1, 10).setValues(headers);
  regionalDashboardSheet.getRange(2, 1, outputData.length, 10).setValues(outputData);
}
