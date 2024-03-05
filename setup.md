# Setup

1. Create a new [Google Sheet](https://sheets.google.com/) and create a new sheet titled "UG + Regions" with columns "UG Name" and "Region". This project has 3 regions - AMER for Americas, APAC for Asia Pacific and EMEA for Europe, Middle-East and Africa. You can modify the script to add/remove/update regions as per your need.
2. Select "Apps Script" under the Extension tab in the top menu bar.
3. Clear the existing/default contents in Code.gs script.
4. Copy the code from [meetupfetch.gs](https://github.com/sidagarwal04/meetuppro-appscript-sync/blob/main/meetupfetch.gs) file in this repository and paste in the Code.gs file in the Google Apps Script Code Editor. Make sure to replace following variables with their actual values: **token**, urlname in **variables** and **spreadsheetId**. Steps for getting access token are mentioned [later](setup.md#steps-to-get-access-token).
5. Click on Run button to authorize the permissions and allow access for data via Google Apps Script. Note: This activity needs to be performed manually only once.
6. The script will automatically create a new sheet with the current month name and year (eg. January 2024) and fetches information such as User Group Name, Member Count, Pro Join Date, Founded Date, City, Past RSVPs, Past Event Count, Upcoming Events Count	and Last Event Date. An additional column for "Timestamp" is appended at the start.
7. Create a new file by clicking the plus (+) sign next to Files, select "Script" and rename the file to "Dashboard". Note: Don't add .gs extension after the file name as it will be automatically appended.
8. Copy the code from [dashboard.gs](https://github.com/sidagarwal04/meetuppro-appscript-sync/blob/main/dashboard.gs) file in this repository and paste in the Dashboard.gs file in the Google Apps Script Code Editor.
9. Click on Run button to authorize the permissions and allow access for data via Google Apps Script if needed. Note: This activity needs to be performed manually only once.
10. The script will generate 3 regional dashboards - AMER Dashboard, APAC Dashboard and EMEA Dashboard as per the meetup groups mapped with their regions in the "UG + Regions" sheet.
11. You can additionally create a consolidated dashboard as per your need in a separate sheet using Google Sheet formulas.
12. Next is to add triggers for both the scripts to run automatically one after another on the 1st of every month.
13. Click on Triggers tab (alarm clock icon) in the left side menu and click on "Add Trigger" button at the bottom right corner.
14. Use following settings:
    1. Under "Choose which function to run" select "meetupquery"
    2. Under "Choose which deployment should run" select "Head"
    3. Under "Select event source" select "Time-driven"
    4. Under "Select type of time based trigger" select "Month timer"
    5. Under "Select day of month" select "1st"
    6. Under "Select time of day" select "Midnight to 1 am"
    7. Under "Failure notification settings" select "Notify me immediately"
    8. Save the settings
15. Repeat Step #13 and Step #14 after updating "Choose which function to run" to "createDashboards" and "Select time of day" to "1am to 2am"
16. Feel free to modify above settings as per your need

## Steps to get access token

The Meetup API supports authenticating requests using OAuth 2 over HTTPS. Meetup API provide implementations a number of protocol flows outlined below. They provide the following endpoints for acquiring member authorization and access tokens.

| Endpoint | URL |
| ------------- | ------------- |
| Authorization	| https://secure.meetup.com/oauth2/authorize |
| Access Tokens	| https://secure.meetup.com/oauth2/access |

1. Before you can use OAuth 2 for member authorization, you need to either [register](https://www.meetup.com/api/oauth/list/) a new OAuth client or add a redirect_uri to an existing client by clicking the edit link next to your client's [listing](https://www.meetup.com/api/oauth/list/). The redirect_uri you register for a given client will be used to validate future oauth2 requests. This uri is used as a basis for validating the address authorization requests will redirect a member to after granting or denying access to your app. If provided, the redirect URL's host and port must exactly match the callback URL. The redirect URL's path must reference a subdirectory of the callback URL.
   
2. OAuth 2 authenticated requests expect an Authorization header with value in the following format.

     `Authorization: bearer {ACCESS_TOKEN}`

3. You can obtain an access token using one of the following flows: Server Flow or Refresh Token Flow. I have used Server Flow in this project. If you wish to use Refresh Token Flow, refer to the documentation [here](https://www.meetup.com/api/authentication/#graphQl-authentication).

4. Requesting Authorization
  - To request authorization, you can either create a separate function in Google Apps Script or use Postman to generate a code string that can only be used once to request an access token. I used Postman to request authorization.
  - Initiate a GET request with following URL:
    ```
    https://secure.meetup.com/oauth2/authorize?client_id={YOUR_CLIENT_KEY}&response_type=code&redirect_uri={YOUR_CLIENT_REDIRECT_URI}
    ```
  - The redirect_uri used here may vary but must start with the same redirect_uri you have registered in Step #1 above. Meetup will ask the member to login if they are not already logged in. If the member has previously authorized access for the provided client_id, Meetup will immediately redirect the member back to the redirect_uri with success query parameters. If the authenticated member has not previously authorized the provided client or has revoked its access, Meetup will prompt them to authorize your application. Afterwords, Meetup will redirect the member back to the provided redirect_uri along with their response.
4. Requesting Access Token
  - Make an HTTP application/x-www-form-urlencoded encoded POST request via Postman for an access token with the following format:
    
```
https://secure.meetup.com/oauth2/access/client_id={YOUR_CLIENT_KEY}&client_secret={YOUR_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri={SAME_REDIRECT_URI_USED_FOR_PREVIOUS_STEP}&code={CODE_YOU_RECEIVED_FROM_THE_AUTHORIZATION_RESPONSE}
```

  - The important parameter to note is grant_type which should be set to authorization_code. The redirect_uri used in this step must be the same redirect_uri used in the previous step. A successful response will contain the following data in application/json format:
```
{
  "access_token": "{ACCESS_TOKEN_TO_STORE}",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "{TOKEN_USED_TO_REFRESH_AUTHORIZATION}"
}
```
5. The access token generated in previous step needs to be used in the Google Apps Script to fetch data for a Meetup Pro Network from Meetup API.
