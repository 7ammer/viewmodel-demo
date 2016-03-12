if (Meteor.isClient) {

    var localColl;
    function myLocalCollection(){
        localColl = new Mongo.Collection(null);
        localColl.insert({item:"foo", foo:{title:"hello moon", alignment: "left"}});
        localColl.insert({item:"bar", bar:{text:"What's your favorite bar?", chocolate:"Twix"}});
        localColl.insert({item:"foo", foo:{title:"hello sun", alignment: "top"}});
        return localColl.find({});
    };

    Template.demoVM.viewmodel({
        title: "hello world",
        array: myLocalCollection(),
        loadSampleData: function() {
            this.load(myLocalCollection());
        },
        events: {
            'click #submit': function(event, templateInstance) {
                var obj = this.data();
                obj.array = obj.array.fetch();
                console.log(obj);
            },
            'click [data-add]': function(evt, templateInstance) {
                localColl.insert({item: evt.currentTarget.value});
            },
            'click [move-up]': function(evt, templateInstance) {
                console.log(evt, templateInstance);
            },
            'click [move-down]': function(evt, templateInstance) {
                console.log(evt, templateInstance);
            },
        }
    });
}
