

/* connection function to connect to Google Cloud SQL */

function getConnection() {
  var address = 'xxx.xxx.xxx.xxx';
  var rootPwd = 'xxx';
  var user = 'xxx';
  var userPwd = 'xxx';
  var db = 'xxx';

  var root = 'root';
  var instanceUrl = 'jdbc:mysql://' + address;
  var dbUrl = instanceUrl + '/' + db;

  return Jdbc.getConnection(dbUrl, user, userPwd);
}

/* submit one record to the SQL table "events" */


function onFormSubmti(e) {

  var valuesByTitle = { }; // create an empty object
  var itemResponses = e.response.getItemResponses();// gets all of the item responses in the current form in the same order as the items appear in the form.
  for (var i = 0; i < itemResponses.length; i++) { // go through each response up to the total number of responses
    var itemResponse = itemResponses[i]; // declare a var and assign the item response to it
    var title = itemResponse.getItem().getTitle(); // grab the title of that item (name given in the form) and assign it to a var for the title
    var response = itemResponse.getResponse(); // get the response to the item and assign it to a var for the response
    var answer = Array.isArray(response) ? response.join(",") : response;  // if the response is an array, make a string that is comma separated, otherwise just keep the respose as is and assign to a new var (answer)

    /* need to add to answer option if datetime or time variable. If datetime (like WHEN variable), I think it needs to be converted
    to java.sql.timestamp per these instrcurtions: http://stackoverflow.com/questions/18614836/using-setdate-in-preparedstatement */


    valuesByTitle[title] = answer; // add to title and response to the empty object, like this: [ NAME: "Yoga For Cats", LEVEL: "BEGINNER,ADVANCED"]
  }
    var columns = Object.keys(valuesByTitle); // creates a var that is the column name like [ "NAME", "LEVEL" ]

    var placeholders = columns.map(function(column) {
    return "?"; }); // creates a var for placeholders = [ "?", "?" ]

  var conn = getConnection();
  var stmt = conn.prepareStatement("INSERT INTO events (" + columns.join(",") + ") VALUES (" + placeholders.join(",") + ")");
    for (i = 0; i < columns.length; i++) {

      var type = typeof valuesByTitle[columns[i]]

         if (type === "string") {

           var setopt = "setString";

         } else if (type === "number") {

           var setopt = "setInt";

         } else { // actually might be datetime (WHICH) or time (LENGTH). May have to change LENGTH to numeric (e.g. 1, 1.5, 2, etc, as in hours)

           var setopt = "setTimeStamp";

         }

      stmt[setopt](i+1, valuesByTitle[columns[i]]); // this will not work with datetime. I think it first needs to be converted to java.sql.timestamp above

    }

   stmt.execute();
}
