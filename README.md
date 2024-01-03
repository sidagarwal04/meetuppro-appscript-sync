# Meetup Pro Network Data Fetcher

This project uses Google Apps Script that fetches information/data from the Meetup Pro Network and dumps it into a Google Sheet. The Meetup Pro API is a powerful tool that allows developers to access and retrieve information from the Meetup platform programmatically. It offers endpoints for accessing various data, including events, groups, members, and more, enabling seamless integration of Meetup functionalities into custom applications or scripts. 

The challenges which I have seen with Meetup Pro dashboard and Meetup APIs are:

* Meetup APIs are written in GraphQL. GraphQL enables clients to request only the specific data they need, avoiding over-fetching or under-fetching of data. Unlike REST, where endpoints return fixed data structures, GraphQL offers flexibility in fetching nested data structures efficiently. However, understanding GraphQL's query language and its intricacies might pose a learning curve for developers accustomed to RESTful principles. The flexibility of querying can sometimes lead to complexities in constructing efficient and optimized queries.
  
* Inaccurate data within the Meetup Pro Dashboard erodes trust and confidence in the platform's analytics and reporting. Decision-makers rely on these metrics to gauge the performance of events, track attendee engagement, or evaluate the success of marketing strategies. If the data doesn't accurately represent these aspects, it can lead to misguided decisions. When the Meetup Pro Dashboard reflects incorrect data, organizations may base crucial decisions on flawed information. For instance, if event attendance figures are inaccurately represented as higher or lower than reality, it can lead to misinformed decisions regarding resource allocation, event planning, or marketing efforts.

## Introduction

The above challanges motivated me to come up with a real-time and nearly accurate solution of fetching data from Meetup Pro Network on the 1st of every month. This would help a community manager or someone in the decision making process analysis the growth of the community:

* Month-on-Month Growth (MoM)
* Quarter-on-Quarter Growth (QoQ)
* Year-on-Year Growth (YoY)

The only prerequisite for running this project is having [Meetup Pro account](https://www.meetup.com/meetup-pro/) to authorize and generate access token required for running the script.

## Features
There are two scripts in this project - one for fetching the latest data from Meetup Pro network and another one for creating regional and consolidated dashboards.
1. First app script gets triggered on the 1st of every month.
2. Fetches following data from Meetup Pro Network:
3. Timestamp	User Group Name	Member Count	Pro Join Date	Founded Date	City	Past RSVPs	Past Event Count	Upcoming Events Count	Last Event Date
4. Dumps the fetched data into a Google Sheet creating a sheet with the current month name.
5. Second app script gets triggered after the completion of first script on the 1st of every month.
6. Creates regional dashboards from the latest fetched data based on pre-definied regions
7. A consolidated dashboard is automatically populated using Google Sheet formulas.

**Note: Setup and Usage guide are available in setup.md file.**
