  Meteor.subscribe("documents");
  Meteor.subscribe("editingUsers");
  Meteor.subscribe("comments");


  Router.configure({
    layoutTemplate: 'ApplicationLayout'
  });


  Router.route('/', function(){
    console.log("you hit /");
    this.render("navbar", {to:"header"});
    this.render("docList", {to:"main"});
  });

    Router.route('/documents/:_id', function(){
    console.log("you hit /documents " + this.params._id);
    Session.set("docid", this.params._id);
    this.render("navbar", {to:"header"});
    this.render("docItem", {to:"main"});
  });





  Template.editor.helpers({
    docid:function(){

      setupCurrentDocument();
      return Session.get("docid");
    },
    config:function(){
      return function(editor){
        editor.setOption("lineNumbers", true);
        editor.setOption("theme", "cobalt");
        editor.on("change", function(cm_editor, info){
          console.log(cm_editor.getValue());
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
          Meteor.call("addEditingsUser", Session.get("docid"));
        });

      }

    },



  });

  Template.editingUsers.helpers({
    users:function(){
      var doc, eusers, users;
      doc = Documents.findOne({_id:Session.get("docid")});
      if (!doc) {return;} // give up doc
      eusers = EditingUsers.findOne({docid:doc._id});
      if (!eusers) {return;} // give up eusers
      users = new Array();
      var i = 0;
      for (var user_id in eusers.users) {
        users[i] = fixObjectKeys(eusers.users[user_id]);
        i++;
      };

      return users;

    }
  })

  Template.navbar.helpers({
    documents:function(){
      return Documents.find();
    }
  })



  Template.docMeta.helpers({
    document:function(){
      return Documents.findOne({_id: Session.get("docid")});
    },
    canEdit:function(){
      var doc;
      doc = Documents.findOne({_id: Session.get("docid")});
      if (doc) {
        if (doc.owner == Meteor.userId()) {
          return true;
        }
      }
      return false;
    } 
  })

  Template.editableText.helpers({
    userCanEdit:function(doc, Collection){
      doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()});
      if (doc) {
        return true;
      } else {
        return false;
      }
    }
  })

  Template.docList.helpers({
    documents:function(){
      return Documents.find();
    }
  })

  Template.insertCommentForm.helpers({
    docid:function(){
      return Session.get("docid");
    }
  })

  Template.commentList.helpers({
    comments:function(){
      return Comments.find({docid:Session.get("docid")});
    }
  })


  /////////
  /// EVENTS
  ////////

  Template.navbar.events({
    "click .js-add-doc":function(event){
      event.preventDefault();
      console.log("New doc!");
      if (!Meteor.user()){// logining check
          alert("You need to login first");
      } else {// everything is OK
        var id = Meteor.call("addDoc", function(err, res){
          if(!err){// all good
            console.log("event callback res id: " + res);
            Session.set("docid", res);
          }
        });
      }
    },
    "click .js-load-doc":function(event){
      console.log(this);
      Session.set("docid", this._id);
    }

  })

  Template.docMeta.events({
    "click .js-tog-private":function(event){
      console.log(event.target.checked);
      var doc = {_id:Session.get("docid"), isPrivate:event.target.checked};
      Meteor.call("updateDocPrivacy", doc);
    }

  })



function setupCurrentDocument(){
  var doc;
  if (!Session.get("docid")){
    doc = Documents.findOne();
    if (doc){
      Session.set("docid", doc._id);
    }
  }
} 

 function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
 }; 

