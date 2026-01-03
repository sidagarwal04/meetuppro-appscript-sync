function meetupquery() {
  var token = 'ACCESS_TOKEN'; // Replace with your actual token
  var ql = "https://api.meetup.com/gql-ext";
  var variables = {"urlname" : "URL_NAME"}; // Replace with your Meetup Pro Network Name

  const query = `
    query ($urlname: ID!) {
      proNetwork(urlname: $urlname) {
        groupsSearch(input: { first: 50, filter: {} }) {
          totalCount
          pageInfo { endCursor }
          edges {
            node {
              id
              name
              proJoinDate
              foundedDate
              city
              groupAnalytics {
                totalPastEvents
                totalPastRsvps
                totalUpcomingEvents
                lastEventDate
              }
              memberships { totalCount }
            }
          }
        }
      }
    }
  `;

  var response = UrlFetchApp.fetch(ql, {
    method: "POST",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ query: query, variables: variables }),
    muteHttpExceptions: true
  });

  var text = response.getContentText();
  var data = JSON.parse(text);

  Logger.log(text);

  if (data.errors && data.errors.length) {
    throw new Error("GraphQL errors: " + JSON.stringify(data.errors));
  }
  if (!data.data || !data.data.proNetwork) {
    throw new Error("No data.proNetwork in response. Full response: " + text);
  }

  // Get the current month and year, e.g., "January 2024"
  var now = new Date();
  var currentMonth = now.toLocaleString("default", { month: "long" }) + " " + now.getFullYear();

  // Open the specific spreadsheet
  var spreadsheetId = "1MXJsfcL9HElSHiscy8yU4xZrV7zOIxYK5TjmJOXop_4";
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  // Check if a sheet for the current month exists, if not create one
  var sheet = spreadsheet.getSheetByName(currentMonth);
  var isNewSheet = false;
  if (!sheet) {
    sheet = spreadsheet.insertSheet(currentMonth);
    isNewSheet = true;
  }

  if (isNewSheet) {
    sheet.appendRow([
      "Timestamp", "User Group Name", "Member Count", "Pro Join Date", "Founded Date",
      "City", "Past RSVPs", "Past Event Count", "Upcoming Events Count", "Last Event Date"
    ]);
  }

  var edges = data.data.proNetwork.groupsSearch.edges;
  var rowData = [];

  for (var i = 0; i < edges.length; i++) {
    var node = edges[i].node;
    rowData.push([
      new Date(),
      node.name,
      node.memberships.totalCount,
      node.proJoinDate,
      node.foundedDate,
      node.city,
      node.groupAnalytics.totalPastRsvps,
      node.groupAnalytics.totalPastEvents,
      node.groupAnalytics.totalUpcomingEvents,
      node.groupAnalytics.lastEventDate
    ]);
  }

  var startRow = sheet.getLastRow() + 1;
  var range = sheet.getRange(startRow, 1, rowData.length, rowData[0].length);
  range.setValues(rowData);
}
