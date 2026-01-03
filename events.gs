function eventsquery() {
  var token = 'REPLACE WITH YOUR ACTUAL TOKEN'; // Replace with your actual token
  var ql = "https://api.meetup.com/gql-ext";

  // Current year's Jan 1 (ISO)
  var now = new Date();
  var currentYearFirstDay = now.getFullYear() + "-01-01T00:00:00Z";

  var variables = {"urlname" : "UPDATE THIS WITH YOUR PRO NETWORK NAME", "after": "", "eventDateMin": currentYearFirstDay}; // 'after' will be used for pagination


  // Sheet setup once
  var sheetName = "Events " + now.getFullYear();
  var spreadsheetId = 'REPLACE WITH YOUR SPREADSHEET ID'; // Replace with your Spreadsheet ID
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  else sheet.clear();

  sheet.appendRow([
    "Timestamp",
    "Meetup Title",
    "Meetup URL",
    "Meetup Date & Time",
    "Meetup Group Name",
    "Meetup City",
    "RSVP Count",
    "Meetup Type"
  ]);

  var continueFetching = true;
  var allRowData = [];

  while (continueFetching) {
    // Migration fix: filter moved inside input (as in Meetup guide) :contentReference[oaicite:2]{index=2}
    const query = `
      query ($urlname: ID!, $after: String, $eventDateMin: DateTime) {
        proNetwork(urlname: $urlname) {
          eventsSearch(
            input: {
              first: 100,
              after: $after,
              filter: { eventDateMin: $eventDateMin }
            }
          ) {
            pageInfo { endCursor hasNextPage }
            edges {
              node {
                title
                eventUrl
                dateTime
                eventType
                group { name city }

                # Replace removed "going" with RSVP connection (per guide examples) :contentReference[oaicite:3]{index=3}
                rsvps { totalCount }
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
    var payload = JSON.parse(text);

    if (payload.errors && payload.errors.length) {
      throw new Error("GraphQL errors: " + JSON.stringify(payload.errors));
    }
    if (!payload.data || !payload.data.proNetwork || !payload.data.proNetwork.eventsSearch) {
      throw new Error("Missing data.proNetwork.eventsSearch. Full response: " + text);
    }

    var conn = payload.data.proNetwork.eventsSearch;
    var edges = conn.edges || [];
    var pageInfo = conn.pageInfo || {};

    for (var i = 0; i < edges.length; i++) {
      var node = edges[i].node;

      allRowData.push([
        new Date(),
        node.title || "",
        node.eventUrl || "",
        node.dateTime || "",
        (node.group && node.group.name) ? node.group.name : "",
        (node.group && node.group.city) ? node.group.city : "",
        (node.rsvps && node.rsvps.totalCount != null) ? node.rsvps.totalCount : "",
        node.eventType || ""
      ]);
    }

    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      variables.after = pageInfo.endCursor;
    } else {
      continueFetching = false;
    }
  }

  if (allRowData.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, allRowData.length, allRowData[0].length).setValues(allRowData);
  }
}
