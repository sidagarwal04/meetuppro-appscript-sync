function meetupquery() {
  var token = 'ACCESS_TOKEN'; // Replace with your actual token
  var ql = 'https://api.meetup.com/gql';
  var variables = {"urlname" : "URL_NAME"}; // Replace with your Meetup Pro Network Name
  const query = ` \
    query ($urlname: String!){ \
    proNetworkByUrlname(urlname: $urlname) { \
      groupsSearch(filter: {}, input: {first: 50}){ \ // Currently the script fetches the information of first 50 Groups. The script needs to be modified if you have more than 50 groups in your Meetup Pro Network
        count \
        pageInfo { \
          endCursor
        } \
        edges{ \
          node{ \
            id \
            name \
            proJoinDate \
            foundedDate \
            city \
            groupAnalytics {\
              totalPastEvents \
              totalPastRsvps \
              totalUpcomingEvents \
              lastEventDate \
            } \
            memberships { \
              count \
            } \
          } \
        }\
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

    // Get the current month and year, e.g., "January 2024"
    var now = new Date();
    var currentMonth = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear();

    // Open the specific spreadsheet
    var spreadsheetId = 'SPREADSHEET_ID'; // Replace with your Spreadsheet ID
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    // Check if a sheet for the current month exists, if not create one
    var sheet = spreadsheet.getSheetByName(currentMonth);
    var isNewSheet = false;
    if (!sheet) {
      sheet = spreadsheet.insertSheet(currentMonth);
      isNewSheet = true; // Flag to indicate a new sheet was created
    }

    // If it's a new sheet, add headers
    if (isNewSheet) {
      sheet.appendRow(["Timestamp", "User Group Name", "Member Count", "Pro Join Date", "Founded Date", "City", "Past RSVPs","Past Event Count", "Upcoming Events Count", "Last Event Date"]);
    }

    // Your existing code to extract data
    var extracted_data = [];
    var edges = data.data.proNetworkByUrlname.groupsSearch.edges;
    var rowData = [];
    
    for (var i = 0; i < edges.length; i++) {
      var node = edges[i].node;
      var name = node.name;
      var count = node.memberships.count;
      var pjd = node.proJoinDate;
      var fd = node.foundedDate;
      var city = node.city;
      var pastrsvps = node.groupAnalytics.totalPastRsvps;
      var pasteventcount = node.groupAnalytics.totalPastEvents;
      var upcomingeventcount = node.groupAnalytics.totalUpcomingEvents;
      var lasteventdate = node.groupAnalytics.lastEventDate;
      var timestamp = new Date(); // Current timestamp
      rowData.push([timestamp, name, count,pjd,fd,city,pastrsvps, pasteventcount,upcomingeventcount,lasteventdate]); // Your existing data preparation
    }

    // Write the data to the sheet starting from the first empty row after headers
    var startRow = sheet.getLastRow() + 1; // Find the first empty row after headers
    var range = sheet.getRange(startRow, 1, rowData.length, rowData[0].length);
    range.setValues(rowData);
  }
}