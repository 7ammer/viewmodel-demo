if (Meteor.isClient) {

  localColl = new Mongo.Collection(null);
  localColl.insert({item:"foo", itemData:{title:"hello moon", alignment: "left"}});
  localColl.insert({item:"bar", itemData:{text:"What's your favorite bar?", chocolate:"Twix"}});
  localColl.insert({item:"foo", itemData:{title:"hello sun", alignment: "top"}});

  Template.demoVM.viewmodel({
    title: "hello world",
    collection() {
      return localColl.find();
    },
    submit(){
      alert("Submit!");
      console.log(localColl.find({}).fetch());
    },
    addFoo(){
      localColl.insert({
        item: 'foo',
        itemData: {
          title: '',
          alignment: ''
        }
      })
    },
    addBar(){
      localColl.insert({
        item: 'bar',
        itemData: {
          text: '',
          chocolate: ''
        }
      })
    }
  });

  Template.arrayItem.viewmodel({
    delete() {
      localColl.remove({ _id: this._id() });
    }
  });

  ViewModel.mixin({
    saveProps: {
      save() {
        localColl.update(this.parent()._id(), { $set: { itemData: this.data() }});
      }
    }
  })

  Template.foo.viewmodel({
    mixin: 'saveProps'
  });
  Template.bar.viewmodel({
    mixin: 'saveProps'
  });
}
