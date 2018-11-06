const firebase = require('firebase');

function FirebaseHelper(config) {
  firebase.initializeApp(config);
}

FirebaseHelper.prototype.signIn = (email, password, callback) => {
  firebase.auth().signInWithEmailAndPassword(email, password).catch((err) => {
    return callback(err);
  });
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      return callback(null, user);
    }
  });
}

FirebaseHelper.prototype.signOut = (callback) => {
  firebase.auth().signOut().then(() => {
    callback(null);
  }).catch((err) => {
    callback(err);
  });
}

FirebaseHelper.prototype.getCurrentUser = () => {
  return firebase.auth().currentUser;
}

function restoreQuoteToNewQuotes(submission, callback) {
  firebase.database().ref('NewQuotes/' + submission.id).set(submission, (err) => {
    callback(err);
  });
}

function removeQuoteFromNewQuotes(id) {
  firebase.database().ref('NewQuotes/' + id).remove();
}

FirebaseHelper.prototype.retrieveAllNewQuotes = (callback) => {
  firebase.database().ref('/NewQuotes').once('value').then((snapshot) => {
    callback(snapshot.val());
  });
}

FirebaseHelper.prototype.clearCache = () => {
  firebase.database().ref('TempQuotes').remove();
}

FirebaseHelper.prototype.submitQuote = (submission, callback) => {
  var alteredId = "\" " + submission.id + "\"";

  firebase.database().ref('Quotes/' + alteredId).set(submission, (err) => {
    if (err) {
      return callback(err);
    } else {
      removeQuoteFromNewQuotes.call(this, submission.id);
      return callback(null);
    }
  });
}

FirebaseHelper.prototype.deleteQuote = (submission, callback) => {
  // cache quote for undo
  firebase.database().ref('TempQuotes/' + submission.id).set(submission, (err) => {
    if (err) {
      callback(err);
    } else {
      removeQuoteFromNewQuotes.call(this, submission.id);
      callback(null);
    }
  });
}

FirebaseHelper.prototype.undoDelete = (id, callback) => {
  // retrieve quote from cache
  firebase.database().ref('TempQuotes/' + id).once('value').then((snapshot) => {
    restoreQuoteToNewQuotes.call(this, snapshot.val(), callback);
  });
}

FirebaseHelper.prototype.undoSubmit = (id, callback) => {
  var alteredId = "\" " + id + "\"";

  firebase.database().ref('Quotes/' + alteredId).once('value').then((snapshot) => {
    restoreQuoteToNewQuotes.call(this, snapshot.val(), (err) => {
      if (err) {
        return callback(err);
      } else {
        firebase.database().ref('Quotes/' + alteredId).remove();
        return callback(null);
      }
    });
  });
}

module.exports = FirebaseHelper;
