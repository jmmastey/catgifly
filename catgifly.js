if (Meteor.isClient) {
  Session.setDefault("cat_src", "http://i.imgur.com/Fj0JIOl.gif");

  Template.cat_gif.helpers({
    src: function() { return Session.get("cat_src") }
  });

  Template.cat_switcher.events({
    "submit .switcher": function(event) {
      Meteor.call("getNewCat", function(err, res) { Session.set("cat_src", res) });
      return false;
    }
  });
}

if (Meteor.isServer) {
  var limit         = 100;
  var current_cats  = [];
  var processResult = function(res) {
    if(!/imgur.com/.test(res.data.url)) { return '' }
    return res.data.url
               .replace('http://imgur.com', 'http://i.imgur.com')
               .replace('gallery/', '')
               .replace(/(.gif)?$/, '.gif')
  }

  var reloadCats = function() {
    Reddit.r('catgifs').hot().limit(limit, function(err, data, res) {
      current_cats = data.data.children.map(processResult)
                      .filter(function(img) { return img != '' })
    });
  };

  Meteor.startup(function() {
    reloadCats();

    Meteor.methods({
      getNewCat: function() {
        if(Math.random() < 0.1) { reloadCats(); } // occasionally reload...

        var idx = Math.floor(Math.random() * current_cats.length)
        return current_cats[idx]
      },
    });
  })
}
