function eventsquery() {
  var token = 'REPLACE WITH YOUR ACTUAL TOKEN'; // Replace with your actual token
  var ql = 'https://api.meetup.com/gql';
  // Calculate the current year's January 1st dynamically
  var now = new Date();
  var currentYearFirstDay = now.getFullYear() + "-01-01";
  var variables = {"urlname" : "UPDATE THIS WITH YOUR PRO NETWORK NAME", "after": "", "eventDateMin": currentYearFirstDay}; // 'after' will be used for pagination

  var continueFetching = true;
  var allRowData = [];
  while (continueFetching) {
    const query = ` \
      query ($urlname: String!, $after: String, $eventDateMin: DateTime){ \
      proNetworkByUrlname(urlname: $urlname) { \
        eventsSearch(filter: {eventDateMin: $eventDateMin}, input: {first: 1000, after: $after}) { \
          count \
          pageInfo { \
            endCursor
            hasNextPage
          } \
          edges{ \
            node{ \
              title \
              eventUrl \
              dateTime \
              going \
              group { \
                name \
                city \
              } \
              eventType \
            } \
          } \
        } \
      } \
    } \
    `;

    var response = UrlFetchApp.fetch(ql, {
        method: "POST",
        contentType: 'application/json', 
        headers: { Authorization: 'Bearer ' + token},
        payload: JSON.stringify({query: query, variables: variables})
        });
    if (response.getResponseCode() == 200) {
      var data = JSON.parse(response.getContentText());

      // Get the current year and format the sheet name as "Events X", where X is the current year.
      var now = new Date();
      var currentYear = now.getFullYear();
      var sheetName = "Events " + currentYear;

      // Open the specific spreadsheet
      var spreadsheetId = 'REPLACE WITH YOUR SPREADSHEET ID'; // Replace with your Spreadsheet ID
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

      // Check if a sheet for "Events X" exists, if not, create one. Otherwise, clear it.
      var sheet = spreadsheet.getSheetByName(sheetName);
      var isNewSheet = false;
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        isNewSheet = true; // Flag to indicate a new sheet was created
        console.log("Sheet created");
      } else {
        // Clear the existing data in the sheet if it already exists
        sheet.clear();
        // Since the sheet existed but we cleared it, we need to re-add headers
        sheet.appendRow(["Timestamp", "Meetup Title", "Meetup URL", "Meetup Date & Time", "Meetup Group Name", "Meetup City", "RSVP Count", "Meetup Type"]);
      }

      // If it's a new sheet, add headers
      if (isNewSheet) {
        sheet.appendRow(["Timestamp", "Meetup Title", "Meetup URL", "Meetup Date & Time", "Meetup Group Name", "Meetup City", "RSVP Count", "Meetup Type"]);
      }

      var edges = data.data.proNetworkByUrlname.eventsSearch.edges;
      var pageInfo = data.data.proNetworkByUrlname.eventsSearch.pageInfo;

      // Process the date
      for (var i = 0; i < edges.length; i++) {
        var node = edges[i].node;
        var rowData = [    
          new Date(), // Current timestamp
          node.title,
          node.eventUrl,
          node.dateTime,
          node.group.name,
          node.group.city,
          node.going,
          node.eventType
        ];
        allRowData.push(rowData); // Your existing data preparation
      }

      // Prepare for the next iteration
      if (pageInfo.hasNextPage && pageInfo.endCursor) {
        variables.after = pageInfo.endCursor; // Set 'after' for the next page
      } else {
        continueFetching = false; // Stop the loop if no more pages
      }
    } else {
      // Handle errors or rate limiting
      continueFetching = false; // Optionally retry or exit
    }
  }

  // Write the data to the sheet starting from the first empty row after headers
  var startRow = sheet.getLastRow() + 1; // Find the first empty row after headers
  var range = sheet.getRange(startRow, 1, allRowData.length, allRowData[0].length);
  range.setValues(allRowData);
}
