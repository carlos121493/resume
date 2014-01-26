 r = (parseInt(delta / 86400, 10)).toString() + " " + settings.localization.days;
}
return r;
},
/*
* Function to update the timestamps of each tweet
*/
updateTimestamps: function () {
var tweetMachine;
tweetMachine = this;
// Loop over each timestamp
$(tweetMachine.container).find('.time').each(function () {
var originalTime, timeElement;
// Save a reference to the time element
timeElement = $(this);
// Get the original time from the data stored on the timestamp
originalTime = timeElement.data('timestamp');
// Generate and show a new time based on the original time
timeElement.html(tweetMachine.relativeTime(originalTime));
});
},
/*
* Function to parse the text of a tweet and and add links to links, hashtags, and usernames
*/
parseText: function (text) {
// Links
text = text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function (m) {
return '<a href="' + m + '" target="_blank">' + m + '</a>';
});
// Usernames
text = text.replace(/@[A-Za-z0-9_]+/g, function (u) {
return '<a href="http://twitter.com/#!/' + u.replace(/^@/, '') + '" target="_blank">' + u + '</a>';
});
// Hashtags
text = text.replace(/#[A-Za-z0-9_\-]+/g, function (u) {
return '<a href="http://twitter.com/#!/search?q=' + u.replace(/^#/, '%23') + '" target="_blank">' + u + '</a>';
});
return text;
},
/*
* Function to build the tweet as a jQuery object
*/
buildTweet: function (tweet) {
var tweetMachine, tweetObj;
tweetMachine = this;
// Create the tweet from the tweetFormat setting
tweetObj = $(tweetMachine.settings.tweetFormat);
// Set the avatar. NOTE: reasonably_small is Twitter's suffix for the largest square avatar that they store
tweetObj.find('.avatar')
.attr('src', tweet.user.profile_image_url.replace("normal", "reasonably_small"));
// Set the username
tweetObj.find('.username')
.attr('href', "http://twitter.com/" + tweet.user.screen_name)
.attr('target', '_blank')
.html("" + tweet.user.screen_name);
// Set the timestamp
tweetObj.find('.time')
.attr('href', "http://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str)
.attr('target', '_blank')
.html(tweetMachine.relativeTime(tweet.created_at))
// Save the created_at time as jQuery data so we can update it later
.data('timestamp', tweet.created_at);
// Set the text
tweetObj.find('.content')
.html(tweetMachine.parseText(tweet.text));
// If we are animating in the new tweets
if (tweetMachine.settings.animateIn) {
// Set the opacity to 0 so it can fade in
tweetObj.css('opacity', '0');
}
return tweetObj;
},
/*
* Function to handle the reloading of tweets
*/
refresh: function (firstLoad) {
var queryParams, tweetMachine;
tweetMachine = this;
// If it is the first load or we're refreshing automatically
if (firstLoad || tweetMachine.settings.autoRefresh) {
// Set the query parameters that the endpoint needs
/*
* Twitter feed for search through tweets only
* API Reference: https://dev.twitter.com/docs/api/1.1/get/search/tweets
*/
if (tweetMachine.settings.endpoint === "search/tweets") {
queryParams = {
q: tweetMachine.query,
count: (this.settings.requestLimit) ? this.settings.requestLimit: this.settings.limit,
since_id: tweetMachine.lastTweetID
};
}
/*
* Twitter feed for username only
* API Reference: https://dev.twitter.com/docs/api/1.1/get/statuses/user_timeline
*/
if (tweetMachine.settings.endpoint === "statuses/user_timeline") {
queryParams = {
screen_name: settings.user_name,
count: (this.settings.requestLimit) ? this.settings.requestLimit: this.settings.limit,
include_rts: settings.include_retweets,
exclude_replies: settings.exclude_replies
};
}
// Call your backend script to get JSON back from Twitter
$.getJSON(tweetMachine.settings.backendScript, {
endpoint: tweetMachine.settings.endpoint,
queryParams: queryParams
}, function (tweets) {
var tweetsDisplayed;
// If we got a response from Twitter
if ( tweets[0] ) {
// If there is an error message
if ( tweets[0].message ) {
// If there is already an error displayed
if ( $('.twitter-error').length ) {
// Update the error message
$('.twitter-error').html('<p class="tweet-machine-error">Error ' + tweets[0].code + ': ' + tweets[0].message + '</p>');
}
else { // There isn't an error displayed yet
// Display an error message above the container
$(tweetMachine.container).before('<p class="twitter-error">Error ' + tweets[0].code + ': ' + tweets[0].message + '</p>');
}
}
// There are tweets
else {
// If there was an error before
if ( $('.twitter-error').length ) {
// Remove it
$('.twitter-error').remove();
}
// Reverse them so they are added in the correct order
tweets.reverse();
// Count the number of tweets displayed
tweetsDisplayed = 0;
// Loop through each tweet
$.each(tweets, function () {
var tweet, tweetObj;
tweet = this;
// If there is no filter, or this tweet passes the filter
if (!tweetMachine.settings.filter || tweetMachine.settings.filter(this)) {
// Build the tweet as a jQuery object
tweetObj = tweetMachine.buildTweet(tweet);
// If there are already tweets on the screen
if (!firstLoad) {
// If we are animating out the old tweets
if (tweetMachine.settings.animateOut) {
/*
* TODO Support this feature
*/
} else { // We are not animating the old tweets
// Remove them
$(tweetMachine.container).children(':last-child').remove();
}
}
// Prepend the new tweet
$(tweetMachine.container).prepend(tweetObj);
// If we are animating in the new tweets
if (tweetMachine.settings.animateIn) {
// Fade in the new tweet
/*
* TODO Figure out why .fadeIn() doesn't work
*/
$(tweetMachine.container).children(':first-child').animate({
opacity: 1
});
}
// Increment the tweets diplayed
tweetsDisplayed++;
// Save this tweet ID so we only get newer noes
tweetMachine.lastTweetID = tweet.id_str;
// If we've reached the limit of tweets to display
if (tweetsDisplayed > tweetMachine.settings.limit) {
// Quit the loop
return false;
}
}
});
}
}
//Callback function
if (typeof tweetMachine.callback === "function") {
if(typeof tweets === 'undefined' || typeof tweetsDisplayed === 'undefined' ) {
tweets = null;
tweetsDisplayed = 0;
}
tweetMachine.callback(tweets, tweetsDisplayed);
}
});
}
/* TODO: Implement an "x new Tweets, click to refresh" link if auto refresh is turned off
else {
}
*/
},
// Start refreshing
start: function () {
var tweetMachine;
tweetMachine = this;
// If there's no interval yet
if (!this.interval) {
// Create an interval to refresh after the rate has passed
this.interval = setInterval(function () {
tweetMachine.refresh();
}, tweetMachine.settings.rate);
// Start refreshing with the firstLoad flag = true
this.refresh(true);
}
},
// Stop refreshing
stop: function () {
var tweetMachine;
tweetMachine = this;
// If there is an interval
if (tweetMachine.interval) {
// Clear it
clearInterval(tweetMachine.interval);
// Remove the reference to it
tweetMachine.interval = false;
}
},
// Clear all tweets
clear: function () {
var tweetMachine;
tweetMachine = this;
// Remove all tweets
$(tweetMachine.container).find('.tweet').remove();
// Set the lastTweetID to null so we start clean next time
tweetMachine.lastTweetID = null;
}
};
// Save a global tweetMachine object
tweetMachine = this.tweetMachine;
// Create an interval to update the timestamps
this.timeInterval = setInterval(function () {
tweetMachine.updateTimestamps();
}, tweetMachine.settings.rate);
// Start the Machine!
this.tweetMachine.start();
}
});
};
})(jQuery);// JavaScript Document